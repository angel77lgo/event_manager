import { Optional } from 'sequelize';

export interface TCreateTicketLog {
  ticketId: string;
  ticketStatusId: string;
}

export interface TCreateTicket {
  id?: number;
  eventId: string;
  isAvailable: boolean;
}

export type TCreateTicketOptional = Optional<TCreateTicket, 'id'>;

export enum TICKET_STATUS {
  PENDING = 'pending',
  SOLD = 'sold',
  REDEEMED = 'reedemed',
}

export const TICKETS_NOT_AVALIABLE = [
  TICKET_STATUS.SOLD,
  TICKET_STATUS.REDEEMED,
];

export interface TTicketDto {
  id: string;
  isAvailable: boolean;
  status: string;
}

export interface TTicketDetailDto {
  ticketsSold: number;
  ticketsRedeemed: number;
  tickets: TTicketDto[];
}
