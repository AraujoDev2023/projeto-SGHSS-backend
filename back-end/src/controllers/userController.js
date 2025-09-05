import { pool } from "../config/db.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import validator from 'validator';
import { error } from "console";
import { format, parse } from "path";


// Variáveis
const userPatient = "PACIENTE";
const userAdmin = "ADMIN";
const userProfessinal = "PROFISSIONAL";


//---------------------------- Funções ---------------------------------------//


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
    console.log(password);
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    } catch (err) {
        return err;
    }
}

// Função para validar email
async function emailValidation(email) {
    if (!validator.isEmail(email)) {
        throw new Error("Email inválido!");
    }
    return email;
}

//----------------- Criar e salvar usuários no DB ----------------------------//

// Criar novo usuário
export const createUser = async (req, res) => {
    const connct = await pool.getConnection(); // Inicia conexão para transação
    await connct.beginTransaction();

    try {
        const data = req.body;
                
        const tempPassword = await generateTempPassword(); // Gerar senha temporaria

        // Criptografando a senha
        const passwordHash = await hashPassword(tempPassword);
        console.log(passwordHash);

        const emailUser = await emailValidation(data.email); // validar email
        
        // Verificação se os campos obricatorios estão preenchidos
        if (!emailUser || !data.fullName || !data.typeUser) {
            return res.status(400).json({ error: "Compos obrigatórios apreencher!" });

        } else {
             // Salvar usuário no banco de dados 
            const [result] = await connct.execute(
                `INSERT INTO users (fullName, email, passw, typeUser) VALUES (?,?,?,?)`,
                [data.fullName, data.email, passwordHash, data.typeUser]
            );
            console.log("Gravou user");
                   
            // Pegar ID automatico do usuário
            const userId = result.insertId;
           
            // Converter dado do tipo de usuário em STRING e deixar em letre maiusculas
            const typeUser = String(data.typeUser).toUpperCase();

            // Verificar se tipo de usuário e usuário Paciente e se os compos obrigatorios estão preenchido
            if (typeUser === userPatient) {
                if (!data.gender || !data.dateBirth || !data.cpf) {
                    return res.status(400).json({ error: "Compos obrigatórios apreencher!" });
                }
                try {
                      // Salvar usuário Paciente no DB
                    await connct.execute(
                        `INSERT INTO patient (userId, cpf, phone, gender, address, dateBirth) VALUES (?,?,?,?,?,?)`,
                        [userId, data.cpf, data.phone, data.gender, data.address, data.dateBirth]                        
                );
                console.log("Gravou apciente");


                } catch (err) {
                    return res.status(400).json({ error: "Erro ao gravar dados na tabela Paciente!"});
                }
            }

            // Verificar se tipo de usuário e usuário Admin
            else if (typeUser === userAdmin) {
                try {
                    await connct.execute(
                        `INSERT INTO admin_profe (userId, can_manage_users, can_manage_reports, can_manage_system) VALUES (?,?,?,?)`,
                        [userId, data.manage_users, data.manage_reports, data.manage_system]
                    );
                } catch (err) {
                    return res.status(400).json({ error: "Erro ao gravar dados na tabela Adiministrador!"});
                };
            }

            // Verificar se tipo de usuário e usuário Profissinal de Saúde e se os compos obrigatorios estão preenchido
            else if (typeUser === userProfessinal) {
                if (!data.crm || !data.typeProfessional) {
                   return res.status(400).json({ error: "Compos obrigatórios apreencher!" });
                }
                try {
                    console.log("tentou gravar");
                    console.log(userId, data.typeProfessional, data.specialy, data.crm);
                    await connct.execute(
                        `INSERT INTO health_professional (userId, typeProfessional, specialty, crm) VALUES (?,?,?,?)`,
                        [userId, data.typeProfessional, data.specialty, data.crm]
                    );
                 } catch (err) {
                    return res.status(400).json({ error: "Erro ao gravar dados na tabela Profissional!"});
                };
            } 
        }
        
        // Confirma tudo
        await connct.commit();
        return res.status(201).json({ message: "Usuário cadastrado com sucesso!"});

    } catch (err) {
        return res.status(400).json({ error: "Erro ao salvar usuário!"})
    }
};


