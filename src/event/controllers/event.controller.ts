import { Body, Controller, Inject, Post } from '@nestjs/common';
import { EventService } from '../services/event.service';
import { TCreateEvent } from '../types/event.types';

@Controller('event')
export class EventController {
  constructor(
    @Inject(EventService) private readonly eventService: EventService,
  ) {}

  @Post()
  async createEvent(@Body() data: TCreateEvent) {
    return this.eventService.createEvent(data);
  }
}
