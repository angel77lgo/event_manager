import { ApiProperty } from '@nestjs/swagger';

export class TCreateEvent {
  @ApiProperty({
    example: 'Event name',
    description: 'Name of the event',
    required: true,
  })
  name: string;

  @ApiProperty({
    example: 100,
    description: 'Number of total tickets',
    required: true,
  })
  numberOfTotalTickets: number;

  remainingTickets?: number;

  @ApiProperty({
    example: new Date(),
    description: 'Start date of the event',
    required: true,
  })
  startDate: Date;

  @ApiProperty({
    example: new Date(),
    description: 'End date of the event',
    required: true,
  })
  endDate: Date;
}

export class TTicketEvent {
  @ApiProperty({
    example: '13b4b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b',
    description: 'Ticket ID',
  })
  id: string;

  @ApiProperty({
    example: true,
    description: 'Is ticket available',
  })
  isAvailable: boolean;

  @ApiProperty({
    example: 'pending',
    description: 'Ticket status',
  })
  status: string;
}
export class TEvent {
  @ApiProperty({
    example: '13b4b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b',
    description: 'Event ID',
  })
  id: string;

  @ApiProperty({
    example: 'Event name',
    description: 'Name of the event',
  })
  name: string;

  @ApiProperty({
    example: new Date(),
    description: 'Start date of the event',
  })
  startDate: Date;

  @ApiProperty({
    example: new Date(),
    description: 'End date of the event',
  })
  endDate: Date;

  @ApiProperty({
    example: 100,
    description: 'Number of total tickets',
  })
  totalTickets: number;

  @ApiProperty({
    example: 50,
    description: 'Number of remaining tickets',
  })
  remainingTickets: number;

  @ApiProperty({
    example: 25,
    description: 'Number of tickets sold',
  })
  ticketsSold: number;

  @ApiProperty({
    example: 25,
    description: 'Number of tickets redeemed',
  })
  ticketsRedeemed: number;
  @ApiProperty({ type: [TTicketEvent] })
  tickets: TTicketEvent[];
}
