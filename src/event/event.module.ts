import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './model/event.model';
import { EventService } from './services/event.service';
import { TicketModule } from '../ticket/ticket.module';
import { EventController } from './controllers/event.controller';

@Module({
  imports: [SequelizeModule.forFeature([Event]), TicketModule],
  providers: [EventService],
  controllers: [EventController],
})
export class EventModule {}
