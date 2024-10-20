import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Event } from '../model/event.model';
import { TicketService } from '../../ticket/services/ticket.service';
import { TCreateEvent } from '../types/event.types';
import { TCreateTicket } from '../../ticket/types/ticket.types';
import { processInBatches } from '../../utils/utils';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event) private readonly eventRepository: typeof Event,
    @Inject(TicketService) private readonly ticketService: TicketService,
  ) {}

  async createEvent(data: TCreateEvent) {
    const transaction = await this.eventRepository.sequelize.transaction();

    try {
      console.log('Data:', data);
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
      const newTickets = await processInBatches(
        ticketsToCreate,
        (ticketToCreate) => {
          return this.ticketService.createTicket(ticketToCreate, transaction);
        },
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}
