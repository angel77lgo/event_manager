import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TicketStatus } from '../model/ticket-status.model';

@Injectable()
export class TicketStatusService {
  constructor(
    @InjectModel(TicketStatus)
    private readonly ticketStatusRepository: typeof TicketStatus,
  ) {}

  async findByName(name: string): Promise<TicketStatus> {
    console.log('name:', name);
    const ticketStatus = await this.ticketStatusRepository.findOne({
      where: { name },
      logging: true,
    });

    console.log('ticketStatus:', ticketStatus);

    if (!ticketStatus) {
      throw new Error(`Ticket status with name ${name} not found`);
    }

    return ticketStatus;
  }
}
