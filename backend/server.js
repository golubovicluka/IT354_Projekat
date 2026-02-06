import express from 'express';
import cors from 'cors';
import { initDb } from './src/database.js';
import seed from './src/seed.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Database
initDb();
seed();

// Routes
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
    res.send("Test endpoint");
});

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});