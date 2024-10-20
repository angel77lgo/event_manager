import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Ticket } from '../model/ticket.model';
import {
  TCreateTicket,
  TCreateTicketOptional,
  TICKET_STATUS,
} from '../types/ticket.types';
import { Transaction } from 'sequelize';
import { TicketStatusLogService } from './ticket-status-log.service';
import { TicketStatusService } from './ticket-status.service';

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

      console.log('tickerStatus:', ticketStatus);

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

    try {
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

  async redeemTicket(ticketId: string, ts?: Transaction) {
    const transaction = !ts
      ? await this.ticketRepository.sequelize.transaction()
      : ts;

    const ticketStatus = await this.ticketStatusService.findByName(
      TICKET_STATUS.REDEEMED,
    );

    try {
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
}
