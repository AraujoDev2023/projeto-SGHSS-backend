const form = document.getElementById("createUserForm");
const typeUserSelect = document.getElementById("typeUser");
const extraFieldsContainer = document.getElementById("extraFields");
const messageEl = document.getElementById("message");

const token = localStorage.getItem("token");

// Se não for ADM, redireciona
function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } catch (e) { return null; }
}
const payload = parseJwt(token);
/*if (!payload || payload.typeUser !== "ADMIN") {
  alert("Acesso negado! Somente administradores podem criar usuários.");
  window.location.href = "../index.html";
}*/

// Renderizar campos dinâmicos
typeUserSelect.addEventListener("change", () => {
  const type = typeUserSelect.value;
  let fields = "";

  if (type === "PROFISSIONAL") {
    fields = `
      <label for="specialty">Especialidade</label>
      <input type="text" id="specialty" name="specialty" required>

      <label for="council">Tipo de Registro</label>
        <select id="council" name="council" required>
            <option value="">Selecione...</option>
            <option value="CRM">CRM</option>
            <option value="COREN">COREN</option>
            <option value="CRO">CRO</option>
            <option value="CRP">CRP</option>
        </select>

      <label for="registrationNumber">Número do Registro</label>
      <input type="text" id="registrationNumber" name="registrationNumber" required>
    `;
  } else if (type === "ADMIN") {
    fields = `
      <label for="can_manage_users">Gerenciar usuários</label>
      <select id="can_manage_users" name="can_manage_users" required>
        <option value="">Selecione...</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>

      <label for="can_manage_reports">Gerenciar relatórios</label>
      <select id="can_manage_reports" name="can_manage_reports" required>
        <option value="">Selecione...</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>

      <label for="can_manage_system">Gerenciar sistema</label>
      <select id="can_manage_system" name="can_manage_system" required>
        <option value="">Selecione...</option>
        <option value="true">Sim</option>
        <option value="false">Não</option>
      </select>
    `;
  } else if (type === "PACIENTE") {
    fields = `
        <label for="birthDate">Data de Nascimento</label>
        <input type="date" id="birthDate" name="birthDate" required>

        <label for="cpf">CPF</label>
        <input type="text" id="cpf" name="cpf" required>

        <label for="maritalStatus">Estado Civil</label>
        <select id="maritalStatus" name="maritalStatus" required>
            <option value="">Selecione...</option>
            <option value="CASADO(A)">CASADO(A)</option>
            <option value="SOLTEIRO(A)">SOLTEIRO(A)</option>
            <option value="VIUVO(A)">VIUVO(A)</option>
        </select>

        <label for="address">Endereço</label>
        <input type="text" id="address" name="address" required>

        <label for="emergencyContactName">Nome para Emergência</label>
        <input type="text" id="emergencyContactName" name="emergencyContactName" required>

        <label for="emergencyContactPhone">Telefone para Emergência</label>
        <input type="text" id="emergencyContactPhone" name="emergencyContactPhone" required>

        <label for="healthPlan">Plano de Saúde</label>
        <input type="text" id="healthPlan" name="healthPlan" required>

        <label for="cardNumber">Número do cartão</label>
        <input type="text" id="cardNumber" name="cardNumber" required>

      <label for="gender">Sexo</label>
      <select id="gender" name="gender" required>
        <option value="">Selecione...</option>
        <option value="MASCULINO">Masculino</option>
        <option value="FEMININO">Feminino</option>
      </select>
    `;
  }

  extraFieldsContainer.innerHTML = fields;
});

// Submissão do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("http://localhost:3000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    if (response.ok) {
        messageEl.textContent = "Usuário criado com sucesso!";
        messageEl.style.color = "green";
        form.reset();
        extraFieldsContainer.innerHTML = "";
        alert(
            "Usuário cadastrado com sucesso");
        setTimeout(() => {
            window.location.href = "home.html"; 
        }, 3000); 
    } else {
      messageEl.textContent = result.error || "Erro ao criar usuário.";
      messageEl.style.color = "red";
    }
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    messageEl.textContent = "Erro de conexão com o servidor.";
    messageEl.style.color = "red";
  }
});
