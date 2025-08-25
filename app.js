import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Carregando variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: path.resolve(__dirname, './config/.env')});

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded( { extended: true }));

// Conectar ao Banco de Dado
connectDB();

// Iniciando Servidor
app.listen(PORT, () => console.log(`Servidor rodando!`));