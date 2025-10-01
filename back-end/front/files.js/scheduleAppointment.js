document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "../index.html";

  const payload = parseJwt(token);
  if (!payload) {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
  }

  const form = document.getElementById("formAgendamento");
  const professionalSelect = document.getElementById("professional");
  const messageEl = document.getElementById("message");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!form || !professionalSelect || !messageEl) {
    console.error("Algum elemento não encontrado no DOM");
    return;
  }

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "../index.html";
  });

  // Decodifica JWT
  function parseJwt(token) {
    try { 
      return JSON.parse(atob(token.split(".")[1])); 
    } catch (e) { 
      return null; 
    }
  }

  // Carrega profissionais
  async function loadProfessionals() {
    try {
      const response = await fetch("http://localhost:3000/api/professionals", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const professionals = await response.json();
      professionalSelect.innerHTML = `
        <option value="">Selecione</option>
        ${professionals.map(p => `<option value="${p.professionalId}">${p.fullName} - ${p.specialty}</option>`).join("")}
      `;
    } catch (err) {
      console.error("Erro ao carregar profissionais:", err);
      messageEl.textContent = "Não foi possível carregar profissionais.";
      messageEl.style.color = "red";
    }
  }

  // Envio do formulário
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      patientId: payload.userId, // ajusta se for diferente
      professionalId: professionalSelect.value,
      consultationDate: document.getElementById("consultationDate").value,
      consultationTime: document.getElementById("consultationTime").value,
      notes: document.getElementById("notes").value
    };

    try {
      const response = await fetch("http://localhost:3000/api/appointment", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.textContent = "Consulta agendada com sucesso!";
        messageEl.style.color = "green";
        form.reset();
      } else {
        messageEl.textContent = result.error || "Erro ao agendar consulta";
        messageEl.style.color = "red";
      }
    } catch (err) {
      console.error("Erro ao agendar consulta:", err);
      messageEl.textContent = "Erro de conexão com o servidor.";
      messageEl.style.color = "red";
    }
  });

  // Inicializa
  loadProfessionals();
});
