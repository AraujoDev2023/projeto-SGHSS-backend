import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js"; 
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

// Carregando variáveis de ambiente
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: path.resolve(__dirname, './config/.env')});

// Função login
export async function login(req, res) {
  const { email, password } = req.body;

  try {
    // Buscar usuário no banco
    const user = await User.getByEmail(email);
    
    if (!user) {
      return res.status(401).json({ message: "Usuário não encontrado" });
    }

    // Verificar senha
    const validPassword = await bcrypt.compare(password, user.passw);
    if (!validPassword) {
        return res.status(401).json({ message: "Email ou senha incorreto!" });
    }

    // Gerar token
    const token = jwt.sign(
      {
        id: user.userId,
        email: user.email,
        typeUser: user.typeUser,
        fullName: user.fullName
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    const mustChangePassword = user.must_change_password;

    return res.json({
        mustChangePassword,
        token
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
}

// Middleware para proteger rotas
export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido ou expirado" });
    }
    req.user = user;
    next();
  });
}
