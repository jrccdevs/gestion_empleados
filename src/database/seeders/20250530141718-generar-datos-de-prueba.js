'use strict';
const DepartamentoFactory = require('../factories/DepartamentoFactory');
const EmpleadoFactory = require('../factories/EmpleadoFactory');
const { Departamento, Empleado } = require('../../models'); // Importar modelos para consultas

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up (queryInterface, Sequelize) {
    console.log('Generando datos de prueba...');

    // 1. Crear departamentos
    const numDepartamentos = 3;
    const departamentosCreados = await DepartamentoFactory(numDepartamentos);
    console.log(`Creados ${departamentosCreados.length} departamentos.`);

    // 2. Crear empleados y asignarlos a departamentos
    const empleadosTotales = [];
    for (const dep of departamentosCreados) {
      // Crear un jefe para el departamento
      const jefeDepartamento = (await EmpleadoFactory(1, dep.id))[0];
      await dep.update({ jefe_departamento_id: jefeDepartamento.id }); // Asignar el jefe al departamento
      empleadosTotales.push(jefeDepartamento);
      console.log(`- Creado jefe para ${dep.nombre}: ${jefeDepartamento.nombre} ${jefeDepartamento.apellido}`);

      // Crear empleados subordinados para este jefe
      const numEmpleadosPorDepto = 5;
      const subordinados = await EmpleadoFactory(numEmpleadosPorDepto, dep.id, jefeDepartamento.id);
      empleadosTotales.push(...subordinados);
      console.log(`- Creados ${subordinados.length} empleados para ${dep.nombre} bajo ${jefeDepartamento.nombre}.`);
    }
    console.log(`Total de empleados creados: ${empleadosTotales.length}`);

    console.log('Datos de prueba generados exitosamente.');
  },

  async down (queryInterface, Sequelize) {
    console.log('Eliminando datos de prueba...');
    // Eliminar todos los empleados y departamentos
    await Empleado.destroy({ truncate: { cascade: true } }); // cascade: true si las FKs están bien definidas
    await Departamento.destroy({ truncate: { cascade: true } });
    console.log('Datos de prueba eliminados.');
  }
};