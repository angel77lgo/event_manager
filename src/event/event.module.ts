import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Event } from './model/event.model';

@Module({
  imports: [SequelizeModule.forFeature([Event])],
})
export class EventModule {}
