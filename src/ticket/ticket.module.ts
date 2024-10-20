import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Ticket } from './model/ticket.model';
import { TicketStatus } from './model/ticket-status.model';
import { TicketStatusLog } from './model/ticket-status-log.model';
import { TicketService } from './services/ticket.service';
import { TicketStatusLogService } from './services/ticket-status-log.service';
import { TicketStatusService } from './services/ticket-status.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Ticket, TicketStatus, TicketStatusLog]),
  ],
  providers: [TicketService, TicketStatusService, TicketStatusLogService],
  exports: [TicketService],
})
export class TicketModule {}
