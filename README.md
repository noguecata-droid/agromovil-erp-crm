# Agro Móvil ERP y CRM

Aplicación web **ERP y CRM** para **Plantas de Empaque Agroexportador Móviles y Contenedorizadas**, desarrollada con **Node.js, Express y SQLite** (frontend en **HTML + Tailwind CSS vía CDN**).

## Modelo de negocio: IaaS (Infrastructure as a Service) agroexportador

- **Sin inversión inicial para el agricultor:** el servicio de empaque y procesamiento se ofrece como infraestructura móvil/contenedorizada bajo demanda.
- **Pago por uso:** se cobra **$0.15 por kilogramo procesado** (`tarifa_kg = 0.15`).
- **Cálculo automático:** cada lote registrado en el ERP calcula el cobro operativo como `total_cobro = kilos_procesados * 0.15`.
- **Infraestructura operativa:** procesamiento en **contenedores Reefer de 40 pies**, habilitando plantas móviles cerca de las zonas de producción (Carchi y Santo Domingo).

Este enfoque reduce barreras de entrada, alinea costos con la producción real y facilita la trazabilidad comercial y operativa para agricultores y operadores.

## Arquitectura funcional

### Módulo CRM — Gestión de Relaciones (`agricultores`)
- Registro y listado de agricultores de **Carchi** y **Santo Domingo**.
- Campos: nombre, ubicación, producto agrícola y contacto.
- Endpoint: `GET /api/crm/agricultores`, `POST /api/crm/agricultores`.

### Módulo ERP — Planificación y Operaciones (`lotes_procesados`)
- Registro de lotes procesados vinculados a un agricultor (CRM).
- Campos: agricultor, contenedor Reefer (40 pies), kilos procesados, tarifa por kg ($0.15), total de cobro automático y fecha.
- Endpoint: `GET /api/erp/lotes`, `POST /api/erp/lotes`.

### Frontend (`public/index.html`)
- **Panel superior de KPIs:** total de kilos procesados, ingresos totales generados (a $0.15/kg) y agricultores activos.
- **Módulo CRM:** formulario y tabla interactiva para registrar y listar agricultores.
- **Módulo ERP:** formulario y tabla interactiva para registrar lotes en contenedores Reefer de 40 pies con cálculo automático del cobro operativo.

## Estructura del proyecto

- `package.json` — dependencias (`express`, `sqlite3`) y script `start`
- `db.js` — inicialización de base de datos SQLite y tablas `agricultores` y `lotes_procesados`
- `server.js` — servidor Express (puerto 3000), estáticos en `public/` y rutas API CRM/ERP
- `public/index.html` — interfaz web con Tailwind CSS (CDN)
- `.gitignore` — ignora `node_modules` y `*.db`
- `README.md` — documentación del modelo IaaS

## Requisitos

- Node.js 18+ y npm

## Instalación y ejecución

```bash
npm install
npm start
```

Abrir en el navegador: [http://localhost:3000](http://localhost:3000)

La base de datos SQLite se crea automáticamente al iniciar el servidor.