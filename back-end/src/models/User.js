import { pool } from '../config/db.js';



// Classe Usuario
export default class User {
    #fullName
    #email
    #password
    #id 
    #typeUser
    #phone  

    constructor(fullName, email, password, typeUser, phone, id = null) {
        this.#fullName = fullName;
        this.#email = email;
        this.#password = password;
        this.#typeUser = typeUser;
        this.#phone = phone;
        this.#id = id;
    }

    //getters
    get id() { return this.#id; }
    get fullName() { return this.#fullName; }
    get email() { return this.#email; }
    get password() { return this.#password; }
    get typeUser() { return this.#typeUser; }
    get phone() { return this.#phone; }
    
    // Setter
    set id(value) {
        this.#id = value;
    }
    
    set password(value) {
        if (!value || value.length < 8) {
            throw new Error("Senha deve ter pelo menos 8 caracteres!");
        }
        this.#password = value;
    }

    async saveUser(conn) {
        const [result] = await conn.query(
                `INSERT INTO users (fullName, email, passw, typeUser, phone) VALUES (?,?,?,?,?)`,
                [this.fullName, this.email, this.password, this.typeUser, this.phone]
            );
            this.id = result.insertId;
            return this.id;
    }

    static async getByEmail(email) {
        const [rows] = await pool.query(
            `SELECT
            userId, 
            fullName, 
            email, 
            passw, 
            typeUser, 
            must_change_password, 
            phone 
            FROM users WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    }

    static async getById(userId) {
        const [rows] = await pool.query(
            `SELECT
            userId, 
            fullName, 
            email, 
            passw, 
            typeUser, 
            must_change_password, 
            phone 
            FROM users WHERE userId = ?`,
            [userId]
        );
        return rows[0] || null;
    }

};
