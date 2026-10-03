import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json({ limit: '25mb' }));

// Serve static assets with proper caching
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.static(__dirname, { index: false }));

// Data API endpoints
app.get('/api/data', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf-8');
      res.setHeader('Content-Type', 'application/json');
      return res.send(data);
    }
    return res.status(404).json({ error: 'data.json not found' });
  } catch (err) {
    console.error('Error reading data.json:', err);
    return res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/data', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    const content = JSON.stringify(req.body, null, 2);
    fs.writeFileSync(dataPath, content, 'utf-8');
    return res.json({ success: true });
  } catch (err) {
    console.error('Error saving data.json:', err);
    return res.status(500).json({ error: 'Failed to save data' });
  }
});

// Newsletter subscription endpoint
app.post('/api/newsletter', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    const { email, name, source } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'E-mail inválido' });
    }
    const cleanEmail = email.toLowerCase().trim();
    let currentData = { newsletter: [] };
    if (fs.existsSync(dataPath)) {
      currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    if (!Array.isArray(currentData.newsletter)) {
      currentData.newsletter = [];
    }

    const exists = currentData.newsletter.some(n => n.email === cleanEmail);
    if (!exists) {
      currentData.newsletter.push({
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        email: cleanEmail,
        name: name ? String(name).trim() : '',
        source: source || 'footer',
        active: true,
        subscribedAt: new Date().toISOString()
      });
      fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf-8');
    }
    return res.json({ success: true, alreadySubscribed: exists });
  } catch (err) {
    console.error('Error in /api/newsletter:', err);
    return res.status(500).json({ error: 'Falha ao registrar inscrição' });
  }
});

app.get('/api/newsletter', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    if (fs.existsSync(dataPath)) {
      const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      return res.json(currentData.newsletter || []);
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao buscar inscritos' });
  }
});

app.delete('/api/newsletter', (req, res) => {
  const dataPath = path.join(__dirname, 'data.json');
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'E-mail obrigatório' });
    if (fs.existsSync(dataPath)) {
      const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      if (Array.isArray(currentData.newsletter)) {
        currentData.newsletter = currentData.newsletter.filter(n => n.email !== email.toLowerCase().trim());
        fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2), 'utf-8');
      }
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Falha ao remover inscrito' });
  }
});

// Direct Image Upload API for Admin Panel
app.post('/api/upload-image', (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'Missing fileName or base64Data' });
    }
    const safeName = path.basename(fileName);
    const imagesDir = path.join(__dirname, 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    const targetPath = path.join(imagesDir, safeName);
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(targetPath, buffer);
    return res.json({ success: true, url: `./images/${safeName}` });
  } catch (err) {
    console.error('Error uploading image:', err);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Admin panel route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Main storefront route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all middleware for SPA navigation and unhandled routes
app.use((req, res) => {
  const filePath = path.join(__dirname, req.path);
  if (req.method === 'GET' && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Gold Crochet server running at http://${HOST}:${PORT}`);
});
