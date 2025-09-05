

// Classe Paciente 
export default class Patient {
    #userId
    #dateBirth
    #gender
    #cpf
    #phone
    #address
    constructor({userId, dateBirth, gender, cpf, phone, address }) {
        this.#userId = userId;
        this.#dateBirth = dateBirth;
        this.#gender = gender;
        this.#cpf = cpf,
        this.#phone = phone,
        this.#address = address
    }

    //Getters 
    get userId() { return this.#userId; }
    get dateBirth() { return this.#dateBirth; }
    get gender() { return this.#gender; }
    get cpf() { return this.#cpf; }
    get phone() { return this.#phone; }
    get address() { return this.#address; }

    async print() {
        console.log(this.address);
        console.log(this.userId);
    }
    async savePatient() {
        console.log("Veio aqui save");
        const [result] = await pool.execute(
            `INSERT INTO patient (userId, cpf, phone, gender, address, dateBirth ) VALUES (?,?,?,?,?,?)`,
            [this.userId, this.cpf, this.phone, this.gender, this.address, this.#dateBirth]
        );
        return result;
    }
}