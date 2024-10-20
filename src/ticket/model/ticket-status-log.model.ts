import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { v4 as uuidv4 } from 'uuid';
import { Ticket } from './ticket.model';
import { TicketStatus } from './ticket-status.model';

@Table({ tableName: 'TicketStatusLog' })
export class TicketStatusLog extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, defaultValue: uuidv4 })
  id: string;

  @ForeignKey(() => Ticket)
  @Column({ type: DataTypes.UUID, allowNull: false })
  ticketId: string;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => TicketStatus)
  @Column({ type: DataTypes.UUID, allowNull: false })
  ticketStatusId: string;

  @BelongsTo(() => TicketStatus)
  ticketStatus: TicketStatus;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  validUntil: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  createdAt: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  updatedAt: Date;

  @Column({ allowNull: true })
  deletedAt: Date;
}
