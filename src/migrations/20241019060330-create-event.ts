import { DataTypes, QueryInterface } from 'sequelize';

export = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('Event', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      numberOfTotalTickets: { type: DataTypes.INTEGER, allowNull: false },
      remainingTickets: { type: DataTypes.INTEGER, allowNull: false },
      startDate: { type: DataTypes.DATE, allowNull: false },
      endDate: { type: DataTypes.DATE, allowNull: false },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('Event');
  },
};
