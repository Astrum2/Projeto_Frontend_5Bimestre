const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.UPLOAD_PORT || 3002;
const imagesDir = path.resolve(__dirname, 'public', 'imagens');

fs.mkdirSync(imagesDir, { recursive: true });

const sanitizeBaseName = (filename) => {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return base.replace(/[^a-zA-Z0-9_-]/g, '_');
};

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, imagesDir);
  },
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeBaseName = sanitizeBaseName(file.originalname || 'imagem');
    const uniqueName = `${safeBaseName}_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }

    cb(new Error('Somente arquivos de imagem sao permitidos.'));
  }
});

app.use(
  cors({
    origin: true
  })
);

app.post('/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: 'Nenhuma imagem foi enviada.' });
    return;
  }

  res.status(200).json({
    fileName: req.file.filename,
    publicPath: `/imagens/${req.file.filename}`
  });
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({ message: error.message });
    return;
  }

  res.status(400).json({ message: error.message || 'Falha ao enviar imagem.' });
});

app.listen(port, () => {
  console.log(`Upload server em http://localhost:${port}`);
  console.log(`Imagens salvas em: ${imagesDir}`);
});
