import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TicketStatusLog } from '../model/ticket-status-log.model';
import { TCreateTicketLog } from '../types/ticket.types';
import { Transaction } from 'sequelize';

@Injectable()
export class TicketStatusLogService {
  constructor(
    @InjectModel(TicketStatusLog)
    private readonly ticketStatusLogRepository: typeof TicketStatusLog,
  ) {}

  async create(data: TCreateTicketLog, ts?: Transaction) {
    const transaction: Transaction = !ts
      ? await this.ticketStatusLogRepository.sequelize.transaction()
      : ts;

    try {
      const { ticketId, ticketStatusId } = data;

      const currentStatus = await this.ticketStatusLogRepository.findOne({
        where: { ticketId, validUntil: null },
      });

      if (currentStatus) {
        await this.deleteTicketStatus(currentStatus.id, transaction);
      }

      await this.ticketStatusLogRepository.create(
        { ticketId, ticketStatusId },
        { transaction },
      );

      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }

  async deleteTicketStatus(id: string, ts?: Transaction): Promise<void> {
    const transaction: Transaction = !ts
      ? await this.ticketStatusLogRepository.sequelize.transaction()
      : ts;

    try {
      await this.ticketStatusLogRepository.update(
        { validUntil: new Date() },
        { where: { id }, transaction },
      );

      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }

  async deleteLogByTicketId(ticketId: string, ts?: Transaction): Promise<void> {
    const transaction = !ts
      ? await this.ticketStatusLogRepository.sequelize.transaction()
      : ts;

    try {
      await this.ticketStatusLogRepository.update(
        {
          deletedAt: new Date(),
        },
        { where: { ticketId }, transaction },
      );
      if (!ts) await transaction.commit();
    } catch (error) {
      if (!ts) await transaction.rollback();
      throw error;
    }
  }
}
