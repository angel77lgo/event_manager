import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  UsePipes,
} from '@nestjs/common';
import { EventService } from '../services/event.service';
import { TCreateEvent } from '../types/event.types';
import { JoiValidationPipe } from '../../utils/utils';
import { eventSchema } from '../schemas/event.joi.schema';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EventService) private readonly eventService: EventService,
  ) {}

  @Post()
  async createEvent(
    @Body(new JoiValidationPipe(eventSchema)) data: TCreateEvent,
  ) {
    return await this.eventService.createEvent(data);
  }

  @Put(':eventId')
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body(new JoiValidationPipe(eventSchema)) data: TCreateEvent,
  ) {
    return await this.eventService.updateEvent(eventId, data);
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: string) {
    return await this.eventService.deleteEvent(eventId);
  }

  @Put('/ticket/sold/:ticketId')
  async soldTicket(@Param('ticketId') ticketId: string) {
    return await this.eventService.soldTicket(ticketId);
  }

  @Put('/ticket/reedemed/:ticketId')
  async reedemedTicket(@Param('ticketId') ticketId: string) {
    return await this.eventService.reedemedTicket(ticketId);
  }

  @Get()
  async getEvents() {
    return await this.eventService.getAllEvents();
  }

  @Get('/:eventId')
  async getEvent(@Param('eventId') eventId: string) {
    return await this.eventService.getEventById(eventId);
  }
}
