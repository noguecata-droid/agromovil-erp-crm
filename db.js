const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'agro_movil.db');
const db = new sqlite3.Database(DB_PATH);

function init() {
  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    // Módulo CRM - Gestión de Relaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS agricultores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        ubicacion TEXT NOT NULL CHECK (ubicacion IN ('Carchi', 'Santo Domingo')),
        producto_agricola TEXT NOT NULL,
        contacto TEXT NOT NULL,
        fecha_registro TEXT DEFAULT (datetime('now','localtime'))
      )
    `);

    // Módulo ERP - Planificación y Operaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS lotes_procesados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agricultor_id INTEGER NOT NULL,
        contenedor_reefer TEXT NOT NULL DEFAULT 'Reefer 40 pies',
        kilos_procesados REAL NOT NULL CHECK (kilos_procesados > 0),
        tarifa_kg REAL NOT NULL DEFAULT 0.15,
        total_cobro REAL NOT NULL,
        fecha TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (agricultor_id) REFERENCES agricultores(id) ON DELETE CASCADE
      )
    `);
  });
}

module.exports = { db, init };
