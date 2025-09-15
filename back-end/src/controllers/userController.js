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

        // Método para criptografia da senha
        async function hashPassword(password) {
            try {
                const hash = await bcrypt.hash(password, 10);
                return hash

            } catch (err) {
                return err;
            };
        }

        // Chama a funçao para gerar a senha
        const passwTemp = await generateTempPassword();

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
                data.dateBirth
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
                data.can_manage_system,
            );

            await users.saveAdm(conn);
        }
 
        // Confirma tudo
        await conn.commit();
        return res.status(201).json({ message: "Usuário cadastrado com sucesso!"});

    } catch (err) {
        await conn.rollback(); // desfaz todas se der erro
        return res.status(400).json({ error: "Erro ao salvar usuário!"})

        } finally {
            conn.release(); // libera conexão
    }
};

// Validação login usuário
export const verificationEmailLogin = async (email,password) => {
    // Verifica no banco de dados
    const dataUser = await User.getByEmail(email);

    console.log(dataUser.must_change_password);

    // Verifica o retorno
    if (dataUser.email === null) {
        return err;
    }

    // Compara senha do input com a do banco de dados
    const match = await bcrypt.compare(password, dataUser.passw);
    if (!match) {
        return;
    }
    return dataUser;
}

// Alteração da senha temporaria
export const changePassword = async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const data = req.body;

        
    } catch (err) {

    }
}