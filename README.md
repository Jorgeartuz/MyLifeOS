# MyLifeOs

Aplicación personal para gestionar finanzas, domicilios, metas de ahorro, moto, deudas y calendario.

## Desarrollo

Requiere Node.js y un proyecto de Supabase con las tablas del módulo original de Finanzas, Trabajo y Metas.

1. Ejecuta `npm install`.
2. Copia `.env.example` a `.env.local` y configura la URL y la clave publicable de tu proyecto.
3. Aplica la migración indicada abajo en el mismo proyecto Supabase.
4. Ejecuta `npm run dev`.

Nunca uses una clave `service_role` en variables `VITE_*`: se incluyen en el navegador.

## Activar Moto, Deudas y Calendario

En el SQL Editor de Supabase, ejecuta una vez el contenido de:

`supabase/migrations/202611120001_life_modules.sql`

La migración requiere las tablas existentes `public.accounts` y `public.transactions`, con identificadores UUID y las columnas que usa `src/services/finance.service.ts`. Está envuelta en una transacción: si el esquema existente no coincide, no aplica cambios parciales. No incluye ni reemplaza el esquema original, que no estaba versionado en este repositorio. No ejecutes nuevamente el archivo después de aplicarlo correctamente.

Crea las tablas `motorcycles`, `motorcycle_maintenance`, `debts`, `debt_payments` y `calendar_events`, con políticas RLS y permisos por usuario. Incluye funciones RPC para registrar mantenimientos y abonar deudas. Los abonos bloquean la deuda y la cuenta, comprueban propietario, saldo y monto pendiente y guardan el gasto, el saldo y el abono en una sola transacción. Los pagos y mantenimientos se conservan como historial; no se editan ni eliminan desde la interfaz.

La migración no modifica las políticas de las tablas anteriores. Revisa que cuentas, categorías, transacciones, trabajo, metas y perfiles tengan RLS y aislamiento por `auth.uid()` en el proyecto existente.

## Módulos

- **Dashboard:** resumen del período, gráfica de totales reales, movimientos, meta y datos registrados de la moto.
- **Finanzas:** cuentas, ingresos, gastos e historial.
- **Trabajo:** domicilios en efectivo o transferencia, paquetes y comisión del 20 % sin paquete activo.
- **Metas:** objetivos de ahorro y aportes desde cuentas.
- **Moto:** una moto por usuario, kilometraje que no puede disminuir, vencimientos de SOAT/tecnomecánica e historial de servicios. Un servicio histórico no reduce el odómetro. Los costos del historial no descuentan cuentas automáticamente; registra el gasto en Finanzas cuando corresponda.
- **Deudas:** registro del saldo pendiente inicial, acreedor, vencimiento, notas y abonos parciales/totales desde una cuenta. Crear una deuda no registra un ingreso. Los abonos sí generan gastos; no se permiten abonos superiores al pendiente. No calcula intereses ni amortizaciones.
- **Calendario:** vista mensual y agenda por día, crear/editar/completar/eliminar eventos. Muestra automáticamente vencimientos de deudas pendientes y documentos de la moto. Estos vencimientos se modifican desde su módulo de origen. No envía notificaciones fuera de la aplicación.
- **Configuración:** nombre del perfil (metadatos de Supabase Auth), cambio de contraseña verificando la contraseña actual, creación y archivo de categorías, cierre de sesión. La moneda de la aplicación es COP.

## Validación

```sh
npm run lint
npm test
npm run build
```

Las pruebas usan Node Test Runner y TypeScript, sin instalar otro framework. Cubren saldos pendientes con decimales, vencimientos automáticos, fechas locales, acceso sin sesión, contratos RPC y rechazo de contraseñas actuales incorrectas. Simulan el cliente Supabase: no sustituyen las pruebas contra una base real.

Después de aplicar la migración, verifica con una cuenta de prueba:

1. Crear una moto, actualizar kilometraje y registrar un servicio; comprobar documentos en Calendario y datos en Dashboard.
2. Crear una deuda; hacer un abono parcial y otro total; comprobar saldo e historial en Finanzas. Probar saldo insuficiente y abono mayor al pendiente: no deben dejar movimientos parciales.
3. Crear, editar, completar y eliminar un evento; cambiar el mes y seleccionar un día.
4. Actualizar el nombre y crear/archivar una categoría; comprobar los cambios en el encabezado y en Finanzas.
5. Usar un segundo usuario y comprobar que no ve ni modifica datos del primero. Probar abonos simultáneos contra una misma deuda.

Las funciones nuevas son atómicas, pero los servicios anteriores de Finanzas, Trabajo y Metas todavía realizan varias escrituras separadas y requieren una migración posterior para garantizar consistencia entre todos los flujos concurrentes.

## Estructura

`src/pages` contiene las pantallas; `src/components` los componentes; `src/services` las operaciones de Supabase; `src/types` los modelos; `src/hooks` la carga compartida y `supabase/migrations` los cambios de base de datos.

## Despliegue

`npm run build` genera `dist`. Existe configuración de reescritura SPA en `vercel.json`. Configura también las variables `VITE_SUPABASE_*` y las URL permitidas de Supabase Auth en tu entorno de despliegue.