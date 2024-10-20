import { Ticket } from '../../ticket/model/ticket.model';
import {
  TICKET_STATUS,
  TTicketDetailDto,
  TTicketDto,
} from '../../ticket/types/ticket.types';

export const getTicketsFormatted = (tickets: Ticket[]): TTicketDetailDto => {
  let numberOfSoldTickets = 0;
  let numberOfRedeemedTickets = 0;

  const newTickets = tickets.map((ticket) => {
    const { id, isAvailable, logs } = ticket;
    const status = logs[0].ticketStatus.name;

    if (status === TICKET_STATUS.SOLD) {
      numberOfSoldTickets++;
    } else if (status === TICKET_STATUS.REDEEMED) {
      numberOfRedeemedTickets++;
    }

    return {
      id,
      isAvailable,
      status,
    };
  });

  return {
    ticketsSold: numberOfSoldTickets,
    ticketsRedeemed: numberOfRedeemedTickets,
    tickets: newTickets,
  };
};

export const getSoldTicketsTotal = (tickets: Ticket[]): number => {
  return tickets.filter(
    (ticket) => ticket.logs[0].ticketStatus.name === TICKET_STATUS.SOLD,
  ).length;
};
