import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../model/event.model';
import { TicketService } from '../../ticket/services/ticket.service';
import { TCreateEvent } from '../types/event.types';
import { TCreateTicket, TICKET_STATUS } from '../../ticket/types/ticket.types';
import { processInBatches } from '../../utils/utils';
import { Ticket } from '../../ticket/model/ticket.model';
import { TicketStatusLog } from '../../ticket/model/ticket-status-log.model';
import { TicketStatus } from '../../ticket/model/ticket-status.model';
import { getTicketsFormatted } from '../utils/utils';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event) private readonly eventRepository: typeof Event,
    @Inject(TicketService) private readonly ticketService: TicketService,
  ) {}

  async getAllEvents() {
    const events = await this.eventRepository.findAll({
      where: { deletedAt: null },
      include: [
        {
          model: Ticket,
          include: [
            {
              model: TicketStatusLog,
              where: { validUntil: null },
              include: [TicketStatus],
            },
          ],
        },
      ],
    });

    const newEvents = events.map((event) => {
      const ticketsInfo = getTicketsFormatted(event.tickets);

      const { ticketsSold, ticketsRedeemed, tickets } = ticketsInfo;

      return {
        id: event.id,
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        totalTickets: event.numberOfTotalTickets,
        remainingTickets: event.remainingTickets,
        ticketsSold,
        ticketsRedeemed,
        tickets,
      };
    });

    return { events: newEvents };
  }

  async getEventById(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, deletedAt: null },
      include: [
        {
          model: Ticket,
          include: [
            {
              model: TicketStatusLog,
              where: { validUntil: null },
              include: [TicketStatus],
            },
          ],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    const ticketsInfo = getTicketsFormatted(event.tickets);

    const { ticketsSold, ticketsRedeemed, tickets } = ticketsInfo;

    return {
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      totalTickets: event.numberOfTotalTickets,
      remainingTickets: event.remainingTickets,
      ticketsSold,
      ticketsRedeemed,
      tickets,
    };
  }

  async createEvent(data: TCreateEvent) {
    const transaction = await this.eventRepository.sequelize.transaction();

    try {
      const { name, numberOfTotalTickets, startDate, endDate } = data;

      const event = await this.eventRepository.create(
        {
          name,
          numberOfTotalTickets,
          remainingTickets: numberOfTotalTickets,
          startDate,
          endDate,
        },
        { transaction },
      );

      // Crear los tickets en lotes
      const ticketsToCreate: TCreateTicket[] = Array.from(
        { length: numberOfTotalTickets },
        () => ({
          eventId: event.id, // Asumiendo que este campo es obligatorio
          isAvailable: true, // Asumiendo que este campo también es obligatorio
          // Si tienes otros campos obligatorios en TCreateTicket, añádelos aquí.
        }),
      );

      //Procesar los tickets en lotes
      await processInBatches(ticketsToCreate, (ticketToCreate) => {
        return this.ticketService.createTicket(ticketToCreate, transaction);
      });

      await transaction.commit();

      return { message: 'Event created successfully', event };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async soldTicket(ticketId: string) {
    const transaction = await this.eventRepository.sequelize.transaction();

    try {
      const event = await this.getEventByTicketId(ticketId);

      this.validateEventisAvailable(event);

      await this.ticketService.soldTicket(ticketId, transaction);

      await this.eventRepository.update(
        { remainingTickets: event.remainingTickets - 1 },
        { where: { id: event.id }, transaction },
      );
      transaction.commit();

      return { message: 'Ticket sold successfully' };
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  async reedemedTicket(ticketId: string) {
    const transaction = await this.eventRepository.sequelize.transaction();

    const event = await this.getEventByTicketId(ticketId);

    this.validateEventisAvailable(event);

    try {
      await this.ticketService.redeemTicket(ticketId, transaction);

      await transaction.commit();

      return { message: 'Ticket reedemed successfully' };
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  private async getEventByTicketId(ticketId: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      include: [
        {
          model: Ticket,
          where: { id: ticketId },
        },
      ],
    });

    if (!event) {
      throw new BadRequestException(
        `Event with ticket id ${ticketId} not found`,
      );
    }

    return event;
  }

  private validateEventisAvailable(event: Event) {
    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.remainingTickets <= 0) {
      throw new BadRequestException('No tickets available');
    }
  }
}
