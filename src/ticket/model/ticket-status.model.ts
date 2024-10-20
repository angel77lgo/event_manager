import { DataTypes } from 'sequelize';
import {
  Column,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

import { v4 as uuidv4 } from 'uuid';
import { TicketStatusLog } from './ticket-status-log.model';

@Table({ tableName: 'TicketStatus' })
export class TicketStatus extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, defaultValue: uuidv4 })
  id: string;

  @Column({ type: DataTypes.STRING, allowNull: false })
  name: string;

  @HasMany(() => TicketStatusLog)
  logs: TicketStatusLog[];

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  createdAt: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  updatedAt: Date;

  @Column({ allowNull: true })
  deletedAt: Date;
}
