// ===== server.js =====
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = 3000;

app.use(bodyParser.json({ limit: '15mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

// SAVE
app.post('/upload', upload.single('photo'), (req, res) => {
  try {
    const file = req.file;
    const email = req.body.email || 'user';

    if (!file) {
      return res.status(400).json({ error: 'Arquivo não enviado' });
    }

    // novo nome do arquivo
    const newFilename = `${Date.now()}_${email}.jpg`;
    const newPath = path.join(__dirname, 'uploads', newFilename);

    // renomeia o arquivo salvo pelo multer
    fs.renameSync(file.path, newPath);

    res.json({ success: true, filename: newFilename });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar imagem' });
  }
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