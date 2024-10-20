export interface TCreateEvent {
  name: string;
  numberOfTotalTickets: number;
  remainingTickets?: number;
  startDate: Date;
  endDate: Date;
}
