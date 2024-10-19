import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export = {
  async up(queryInterface: QueryInterface) {
    const status = [
      {
        id: uuidv4(),
        name: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'sold',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        name: 'reedemed',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    await queryInterface.bulkInsert('TicketStatus', status);
  },

  async down(queryInterface: QueryInterface) {
    // borra todos los registros de la tabla TicketStatus (opcional)
    await queryInterface.bulkDelete('TicketStatus', {});
  },
};
