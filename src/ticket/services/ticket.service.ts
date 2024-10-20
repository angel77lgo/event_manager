import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Ticket } from '../model/ticket.model';
import {
  TCreateTicket,
  TCreateTicketOptional,
  TICKET_STATUS,
  TICKETS_NOT_AVALIABLE,
} from '../types/ticket.types';
import { Transaction, where } from 'sequelize';
import { TicketStatusLogService } from './ticket-status-log.service';
import { TicketStatusService } from './ticket-status.service';
import { TicketStatusLog } from '../model/ticket-status-log.model';
import { TicketStatus } from '../model/ticket-status.model';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket) private readonly ticketRepository: typeof Ticket,
    @Inject(TicketStatusLogService)
    private readonly ticketStatusLogService: TicketStatusLogService,
    @Inject(TicketStatusService)
    private readonly ticketStatusService: TicketStatusService,
  ) {}

  async createTicket(data: TCreateTicket, ts?: Transaction): Promise<Ticket> {
    const transaction = !ts
      ? await this.ticketRepository.sequelize.transaction()
      : ts;

    try {
      const { eventId, isAvailable } = data;

      const ticket = await this.ticketRepository.create(
        { eventId, isAvailable },
        { transaction },
      );

      const ticketStatus = await this.ticketStatusService.findByName(
        TICKET_STATUS.PENDING,
      );

      await this.ticketStatusLogService.create(
        { ticketId: ticket.id, ticketStatusId: ticketStatus.id },
        transaction,
      );

      if (!ts) await transaction.commit();

      return ticket;
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }

  async soldTicket(ticketId: string, ts?: Transaction) {
    const transaction = !ts
      ? await this.ticketRepository.sequelize.transaction()
      : ts;

    const ticketStatus = await this.ticketStatusService.findByName(
      TICKET_STATUS.SOLD,
    );

    const ticket = await this.getTicketWithStatusById(ticketId);

    this.validateTicketToSold(ticket, ticketId);

    try {
      await this.ticketStatusLogService.create(
        { ticketId, ticketStatusId: ticketStatus.id },
        transaction,
      );

      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw new HttpException(
        `Error processing ticket ${ticketId}: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async redeemTicket(ticketId: string, ts?: Transaction) {
    const transaction = !ts
      ? await this.ticketRepository.sequelize.transaction()
      : ts;

    const ticketStatus = await this.ticketStatusService.findByName(
      TICKET_STATUS.REDEEMED,
    );

    const ticket = await this.getTicketWithStatusById(ticketId);

    console.log('ticket', ticket);

    this.validateTicketToRedeem(ticket, ticketId);

    try {
      await this.ticketRepository.update(
        { isAvailable: false },
        { where: { id: ticketId }, transaction },
      );

      await this.ticketStatusLogService.create(
        { ticketId, ticketStatusId: ticketStatus.id },
        transaction,
      );
      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }

  private async getTicketWithStatusById(ticketId: string): Promise<Ticket> {
    return await this.ticketRepository.findOne({
      attributes: ['id', 'isAvailable'],
      where: { id: ticketId },
      include: [
        {
          model: TicketStatusLog,
          attributes: ['id', 'validUntil'],
          where: { validUntil: null },
          include: [{ model: TicketStatus, attributes: ['name'] }],
        },
      ],
      logging: true,
    });
  }

  private validateTicketToSold(ticket: Ticket, ticketId: string) {
    if (!ticket) {
      throw new HttpException(`Ticket ${ticketId} not found`, 404);
    }

    const statusName = ticket.logs[0].ticketStatus.name as TICKET_STATUS;

    if (!ticket.isAvailable || TICKETS_NOT_AVALIABLE.includes(statusName)) {
      throw new BadRequestException(
        `The ticket with id ${ticketId} is not available or has been redeemed or sold`,
      );
    }
  }

  private validateTicketToRedeem(ticket: Ticket, ticketId: string) {
    if (!ticket) {
      throw new HttpException(`Ticket ${ticketId} not found`, 404);
    }

    const statusName = ticket.logs[0].ticketStatus.name as TICKET_STATUS;

    console.log('statusName', statusName);

    if (
      !ticket.isAvailable &&
      statusName !== TICKET_STATUS.PENDING &&
      statusName !== TICKET_STATUS.REDEEMED
    ) {
      throw new BadRequestException(
        `The ticket with id ${ticketId} is not available or has not been sold`,
      );
    }
  }
}
