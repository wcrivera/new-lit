import express from 'express';
import lti from 'ims-lti';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-super-seguro';

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Endpoint principal de LTI Launch
app.post('/lti/launch', (req, res) => {
  const consumerKey = process.env.CONSUMER_KEY;
  const consumerSecret = process.env.CONSUMER_SECRET;

  console.log('📥 LTI Launch Request recibido');
  console.log('Body:', req.body);

  // Crear proveedor LTI
  const provider = new lti.Provider(consumerKey, consumerSecret);

  // Validar request
  provider.valid_request(req, (err, isValid) => {
    if (err) {
      console.error('❌ Error validando LTI:', err);
      return res.status(500).send('Error validando LTI request');
    }

    if (!isValid) {
      console.error('❌ LTI Request inválido');
      return res.status(401).send('LTI signature inválida');
    }

    console.log('✅ LTI Request válido');

    // Extraer información del usuario
    const userData = {
      userId: provider.body.user_id,
      firstName: provider.body.lis_person_name_given || 'N/A',
      lastName: provider.body.lis_person_name_family || 'N/A',
      fullName: provider.body.lis_person_name_full || 'N/A',
      email: provider.body.lis_person_contact_email_primary || 'N/A',
      roles: provider.body.roles || 'N/A',
      courseId: provider.body.context_id || 'N/A',
      courseTitle: provider.body.context_title || 'N/A',
      contextLabel: provider.body.context_label || 'N/A'
    };

    console.log('👤 Datos del usuario:', userData);

    // Generar token JWT
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '24h' });

    // Enviar página HTML con el token
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>LTI Canvas - Cargando...</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 600px;
            width: 100%;
          }
          h1 {
            color: #667eea;
            margin-bottom: 30px;
            text-align: center;
          }
          .info-grid {
            display: grid;
            gap: 15px;
            margin-top: 20px;
          }
          .info-item {
            padding: 15px;
            background: #f7fafc;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .label {
            font-size: 12px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          .value {
            font-size: 16px;
            color: #2d3748;
            font-weight: 500;
          }
          .token-section {
            margin-top: 30px;
            padding: 20px;
            background: #edf2f7;
            border-radius: 8px;
          }
          .token {
            font-family: monospace;
            font-size: 12px;
            word-break: break-all;
            color: #4a5568;
          }
          .success-badge {
            display: inline-block;
            padding: 6px 12px;
            background: #48bb78;
            color: white;
            border-radius: 20px;
            font-size: 14px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-badge">✓ Autenticación Exitosa</div>
          <h1>🎓 LTI Canvas Integration</h1>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="label">Nombre Completo</div>
              <div class="value">\${userData.fullName}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Email</div>
              <div class="value">\${userData.email}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Rol</div>
              <div class="value">\${userData.roles}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Curso</div>
              <div class="value">\${userData.courseTitle} (\${userData.contextLabel})</div>
            </div>
            
            <div class="info-item">
              <div class="label">User ID Canvas</div>
              <div class="value">\${userData.userId}</div>
            </div>
            
            <div class="info-item">
              <div class="label">Course ID</div>
              <div class="value">\${userData.courseId}</div>
            </div>
          </div>
          
          <div class="token-section">
            <div class="label">Token JWT (válido por 24h)</div>
            <div class="token">\${token}</div>
          </div>
        </div>
      </body>
      </html>
    `);
  });
});

// Endpoint para validar token
app.post('/api/validate-token', (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Token inválido' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'LTI Server running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor LTI corriendo en http://localhost:${PORT}`);
  console.log(`📍 Launch URL: http://localhost:${PORT}/lti/launch`);
});