import { DataTypes } from 'sequelize';
import {
  BelongsTo,
  Column,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { v4 as uuidv4 } from 'uuid';
import { Event } from '../../event/model/event.model';
import { TicketStatusLog } from './ticket-status-log.model';

@Table({ tableName: 'Ticket' })
export class Ticket extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, defaultValue: uuidv4 })
  id: string;

  @ForeignKey(() => Event)
  @Column({ type: DataTypes.UUID, allowNull: false })
  eventId: string;

  @Column({ type: DataTypes.BOOLEAN, allowNull: false })
  isAvailable: boolean;

  @BelongsTo(() => Event)
  event: Event;

  @HasMany(() => TicketStatusLog)
  logs: TicketStatusLog[];

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  createdAt: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  updatedAt: Date;

  @Column({ allowNull: true })
  deletedAt: Date;
}
