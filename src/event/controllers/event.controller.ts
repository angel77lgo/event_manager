import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { EventService } from '../services/event.service';
import { TCreateEvent } from '../types/event.types';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EventService) private readonly eventService: EventService,
  ) {}

  @Post()
  async createEvent(@Body() data: TCreateEvent) {
    return await this.eventService.createEvent(data);
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
