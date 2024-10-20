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
import { TCreateEvent, TEvent } from '../types/event.types';
import { JoiValidationPipe } from '../../utils/utils';
import { eventSchema } from '../schemas/event.joi.schema';
import { ApiOkResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('event')
@ApiTags('Event')
export class EventController {
  constructor(
    @Inject(EventService) private readonly eventService: EventService,
  ) {}

  @Post()
  @ApiResponse({
    status: 201,
    example: {
      message: 'Event created successfully with id 1221-1211-2331-1221',
    },
  })
  async createEvent(
    @Body(new JoiValidationPipe(eventSchema)) data: TCreateEvent,
  ) {
    return await this.eventService.createEvent(data);
  }

  @Put(':eventId')
  @ApiResponse({
    status: 200,
    example: { message: 'Event updated successfully' },
  })
  async updateEvent(
    @Param('eventId') eventId: string,
    @Body(new JoiValidationPipe(eventSchema)) data: TCreateEvent,
  ) {
    return await this.eventService.updateEvent(eventId, data);
  }

  @Delete(':eventId')
  @ApiResponse({
    status: 200,
    example: { message: 'Event deleted successfully' },
  })
  async deleteEvent(@Param('eventId') eventId: string) {
    return await this.eventService.deleteEvent(eventId);
  }

  @Put('/ticket/sold/:ticketId')
  @ApiResponse({ example: { message: 'Ticket sold successfully' } })
  async soldTicket(@Param('ticketId') ticketId: string) {
    return await this.eventService.soldTicket(ticketId);
  }

  @Put('/ticket/reedemed/:ticketId')
  @ApiResponse({ example: { message: 'Ticket reedemed successfully' } })
  async reedemedTicket(@Param('ticketId') ticketId: string) {
    return await this.eventService.reedemedTicket(ticketId);
  }

  @Get()
  @ApiOkResponse({ status: 200, type: [TEvent] })
  async getEvents(): Promise<TEvent[]> {
    return await this.eventService.getAllEvents();
  }

  @Get('/:eventId')
  @ApiResponse({ status: 200, type: TEvent })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async getEvent(@Param('eventId') eventId: string): Promise<TEvent> {
    return await this.eventService.getEventById(eventId);
  }
}
