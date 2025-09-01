import User from "./User.js";

// Class Profissional
export default class Professionel extends User {
    constructor({ id, fullName, email, password, crm, specialty }) {
        super({ id, fullName, email, password, typeUser: "PROFISSIONAL"});
        this._crm = crm;
        this._specialty = specialty;
    }

    // Getters
    get crm() { return this._crm; }
    get specialty() { return this._specialty; }

    //setter
    set crm(value) {
        if (!value || value.lenght < 4) {
            throw new Error("CRM Invalido!");
        }
        this._crm = value; 
    }
}