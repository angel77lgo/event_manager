import { DataTypes, Model } from 'sequelize';
import { Column, Default, PrimaryKey, Table } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table
export class Event extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column({ type: DataTypes.UUIDV4, defaultValue: uuidv4 })
  id: string;

  @Column({ type: DataTypes.TEXT, allowNull: false })
  name: string;

  @Column({ type: DataTypes.INTEGER, allowNull: false })
  numberOfTickets: number;

  @Column({ type: DataTypes.DATE, allowNull: false })
  startDate: Date;

  @Column({ type: DataTypes.DATE, allowNull: false })
  endDate: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  createdAt: Date;

  @Column({ type: DataTypes.DATE, defaultValue: DataTypes.NOW })
  updatedAt: Date;

  @Column({ allowNull: true })
  deletedAt: Date;
}
