import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './model/ticket.model';
import { TicketStatus } from './model/event-status.model';
import { TicketStatusLog } from './model/event-status-log.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Ticket, TicketStatus, TicketStatusLog]),
  ],
})
export class TicketModule {}
