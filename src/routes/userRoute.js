import express from "express";
import { createUser } from "../controllers/userController.js"

const router = express.Router();

// Rota para criar usuário 
router.post("/user", createUser);

// Rota para pegar usuário
//router.get("/user", getUser);

export default router;