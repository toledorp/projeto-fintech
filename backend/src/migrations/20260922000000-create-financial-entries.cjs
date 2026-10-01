'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('financial_entries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      descricao: { allowNull: false, type: Sequelize.STRING(200) },
      valor: { allowNull: false, type: Sequelize.DECIMAL(12, 2) },
      tipo: { allowNull: false, type: Sequelize.ENUM('RECEITA', 'DESPESA') },
      categoria: { allowNull: false, type: Sequelize.STRING(80) },
      data_lancamento: { allowNull: false, type: Sequelize.DATEONLY },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('financial_entries');
  },
};
