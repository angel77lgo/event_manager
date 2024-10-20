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
import { Ticket } from '../../ticket/model/ticket.model';

@Table({ tableName: 'Event' })
export class Event extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUID, defaultValue: uuidv4 })
  id: string;

  @Column({ type: DataTypes.TEXT, allowNull: false })
  name: string;

  @Column({ type: DataTypes.INTEGER, allowNull: false })
  numberOfTotalTickets: number;

  @Column({ type: DataTypes.INTEGER, allowNull: false })
  remainingTickets: number;

  @Column({ type: DataTypes.DATE, allowNull: false })
  startDate: Date;

  @Column({ type: DataTypes.DATE, allowNull: false })
  endDate: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  createdAt: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  updatedAt: Date;

  @Column({ allowNull: true })
  deletedAt: Date;
}
