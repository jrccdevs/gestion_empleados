const { Empleado } = require('../../models');
const { faker } = require('@faker-js/faker');

module.exports = async (count = 1, departamentoId = null, supervisorId = null) => {
  const empleados = [];
  for (let i = 0; i < count; i++) {
    const gender = faker.helpers.arrayElement(['male', 'female']);
    const firstName = faker.person.firstName(gender);
    const lastName = faker.person.lastName(gender);
    const email = faker.internet.email({ firstName, lastName });
    const phoneNumber = faker.phone.number('###-###-####');
    const hireDate = faker.date.past({ years: 5 }).toISOString().split('T')[0];
    const jobTitle = faker.person.jobTitle();
    const status = faker.helpers.arrayElement(['activo', 'inactivo', 'en_vacaciones']);

    empleados.push({
      nombre: firstName,
      apellido: lastName,
      email: email,
      telefono: phoneNumber,
      fecha_ingreso: hireDate,
      puesto: jobTitle,
      estado: status,
      departamento_id: departamentoId, // Puede ser null o un ID específico
      supervisor_id: supervisorId,   // Puede ser null o un ID específico
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return await Empleado.bulkCreate(empleados);
};