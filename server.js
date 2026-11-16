const express = require('express');
const path = require('path');
const { db, init } = require('./db');

const app = express();
const PORT = 3000;
const TARIFA_KG = 0.15;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

init();

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

// --- CRM: Agricultores ---
app.get('/api/crm/agricultores', async (req, res) => {
  try {
    const rows = await all('SELECT * FROM agricultores ORDER BY id DESC');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/crm/agricultores', async (req, res) => {
  try {
    const { nombre, ubicacion, producto_agricola, contacto } = req.body;
    if (!nombre || !ubicacion || !producto_agricola || !contacto) {
      return res.status(400).json({ error: 'Campos requeridos: nombre, ubicacion, producto_agricola, contacto' });
    }
    if (!['Carchi', 'Santo Domingo'].includes(ubicacion)) {
      return res.status(400).json({ error: 'La ubicación debe ser Carchi o Santo Domingo' });
    }
    const result = await run(
      `INSERT INTO agricultores (nombre, ubicacion, producto_agricola, contacto) VALUES (?, ?, ?, ?)`,
      [String(nombre).trim(), ubicacion, String(producto_agricola).trim(), String(contacto).trim()]
    );
    const row = await get('SELECT * FROM agricultores WHERE id = ?', [result.id]);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- ERP: Lotes procesados ---
app.get('/api/erp/lotes', async (req, res) => {
  try {
    const rows = await all(`
      SELECT l.*, a.nombre AS agricultor_nombre, a.ubicacion, a.producto_agricola
      FROM lotes_procesados l
      JOIN agricultores a ON a.id = l.agricultor_id
      ORDER BY l.id DESC
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/erp/lotes', async (req, res) => {
  try {
    const { agricultor_id, contenedor_reefer, kilos_procesados, fecha } = req.body;
    const kilos = parseFloat(kilos_procesados);
    if (!agricultor_id || !(kilos > 0)) {
      return res.status(400).json({ error: 'Campos requeridos: agricultor_id y kilos_procesados (> 0)' });
    }
    const agricultor = await get('SELECT id FROM agricultores WHERE id = ?', [agricultor_id]);
    if (!agricultor) return res.status(400).json({ error: 'agricultor_id no válido' });

    const contenedor = contenedor_reefer && String(contenedor_reefer).trim()
      ? String(contenedor_reefer).trim()
      : 'Reefer 40 pies';
    const tarifa_kg = TARIFA_KG;
    const total_cobro = Math.round(kilos * tarifa_kg * 100) / 100;

    const result = await run(
      `INSERT INTO lotes_procesados (agricultor_id, contenedor_reefer, kilos_procesados, tarifa_kg, total_cobro, fecha)
       VALUES (?, ?, ?, ?, ?, COALESCE(?, datetime('now','localtime')))`,
      [agricultor_id, contenedor, kilos, tarifa_kg, total_cobro, fecha || null]
    );
    const row = await get(`
      SELECT l.*, a.nombre AS agricultor_nombre, a.ubicacion, a.producto_agricola
      FROM lotes_procesados l
      JOIN agricultores a ON a.id = l.agricultor_id
      WHERE l.id = ?
    `, [result.id]);
    res.status(201).json(row);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Agro Móvil ERP y CRM iniciado en http://localhost:${PORT}`);
  console.log(`Modelo IaaS: $${TARIFA_KG} por kilogramo procesado (sin inversión inicial)`);
});
