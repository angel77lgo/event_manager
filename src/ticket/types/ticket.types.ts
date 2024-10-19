import { Optional } from 'sequelize';

export interface TCreateTicketLog {
  ticketId: string;
  ticketStatusId: string;
}

export interface TCreateTicket {
  id?: number;
  eventId: number;
  isAvailable: boolean;
}

export type TCreateTicketOptional = Optional<TCreateTicket, 'id'>;

export enum TICKET_STATUS {
  PENDING = 'pending',
  SOLD = 'sold',
  REDEEMED = 'redeemed',
}
