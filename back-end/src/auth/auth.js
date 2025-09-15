import { verificationEmailLogin } from "../controllers/userController.js";


// Autenticação login
export const login = async (req, res) => {
    const { email, password } = req.body;

    // Validação
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Preencha todos os campos!" });
    }
    // Envia dados para validação no Controllers.js
    const dataValid = await verificationEmailLogin(email, password);

    const passwordTemp = dataValid.must_change_password;
    console.log(passwordTemp);
    // Verificação se estudo correto
    if (dataValid) {
        return res.status(201).json({ passwordTemp, success: true ,message: "Logado com sucesso!"});
    }
    return res.status(401).json({ success: false ,message: "Email ou Senha incorreto!"});         
}