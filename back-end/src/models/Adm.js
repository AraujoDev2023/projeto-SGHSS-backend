 import { pool } from "../config/db.js";
 
 // Classe Administrador
 export default class Admin {
    #userId
    #can_manage_users
    #can_manage_reports
    #can_manage_system
    constructor( 
        userId, 
        can_manage_users, 
        can_manage_reports, 
        can_manage_system
    ) {
        this.#userId = userId;
        this.#can_manage_users = can_manage_users;
        this.#can_manage_reports = can_manage_reports;
        this.#can_manage_system = can_manage_system;
    }

    // Getters
    get userId() { return this.#userId; }
    get can_manage_users() { return this.#can_manage_users; }
    get can_manage_reports() { return this.#can_manage_reports; }
    get can_manage_system() { return this.#can_manage_system; }

    async saveAdm(conn) {
        await conn.query(
            `INSERT INTO admin_profe (
                userId,
                can_manage_users,
                can_manage_reports,
                can_manage_system
            ) VALUES (?,?,?,?)`,
             [
                this.userId,
                this.can_manage_users,
                this.can_manage_reports,
                this.can_manage_system
             ]
        )
    }

    static async findByUserId(userId) {
        const [rows] = await pool.query(
            `SELECT 
            adminId, 
            userId, 
            can_manage_users, 
            can_manage_reports, 
            can_manage_system
            FROM admin_profe WHERE userId = ?`, [userId]
        );
        return rows[0];
    }
 };
