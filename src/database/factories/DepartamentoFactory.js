const { Departamento } = require('../../models');
const { faker } = require('@faker-js/faker');

module.exports = async (count = 1) => {
  const departamentos = [];
  for (let i = 0; i < count; i++) {
    departamentos.push({
      nombre: faker.commerce.department() + ' ' + faker.string.uuid().substring(0, 4), // Para asegurar unicidad
      descripcion: faker.lorem.sentence(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return await Departamento.bulkCreate(departamentos);
};