import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../model/event.model';
import { TicketService } from '../../ticket/services/ticket.service';
import { TCreateEvent, TEvent } from '../types/event.types';
import { TCreateTicket, TICKET_STATUS } from '../../ticket/types/ticket.types';
import { processInBatches } from '../../utils/utils';
import { Ticket } from '../../ticket/model/ticket.model';
import { TicketStatusLog } from '../../ticket/model/ticket-status-log.model';
import { TicketStatus } from '../../ticket/model/ticket-status.model';
import { getSoldTicketsTotal, getTicketsFormatted } from '../utils/utils';
import { Transaction } from 'sequelize';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event) private readonly eventRepository: typeof Event,
    @Inject(TicketService) private readonly ticketService: TicketService,
  ) {}

  async getAllEvents(): Promise<TEvent[]> {
    const events = await this.eventRepository.findAll({
      where: { deletedAt: null },
      include: [
        {
          model: Ticket,
          where: { deletedAt: null },
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

    const newEvents: TEvent[] = events.map((event) => {
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

    return newEvents;
  }

  async getEventById(eventId: string): Promise<TEvent> {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, deletedAt: null },
      include: [
        {
          model: Ticket,
          where: { deletedAt: null },
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

      this.validateDate(startDate, endDate);

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

      return { message: `Event created successfully with id ${event.id}` };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async updateEvent(eventId: string, data: TCreateEvent) {
    const transaction = await this.eventRepository.sequelize.transaction();
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      include: [
        {
          model: Ticket,
          where: { deletedAt: null },
          include: [
            {
              model: TicketStatusLog,
              where: { validUntil: null },
              include: [{ model: TicketStatus, attributes: ['name'] }],
            },
          ],
        },
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${eventId} not found`);
    }

    try {
      const { name, numberOfTotalTickets, startDate, endDate } = data;

      this.validateDate(startDate, endDate);

      const ticketsSolds = getSoldTicketsTotal(event.tickets);

      const newRemainingTickets = numberOfTotalTickets - ticketsSolds;

      await this.eventRepository.update(
        {
          name,
          numberOfTotalTickets,
          remainingTickets: newRemainingTickets,
          startDate,
          endDate,
        },
        { where: { id: eventId }, transaction },
      );

      if (numberOfTotalTickets > event.numberOfTotalTickets) {
        await this.addTicketsToEvent(numberOfTotalTickets, event, transaction);
      } else if (numberOfTotalTickets < event.numberOfTotalTickets) {
        await this.removeTicketsFromEvent(
          numberOfTotalTickets,
          event,
          transaction,
        );
      }
      await transaction.commit();
      return { message: 'Event updated successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private async addTicketsToEvent(
    numberOfTotalTickets: number,
    event: Event,
    ts?: Transaction,
  ) {
    const transaction = !ts
      ? await this.eventRepository.sequelize.transaction()
      : ts;

    try {
      const ticketsToCreate: TCreateTicket[] = Array.from(
        { length: numberOfTotalTickets - event.numberOfTotalTickets },
        () => ({
          eventId: event.id,
          isAvailable: true,
        }),
      );
      await processInBatches(ticketsToCreate, (ticketToCreate) => {
        return this.ticketService.createTicket(ticketToCreate, transaction);
      });
      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }

  private async removeTicketsFromEvent(
    numberOfTotalTickets: number,
    event: Event,
    ts: Transaction,
  ) {
    const transaction = !ts
      ? await this.eventRepository.sequelize.transaction()
      : ts;
    try {
      const ticketsSold = getSoldTicketsTotal(event.tickets);

      if (ticketsSold > numberOfTotalTickets) {
        throw new BadRequestException(
          'Cannot remove tickets with sold tickets',
        );
      }

      const ticketsPending = event.tickets.filter(
        (ticket) =>
          ticket.isAvailable &&
          ticket.logs[0].ticketStatus.name === TICKET_STATUS.PENDING,
      );

      const diffTicketsNumber =
        event.numberOfTotalTickets - numberOfTotalTickets;

      const ticketsToDelete = ticketsPending.slice(0, diffTicketsNumber);

      await processInBatches(ticketsToDelete, (ticket) =>
        this.ticketService.deleteTicketById(ticket.id, transaction),
      );
      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }

  async deleteEvent(eventId: string) {
    const transaction = await this.eventRepository.sequelize.transaction();

    try {
      const currentDateTime = new Date();
      const event = await this.eventRepository.findOne({
        where: { id: eventId },
        include: [
          {
            model: Ticket,
            where: { deletedAt: null },
            include: [
              {
                model: TicketStatusLog,
                where: { validUntil: null },
                include: [{ model: TicketStatus, attributes: ['name'] }],
              },
            ],
          },
        ],
      });

      if (!event) {
        throw new NotFoundException(`Event with id ${eventId} not found`);
      }

      const soldTickets = getSoldTicketsTotal(event.tickets);

      if (event.endDate < currentDateTime || soldTickets > 0) {
        throw new BadRequestException(
          'Cannot delete event with sold tickets or past end date',
        );
      }

      await this.eventRepository.update(
        {
          deletedAt: currentDateTime,
        },
        { where: { id: eventId }, transaction },
      );

      await this.ticketService.deleteAllTicketsByEventId(eventId, transaction);

      await transaction.commit();

      return { message: 'Event deleted successfully' };
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

  private validateDate(startDate: Date, endDate: Date) {
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  }
}
