import validator from "validator";


// Função para validar email
    export async function emailValidation(email) {
        try {
            if (!validator.isEmail(email)) {
            throw new Error("Email inválido!");
            }
            return email;
        } catch (err) {
            console.error("Erro ao validar email:", err.message);
            throw err; // repassa o erro para o controller tratar
        }
    }