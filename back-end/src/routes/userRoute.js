import express from "express";
import { 
  createUser, 
  changePassword, 
  scheduleAppointment,
  updateAppointmentStatus,
  getPatientAppointments,
  getProfessionalAppointments,
  cancelAppointmentByProfessional,
  returnUserData,
  isAdmin
} from "../controllers/userController.js";
import { login, authenticateToken } from "../auth/auth.js";

const router = express.Router();

// Criar usuário
router.post(
  "/user",
  authenticateToken, 
  isAdmin,
  createUser
);

// Login
router.post(
  "/login", 
  login
);

// Trocar senha 
router.post(
  "/change-password",
  authenticateToken,
  changePassword
);

// Retorna dados do usuário
router.get(
  "/me", 
  authenticateToken,
  returnUserData
);

// Retorna consulta (Agendada/Realizada/cancelada) paciente
router.get(
  "/appointment/patient/:patientId", 
  authenticateToken,
  getPatientAppointments
);

// Retorna consulta (Agendada/Realizada/cancelada) Profissional de saúde
router.get(
  "/appointment/profesional/:professionalId",
  authenticateToken, 
  getProfessionalAppointments
);

// Agendamento de Consulta
router.post(
  "/scheduleAppointmen",
  authenticateToken, 
  scheduleAppointment
);

// Atualiza status da consulta
router.put(
  "/appointment/patient/:id/status",
  authenticateToken, 
  updateAppointmentStatus
);

// Atualiza status da consulta para cancelado atravez do usuário Paciente
router.put(
  "/appointment/:consultationId",
  authenticateToken, 
  cancelAppointmentByProfessional
);

export default router;
