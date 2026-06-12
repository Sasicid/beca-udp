-- Datos de ejemplo para desarrollo. NO ejecutar en producción.
-- Refleja el ejemplo de la spec (corte 1 de abril, generaciones 2024-2026).

insert into generaciones (id, anio_ingreso) values
  ('11111111-1111-1111-1111-111111111124', 2024),
  ('11111111-1111-1111-1111-111111111125', 2025),
  ('11111111-1111-1111-1111-111111111126', 2026);

insert into hospitales (id, nombre, direccion, maps_url, contactos, indicaciones) values
  ('22222222-2222-2222-2222-222222222201', 'Hospital Sótero del Río',
   'Av. Concha y Toro 3459, Puente Alto, Santiago',
   'https://maps.google.com/?q=Hospital+Sotero+del+Rio',
   '[{"nombre":"Secretaría Urgencia","cargo":"Secretaría","telefono":"+56221234567"}]',
   'El Servicio de Urgencia está en el primer piso, entrada por calle interior. Presentarse en secretaría de Urgencia. Estacionamiento para becados en el sector B. Casino en el segundo piso del edificio central.'),
  ('22222222-2222-2222-2222-222222222202', 'Hospital Padre Hurtado',
   'Esperanza 2150, San Ramón, Santiago',
   'https://maps.google.com/?q=Hospital+Padre+Hurtado',
   '[{"nombre":"Jefatura Urgencia","cargo":"Jefe de Servicio","telefono":"+56227654321"}]',
   'Urgencia adulto por entrada principal, ala norte. Presentarse con la enfermera coordinadora del turno.');

insert into servicios (id, nombre, hospital_id, descripcion, color) values
  ('33333333-3333-3333-3333-333333333301', 'Urgencia Adulto', '22222222-2222-2222-2222-222222222201', 'Reanimación y box de urgencia adulto.', '#2563eb'),
  ('33333333-3333-3333-3333-333333333302', 'Urgencia Pediátrica', '22222222-2222-2222-2222-222222222201', 'Urgencia infantil.', '#16a34a'),
  ('33333333-3333-3333-3333-333333333303', 'UCI', '22222222-2222-2222-2222-222222222202', 'Unidad de paciente crítico.', '#dc2626'),
  ('33333333-3333-3333-3333-333333333304', 'Traumatología', '22222222-2222-2222-2222-222222222202', 'Urgencia traumatológica.', '#d97706'),
  ('33333333-3333-3333-3333-333333333305', 'Anestesia', '22222222-2222-2222-2222-222222222202', 'Manejo avanzado de vía aérea en pabellón.', '#7c3aed');

insert into fichas_rotacion (servicio_id, objetivos, antes_de_llegar, claves, errores_frecuentes, evaluaciones, contactos) values
  ('33333333-3333-3333-3333-333333333301',
   'Manejo inicial del paciente grave: triage, reanimación, decisión de hospitalización.',
   'Leer protocolo de reanimación local. Avisar al jefe de servicio por correo la semana previa. Día 1: presentarse 7:45 en secretaría de Urgencia.',
   'El reanimador se pasa a las 8:00 en punto. Las interconsultas a UCI se llaman antes de las 11:00. El eco FAST está disponible en box 3.',
   'No revisar el listado de pacientes en espera al inicio del turno. Pedir exámenes sin examinar primero.',
   'Evaluación de desempeño al cierre del mes + caso clínico presentado el último viernes.',
   '[{"nombre":"Dr. Pérez","cargo":"Tutor de rotación","telefono":"+56911111111"}]'),
  ('33333333-3333-3333-3333-333333333303',
   'Soporte vital avanzado, ventilación mecánica y manejo de drogas vasoactivas.',
   'Repasar modos ventilatorios básicos. Presentarse con la enfermera supervisora de UCI, 4° piso.',
   'La visita es a las 8:30; llegar con los pacientes ya vistos. Los ingresos se presentan en ficha resumida de una plana.',
   'Ajustar el ventilador sin avisar al staff. No registrar los cambios de drogas en la hoja de enfermería.',
   'Prueba escrita de ventilación mecánica en la tercera semana.',
   '[{"nombre":"Dra. Soto","cargo":"Jefa UCI","telefono":"+56922222222"}]');
