// ===== server.js =====
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '15mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// SAVE
app.post('/upload', (req, res) => {
  const { image, email } = req.body;
  const base64Data = image.replace(/^data:image\/png;base64,/, "");
  const filename = `${Date.now()}_${email}.png`;
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.writeFileSync(filePath, base64Data, 'base64');
  res.json({ success: true, filename });
});

// LIST
app.get('/photos', (req, res) => {
  const files = fs.readdirSync(path.join(__dirname, 'uploads'));
  res.json(files);
});

app.post('/delete', (req, res) => {
  const { file } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'Arquivo não enviado' });
  }

  const filePath = path.join(__dirname, 'uploads', file);

  console.log('Tentando excluir:', filePath);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Arquivo excluído!');
      return res.json({ success: true });
    } else {
      console.log('Arquivo NÃO encontrado');
      return res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao excluir' });
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));