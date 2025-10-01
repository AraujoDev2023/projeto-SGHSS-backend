import { pool } from "../config/db.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import {emailValidation} from "../utils/valid.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import Professional from "../models/Professional.js";
import Admin from "../models/Adm.js";





// Variáveis
const userPatient = "PACIENTE";
const userAdmin = "ADMIN";
const userProfessinal = "PROFISSIONAL";



//----------------- Criar e salvar usuários no DB ----------------------------//

// Criar novo usuário
export const createUser = async (req, res) => {

  const conn = await pool.getConnection(); // Inicia conexão para transação

  try {
      await conn.beginTransaction();

      const data = req.body;

      console.log(data);

      if (!data.email || !data.fullName || !data.typeUser || !data.phone) {
          return res.status(400).json({ error: "Compos obrigatórios apreencher!" });
      }

      // Função gerar senha temporaria
      async function generateTempPassword(length = 12) {
          const buf = crypto.randomBytes(Math.ceil(length * 0.75));
          return buf.toString("base64")
              .replace(/\+/g, "0")
              .replace(/\//g, "0")
              .slice(0, length);
      }

      // Função para criptografia da senha
      async function hashPassword(password) {
          try {
              const hash = await bcrypt.hash(password, 10);
              return hash

          } catch (err) {
              return err;
          };
      }

      // Função para formatar a data 
      async function formatDateForMySQL(date) {
          const d = new Date(date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0'); // meses vão de 0 a 11
          const day = String(d.getDate()).padStart(2, '0');

          const dateBirthForm = `${year}-${month}-${day}`;
          return dateBirthForm;
      }


      const dateBirth = await formatDateForMySQL(data.birthDate);
  
      // Chama a funçao para gerar a senha
      const passwTemp = await generateTempPassword();

      // Mostrar no prompt do servidor a senha temporaria
      console.log(passwTemp);

      // Criptografar senha
      const passwHash = await hashPassword(passwTemp);

      // Validar email
      const emailValid = await emailValidation(data.email);

      // Converter dado do tipo de usuário em STRING e deixar em letre maiusculas
      const typeUser = String(data.typeUser).toUpperCase(); 

      // Instanciar classe USER
      const user = new User(
          data.fullName, 
          emailValid,
          passwHash, 
          typeUser, 
          data.phone
      );

      // Salva dados Genericos na tabela USUÁRIO no DB
      await user.saveUser(conn);
    
      let users;

      // ----------- Verifica o tipo de usuáro ---------------//
      if (typeUser === userPatient) {
          users = new Patient(
              user.id,
              data.cpf, 
              data.gender, 
              data.maritalStatus, 
              data.address, 
              data.emergencyContactName,
              data.emergencyContactPhone,
              data.healthPlan,
              data.cardNumber,
              dateBirth
          );

          // Salvar dados na tabela Paciente
          await users.savePatientData(conn);
      }

      if (typeUser === userProfessinal) {
          console.log(
              user.id,
              data.registrationNumber,
              data.specialty,
              data.council,
          )

          users = new Professional(
              user.id,
              data.registrationNumber,
              data.specialty,
              data.council,
          );

          await users.saveProfessional(conn);
      }

      if (typeUser === userAdmin) {
    
          users = new Admin(
              user.id,
              data.can_manage_users,
              data.can_manage_reports,
              data.can_manage_system
          );

          await users.saveAdm(conn);
      }

      // Confirma tudo
      await conn.commit();
      return res.status(201).json({ 
        message: "Usuário cadastrado com sucesso!",
        passwTemp
      });

  } catch (err) {
      await conn.rollback(); // desfaz todas se der erro
      return res.status(400).json({ error: "Erro ao salvar usuário!"})

      } finally {
          conn.release(); // libera conexão
  };
}



// ----------------------- Agendar Consulta ----------------------------------//
export const scheduleAppointment = async (req, res) => {
  try {
    const {
      patientId,
      professionalId,
      consultationDate, 
      consultationTime, 
      notes
    } = req.body;

    // Validações básicas
    if (!patientId || !professionalId || !consultationDate || !consultationTime) {
      return res.status(400).json(
        { 
          error: "Preencha todos os campos obrigatórios." 
        }
      );
    }

    // Evita conflito: já existe uma consulta não cancelada nesse horário para o profissional?
    const [existing] = await pool.query(
      `SELECT consultationId, statusConsultations FROM consultations
       WHERE professionalId = ? AND consultationDate = ? AND consultationTime = ? 
       AND statusConsultations != 'CANCELADA'`,
      [professionalId, consultationDate, consultationTime]
    ); 

    if (existing.length > 0) {
      return res.status(409).json({ error: "Já existe uma consulta marcada para este profissional nesse horário." });
    }
    
    const dataAppointment = {
      patientId,
      professionalId,
      consultationDate, 
      consultationTime, 
      notes
    }
    const schedulePatientApp = await Patient.saveAppointment(dataAppointment);

    if (!schedulePatientApp) {
      res.status(500).json({ error: "Erro ao salvar agendamento no DB."});
    }    

    return res.status(201).json({
      success: true,
      message: "Consulta agendada com sucesso!",
    });

  } catch (err) {
    console.error("Erro ao agendar consulta:", err);
    return res.status(500).json({ error: "Erro ao salvar agendamento no DB." });
  }
};



// --------------- Alterar status da consulta --------------------------------//
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statusConsultations } = req.body;

    console.log(statusConsultations);
    console.log(id);

    if (!statusConsultations) return res.status(400).json({ error: "Status é obrigatório." });

    const newStatus = String(statusConsultations).toUpperCase();
    
    const statusAppoin = {
      id,
      newStatus
    }

    const saveStatus = await Patient.canceledAppointment(statusAppoin);

    if (saveStatus.result === 0) {
      return res.status(404).json({ error: "Consulta não encontrada." });
    }

    return res.status(200).json({ success: true, message: "Status atualizado.", status: newStatus });
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
    return res.status(500).json({ error: "Erro ao atualizar status da consulta." });
  }
};



// -------------- Consultar agendamento de consultas paciente ----------------//
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
          c.consultationId,
          c.consultationDate,
          c.consultationTime,
          c.statusConsultations,
          c.notes,
          u.fullName AS professionalName,
          hp.specialty AS professionalSpecialty
      FROM consultations c
      JOIN health_professional hp 
        ON c.professionalId = hp.professionalId
      JOIN users u 
        ON hp.userId = u.userId
      WHERE c.patientId = ?
      ORDER BY c.consultationDate DESC, c.consultationTime DESC`,
      [patientId]
    );
    
    return res.json(rows);
    
  } catch (err) {
    console.error("Erro ao buscar consultas do paciente:", err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
};



// ---------------- Consultas de um profissional -----------------------------//
export const getProfessionalAppointments = async (req, res) => {
  try {
    const { professionalId } = req.params;
    
    const listAppoin = await Professional.listAppointment(professionalId);
    return res.json(listAppoin);
  } catch (err) {
    console.error("Erro ao buscar consultas do profissional:", err);
    return res.status(500).json({ error: "Erro no servidor" });
  }
};



// ----------------- Profissional cancelar consulta --------------------------//
export const cancelAppointmentByProfessional = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { professionalId } = req.body; 

    if (!consultationId || !professionalId) {
      return res.status(400).json({ error: "ID da consulta e do profissional são obrigatórios." });
    }

    // Verifica se a consulta existe e pertence a esse profissional
    const [consultation] = await pool.query(
      `SELECT * FROM consultations 
       WHERE consultationId = ? AND professionalId = ?`,
      [consultationId, professionalId]
    );

    if (consultation.length === 0) {
      return res.status(404).json({ error: "Consulta não encontrada ou não pertence a este profissional." });
    }

    Professional.canceledAppointment(consultationId);
    return res.status(200).json({ success: true, message: "Consulta cancelada com sucesso." });

  } catch (err) {
    console.error("Erro ao cancelar consulta:", err);
    return res.status(500).json({ error: "Erro ao cancelar a consulta." });
  }
};


//---------------- Alterar senha do usuárioo ------------------------------------//
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id; 
  
       console.log(oldPassword, newPassword);
    // Busca usuário no banco
    const user = await User.getById(userId);
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }

    if (user.must_change_password === 0) {
      const validPassword = await bcrypt.compare(oldPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ success: false, message: "Senha atual incorreta!" });
      }
    }

    // Criptografa nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza no banco e marca que não é mais senha temporária
    await pool.query(
      "UPDATE users SET passw = ?, must_change_password = 0 WHERE userId = ?",
      [hashedPassword, userId]
    );

    return res.json({ success: true, message: "Senha alterada com sucesso!" });
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};



// --------------- Retorna dados do usuário ----------------------------------//
export const returnUserData = async (req, res) => {
  try {
    const userId = req.user.id;
  
    const dataPatient = await Patient.findByUserId(userId);

    return res.json({
      dataPatient
    })
    
  } catch (error) {
    console.error("Erro ao tentar enviar dados do usuário:", error);
    return res.status(500).json({ success: false, message: "Erro interno do servidor" });
  }
};



// -- Verificação do tipo de usuário que esta tentando criar outro usuário -- // 
 export async function isAdmin(req, res, next) {
  console.log(req.user.typeUser);
  if (req.user && req.user.typeUser === "ADMIN") {
    return next();
  }
  return res.status(403).json({ 
    error: "Acesso negado. Somente admin pode criar usuários." 
  });
}

