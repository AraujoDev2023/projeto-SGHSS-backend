import express from "express";
import { 
  createUser, 
  changePassword, 
  scheduleAppointment,
  updateAppointmentStatus,
  getPatientAppointments,
  getProfessionalAppointments,
  cancelAppointmentByProfessional,
  returnUserData
  
} from "../controllers/userController.js";
import { login, authenticateToken } from "../auth/auth.js";

const router = express.Router();

// Criar usuário
router.post(
  "/create/user",
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

// Retorna dados do paciente
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
  getProfessionalAppointments
);

// Agendamento de Consulta
router.post(
  "/scheduleAppointmen", 
  scheduleAppointment
);

// Atualiza status da consulta
router.put(
  "/appointment/patient/:id/status", 
  updateAppointmentStatus
);

// Atualiza status da consulta para cancelado atravez do usuário Paciente
router.put(
  "/appointment/:consultationId",
  cancelAppointmentByProfessional
);

export default router;
