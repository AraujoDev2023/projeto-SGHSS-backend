import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import userRouter from "./src/routes/userRoute.js";
import test from "./src/test/test.js";

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

// Rota para normal para uso de interface com autenticação
app.use("/api", userRouter);

// Rota de teste manuais com postman
app.use("/test", test);

// Iniciando Servidor
console.log();
app.listen(PORT, () => console.log(`Servidor rodando!`));