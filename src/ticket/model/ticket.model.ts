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
import { TicketStatusLog } from './event-status-log.model';

@Table
export class Ticket extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, defaultValue: uuidv4 })
  id: string;

  @ForeignKey(() => Event)
  @Column({ type: DataTypes.UUID, allowNull: false })
  eventId: string;

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
