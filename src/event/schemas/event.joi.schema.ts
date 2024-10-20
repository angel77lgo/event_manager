import * as Joi from 'joi';

export const eventSchema = Joi.object({
  name: Joi.string().required(),
  numberOfTotalTickets: Joi.number().required().min(1).max(300),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
});
