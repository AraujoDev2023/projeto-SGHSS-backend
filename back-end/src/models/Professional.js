import { pool } from "../config/db.js";

 // Class Profissional
export default class Professionel {
    #userId
    #registrationNumber
    #specialty
    #council

    constructor( userId, registrationNumber, specialty, council ) {
        this.#userId = userId;
        this.#registrationNumber = registrationNumber;
        this.#specialty = specialty;
        this.#council = council;

        console.log(
            this.#userId,
            this.#registrationNumber,
            this.#specialty,
            this.#council
        );
    }

    // Getters
    get userId() { return this.#userId; }
    get registrationNumber() { return this.#registrationNumber; }
    get specialty() { return this.#specialty; }
    get council() { return this.#council; }

    
    async saveProfessional(conn) {
        await conn.query(
            `INSERT INTO health_professional (userId, registrationNumber, specialty, council) VALUES (?,?,?,?)`,
            [this.userId, this.registrationNumber, this.specialty, this.council]
        );
    }


    
    static async findByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT 
            professionalId, 
            userId, 
            registrationNumber,  
            specialty, 
            council
            FROM health_professional WHERE userId = ?`, [userId]
        );
        return rows[0];
    }

    static async listAppointment(professionalId) {
        try {
            const [rows] = await pool.query(
            `SELECT 
                c.consultationId,
                c.consultationDate,
                c.consultationTime,
                c.statusConsultations,
                c.notes,
                u.fullName AS patientName
            FROM consultations c
            JOIN patient p 
                ON c.patientId = p.patientId
            JOIN users u 
                ON p.userId = u.userId
            WHERE c.professionalId = ?`,
            [professionalId]
            );
            return rows;
        } catch (err) {
            return err
        }
    }

    static async canceledAppointment(consultationId) {
        await pool.query(
        `UPDATE consultations 
        SET statusConsultations = 'CANCELADA' 
        WHERE consultationId = ?`,
        [consultationId]
        );
    }
};