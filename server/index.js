const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = 'providers.json';
let providers = [];

function loadProviders() {
  if (fs.existsSync(DATA_FILE)) {
    providers = JSON.parse(fs.readFileSync(DATA_FILE));
  }
}

function saveProviders() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(providers, null, 2));
}

async function fetchRepseData(rfc) {
  // Aqui deberia implementarse el scraping o consulta al REPSE
  // Debido a restricciones de red, se retorna informacion simulada
  return {
    rfc,
    razonSocial: 'Empresa ' + rfc,
    estatus: 'VIGENTE',
    vigencia: '2025-12-31'
  };
}

async function updateProvider(provider) {
  const data = await fetchRepseData(provider.rfc);
  provider.info = data;
  provider.updatedAt = new Date().toISOString();
  saveProviders();
}

app.get('/api/providers', (req, res) => {
  res.json(providers);
});

app.post('/api/providers', async (req, res) => {
  const { rfc } = req.body;
  if (!rfc) return res.status(400).json({ error: 'RFC requerido' });
  const existing = providers.find(p => p.rfc === rfc);
  if (existing) return res.status(400).json({ error: 'Proveedor existente' });
  const provider = { rfc };
  providers.push(provider);
  await updateProvider(provider);
  res.json(provider);
});

app.get('/api/providers/:rfc', (req, res) => {
  const provider = providers.find(p => p.rfc === req.params.rfc);
  if (!provider) return res.status(404).json({ error: 'No encontrado' });
  res.json(provider);
});

app.listen(3001, () => {
  console.log('Servidor backend en puerto 3001');
});

// Tarea programada para actualizar todos los proveedores diariamente a las 3am
cron.schedule('0 3 * * *', async () => {
  for (const provider of providers) {
    await updateProvider(provider);
  }
  console.log('Proveedores actualizados');
});

loadProviders();
