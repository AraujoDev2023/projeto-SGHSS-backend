import validator from "validator";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { pool } from "../config/db.js";

// Classe Usuario
export default class User {
    #fullName
    #email
    #password
    #id 
    #typeUser  

    constructor(fullName, email, password, typeUser, id = null) {
        this.#fullName = fullName;
        this.#email = email;
        this.#password = password;
        this.#typeUser = typeUser;
        this.#id = id
    }

    //getters
    get id() { return this.#id; }
    get fullName() { return this.#fullName; }
    get email() { return this.#email; }
    get password() { return this.#password; }
    get typeUser() { return this.#typeUser; }

    // Setter com validações
    set email(value) {
        if (!validator.isEmail(value)) {
            throw new Error("Email inválido!");
        }
        this.#email = value;
    }
    
    set password(value) {
        if (!value || value.length < 8) {
            throw new Error("Senha deve ter pelo menos 8 caracteres!");
        }
        this.#password = value;
    }

    // Hashing senha
    async hashPassword() {
        this.#password = await bcrypt.hash(this.#password, 10);
    }
    
   
}
