import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db';
import { z } from 'zod';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Standard Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Vite needs this disabled in dev
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- Authentication Middleware ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Authentication token required' });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const authorizeRole = (role: string) => {
  return (req: any, res: any, next: any) => {
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access' });
    }
    next();
  };
};

// --- API Routes (v1) ---

// Auth Routes
const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['user', 'admin']).optional()
});

app.post('/api/v1/auth/register', (req, res) => {
  try {
    const { email, password, role = 'user' } = RegisterSchema.parse(req.body);
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const stmt = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)');
    const result = stmt.run(email, hashedPassword, role);
    
    res.status(201).json({ id: result.lastInsertRowid, email, role });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'User already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// Projects CRUD (Secondary Entity)
const ProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(['pending', 'in-progress', 'completed']).optional()
});

app.get('/api/v1/projects', authenticateToken, (req: any, res) => {
  let projects;
  if (req.user.role === 'admin') {
    projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
  } else {
    projects = db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  }
  res.json(projects);
});

app.post('/api/v1/projects', authenticateToken, (req: any, res) => {
  try {
    const { title, description = '', status = 'pending' } = ProjectSchema.parse(req.body);
    const stmt = db.prepare('INSERT INTO projects (title, description, status, user_id) VALUES (?, ?, ?, ?)');
    const result = stmt.run(title, description, status, req.user.id);
    res.status(201).json({ id: result.lastInsertRowid, title, description, status });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/v1/projects/:id', authenticateToken, (req: any, res) => {
  try {
    const { title, description, status } = ProjectSchema.parse(req.body);
    const project: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    const stmt = db.prepare('UPDATE projects SET title = ?, description = ?, status = ? WHERE id = ?');
    stmt.run(title, description, status, req.params.id);
    res.json({ message: 'Project updated successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/v1/projects/:id', authenticateToken, (req: any, res) => {
  const project: any = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  
  if (!project) return res.status(404).json({ error: 'Project not found' });
  if (project.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ message: 'Project deleted successfully' });
});

// Admin Only Route example
app.get('/api/v1/admin/stats', authenticateToken, authorizeRole('admin'), (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
  res.json({
    totalUsers: userCount.count,
    totalProjects: projectCount.count
  });
});

// Start the server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Nexus API initialized successfully.');
  });
}

startServer();
