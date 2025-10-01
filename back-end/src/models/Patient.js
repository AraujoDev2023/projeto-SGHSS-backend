import { pool } from "../config/db.js"

// Classe Paciente 
export default class Patient {
    #userId
    #cpf
    #gender
    #maritalStatus
    #address 
    #emergencyContactName
    #emergencyContactPhone
    #healthPlan
    #cardNumber
    #dateBirth

    constructor(
        userId,
        cpf, 
        gender, 
        maritalStatus, 
        address, 
        emergencyContactName,
        emergencyContactPhone,
        healthPlan,
        cardNumber,
        dateBirth
    ) {
        this.#userId = userId
        this.#cpf = cpf;
        this.#gender = gender;
        this.#maritalStatus = maritalStatus;
        this.#address = address;
        this.#emergencyContactName = emergencyContactName;
        this.#emergencyContactPhone = emergencyContactPhone;
        this.#healthPlan = healthPlan;
        this.#cardNumber = cardNumber;
        this.#dateBirth = dateBirth;
       
    }

    //Getters 
    get userId() { return this.#userId; }
    get cpf() { return this.#cpf; }
    get gender() { return this.#gender; }
    get maritalStatus() { return this.#maritalStatus; }
    get address() { return this.#address; }
    get emergencyContactName() { return this.#emergencyContactName; }
    get emergencyContactPhone() { return this.#emergencyContactPhone; }
    get healthPlan() { return this.#healthPlan; }
    get cardNumber() { return this.#cardNumber; }
    get dateBirth() { return this.#dateBirth; }

    //Cria query para salvar dados paciente
    async savePatientData(conn) {
        await conn.query(
            `INSERT INTO patient (
            userId, 
            cpf, 
            gender, 
            maritalStatus, 
            address, 
            emergencyContactName, 
            emergencyContactPhone,
            healthPlan,
            cardNumber,
            dateBirth
            ) VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [
                this.userId, 
                this.cpf, 
                this.gender, 
                this.maritalStatus,
                this.address,
                this.emergencyContactName,
                this.emergencyContactPhone,
                this.healthPlan,
                this.cardNumber,
                this.dateBirth
            ]
        );
    }

    static async findByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT 
            patientId, 
            userId, 
            cpf, 
            gender, 
            maritalStatus, 
            address, 
            emergencyContactName, 
            emergencyContactPhone,
            healthPlan,
            cardNumber,
            dateBirth 
            FROM patient WHERE userId = ?`, [userId]
        );
        return rows[0];
    }

    //------ Método agendamento de consulta -------//
    static async saveAppointment(appointment) {
        try {
            const status = "AGENDADA";
            const [result] = await pool.query(
            `INSERT INTO consultations
            (patientId, professionalId, consultationDate, consultationTime, statusConsultations, notes)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [
                appointment.patientId, 
                appointment.professionalId, 
                appointment.consultationDate, 
                appointment.consultationTime, 
                status, 
                appointment.notes || null
            ]
            );
            return result;
        } catch (err) {     
            return console.log(err, "Erro ao tentar salvar no banco de dados");
        }
    }

    //--------- Método para cancelar consulta ------//
    static async canceledAppointment(status) {
        console.log(status);
        try {
            const [result] = await pool.query(
            `UPDATE consultations SET statusConsultations = ? WHERE consultationId = ?`,
            [status.newStatus, status.id]
            );

            return result;
            
        } catch (err) {
            return console.log(err, "Erro ao tentar alterar status da consulta");
        }
    }
};