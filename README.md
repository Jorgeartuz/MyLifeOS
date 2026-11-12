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
- **Deudas:** registro del saldo pendiente inicial, acreedor, vencimiento, notas y abonos parciales/totales desde una cuenta. Crear una deuda no registra un ingreso. Los abonos sí generan gastos; no se permiten abonos superiores al pendiente. Incluye una proyección ilustrativa con las tasas efectivas anuales y cuotas mínimas que registres; no modifica automáticamente el saldo del acreedor por intereses.
- **Calendario:** vista mensual y agenda por día, crear/editar/completar/eliminar eventos. Muestra automáticamente vencimientos de deudas pendientes y documentos de la moto. Estos vencimientos se modifican desde su módulo de origen. No envía notificaciones fuera de la aplicación.
- **Configuración:** nombre del perfil (metadatos de Supabase Auth), cambio de contraseña verificando la contraseña actual, creación y archivo de categorías, cierre de sesión. La moneda de la aplicación es COP.

## Validación

```sh
npm run lint
npm test
npm run build
```

Las pruebas usan Node Test Runner y TypeScript, sin instalar otro framework. Cubren saldos pendientes con decimales, vencimientos automáticos, fechas locales, acceso sin sesión, contratos RPC y rechazo de contraseñas actuales incorrectas. También ejecutan ambas migraciones contra PostgreSQL local con PGlite y prueban saldos, aislamiento RLS, reversión ante errores y servicios recurrentes. No sustituyen la verificación contra el esquema real de tu Supabase ni prueban concurrencia entre conexiones.

Después de aplicar la migración, verifica con una cuenta de prueba:

1. Crear una moto, actualizar kilometraje y registrar un servicio; comprobar documentos en Calendario y datos en Dashboard.
2. Crear una deuda; hacer un abono parcial y otro total; comprobar saldo e historial en Finanzas. Probar saldo insuficiente y abono mayor al pendiente: no deben dejar movimientos parciales.
3. Crear, editar, completar y eliminar un evento; cambiar el mes y seleccionar un día.
4. Actualizar el nombre y crear/archivar una categoría; comprobar los cambios en el encabezado y en Finanzas.
5. Usar un segundo usuario y comprobar que no ve ni modifica datos del primero. Probar abonos simultáneos contra una misma deuda.

La segunda migración convierte las altas y reversiones de Finanzas en RPC con bloqueo de cuenta, compartido por los abonos y el apartado moto. Los flujos compuestos de Trabajo y Metas todavía usan compensaciones entre registros, por lo que no constituyen una sola transacción completa.

## Estructura

`src/pages` contiene las pantallas; `src/components` los componentes; `src/services` las operaciones de Supabase; `src/types` los modelos; `src/hooks` la carga compartida y `supabase/migrations` los cambios de base de datos.

## Despliegue

`npm run build` genera `dist`. Existe configuración de reescritura SPA en `vercel.json`. Configura también las variables `VITE_SUPABASE_*` y las URL permitidas de Supabase Auth en tu entorno de despliegue.
## Planificación personal: segunda migración

Ejecuta una vez `supabase/migrations/202611120002_personal_planning.sql` en el SQL Editor, después de la primera migración. No vuelvas a ejecutar la primera. Esta actualización es necesaria antes de usar los nuevos planes y registrar movimientos financieros con esta versión.

Preferencias iniciales solicitadas: **20 % máximo para deudas**, después de la provisión de moto, y **100 km por día calendario**. Configura tu mínimo diario para vivir/trabajar y tu colchón de efectivo en Deudas. No se inventan esos importes: aparecen en cero con un aviso hasta que los completes.

El plan diario usa ingresos realmente registrados hoy, protege el mayor entre tu mínimo diario y tus gastos ya registrados, descuenta lo ya abonado/apartado hoy, reserva el monto de la moto y limita las sugerencias al dinero disponible sin crédito. Las cuotas mínimas se atienden primero; el excedente sigue mayor interés o menor saldo. Las sugerencias requieren que confirmes cada abono y no impiden un abono manual diferente. La prioridad se basa en las estrategias de [reducción de deuda del CFPB](https://www.consumerfinance.gov/archive/blog/how-reduce-your-debt/).

La proyección de pago usa promedios por día calendario desde el primer movimiento de los últimos 30 días, incluidos días sin ingresos. Simula tasas efectivas anuales, un aporte diario constante y cuotas mínimas equivalentes diarias. No garantiza una fecha ni reproduce comisiones, reglas de liquidación o condiciones específicas de cada acreedor. Si el ritmo no permite amortizar en diez años, no muestra fecha.

En Moto, crea planes con último servicio, intervalo en km y costo esperado. No se recomiendan intervalos mecánicos universales: usa tu manual o mecánico. Ejemplo: aceite a 43.000 km + intervalo de 2.000 km = próximo a 45.000 km. Desde 43.000 km, a 100 km/día, son aproximadamente 20 días. Al registrar ese servicio se avanza automáticamente el ciclo. También puedes tomar un servicio del historial como punto de partida. Los planes aparecen en Calendario y el próximo servicio se refleja en Dashboard.

Cada actualización del odómetro conserva la lectura máxima de ese día. Con lecturas que cubran al menos siete días, la fecha usa el promedio de los últimos 30 días; antes, usa los 100 km/día ajustables. El promedio es por día calendario: incluye descansos. Los días estimados se recalculan desde el kilometraje actual y no son una promesa.

El apartado moto es un fondo separado dentro de MyLifeOs. Apartar descuenta la cuenta y aumenta el fondo; devolver hace lo contrario. En el historial financiero, el aporte se registra como salida al apartado y el retiro como entrada. La planificación excluye los retiros del fondo de los ingresos ganados. Al pagar un servicio con ese apartado se descuenta el fondo sin volver a descontar una cuenta ni duplicar el gasto. Es un control contable dentro de la app; no mueve dinero en el banco. Si pagas el mantenimiento fuera del apartado, registra ese gasto en Finanzas.

La provisión diaria suma el costo por km de los planes y aumenta si falta dinero para un servicio próximo. Distribuye el saldo del fondo entre servicios cercanos sin usar el mismo dinero dos veces. Si el ingreso o el saldo disponible no alcanza, muestra el faltante sin consumir crédito ni el colchón configurado.