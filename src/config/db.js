// importação do mysql2 e dotenv para conexção com banco
import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Carregando variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: path.resolve(__dirname, '.env')});

// Criando conexões via Pool
const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Conexão com Banco de Dados
const connectDB = async () => {
    let connection;

    try {
        connection = await pool.getConnection();
        console.log(`Conexão bem sucedida ao Banco de Dado!`);

    } catch (error) {
        console.log(`Erro ao conectar ao Banco de Bados!`);

    } finally { 
        if (connection) connection.release(); // Libera a conexão se foi obtida
    }
}

export { connectDB, pool};