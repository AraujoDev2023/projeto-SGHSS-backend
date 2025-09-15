import express from "express";
import { createUser, changePassword } from "../controllers/userController.js"
import { login } from "../auth/auth.js";

const router = express.Router();

// Rota para criar usuário 
router.post("/user", createUser);

// Rota login
router.post("/login", login);

// trocar senha
router.post("/change-password", changePassword);

export default router;