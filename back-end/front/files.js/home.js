const token = localStorage.getItem("token");
if (!token) window.location.href = "../index.html";

const userNameEl = document.getElementById("userName");
const mainMenu = document.getElementById("mainMenu");
const payload = parseJwt(token);

if (!payload) {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
}

userNameEl.textContent = payload.fullName;

// ---------- Função para decodificar JWT ----------
function parseJwt(token) {
  try { return JSON.parse(atob(token.split(".")[1])); } 
  catch (e) { return null; }
}

// ---------- Funções auxiliares de data/hora ----------
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR"); // 09/09/2025
}

function formatTime(timeStr) {
  return timeStr.slice(0, 5); // HH:mm
}

// ---------- Menu dinâmico ----------
function renderMenu(typeUser) {
  // Menu base sempre visível
  const menuItems = ["Início", "Consultas", "Exames", "Perfil"];

  // Adiciona "Prontuário" somente se for PROFISSIONAL
  if (typeUser === "PROFISSIONAL") {
    menuItems.splice(3, 0, "Prontuário"); // insere antes de Perfil
  }

  if (typeUser === "ADMIN") {
    menuItems.splice(1, 0, "Usuários"); // aparece logo depois de "Início"
  }

  mainMenu.innerHTML = menuItems
    .map((item) => `<li><a href="#" data-section="${item.toLowerCase()}Section">${item}</a></li>`)
    .join("");

  // Navegação SPA com segurança
  document.querySelectorAll("#mainMenu a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const targetId = link.dataset.section;
      const section = document.getElementById(targetId);

      if (section) {
        document.querySelectorAll(".page-section").forEach(sec => sec.classList.remove("active"));
        section.classList.add("active");
      } else {
        console.warn(`Seção ${targetId} não existe no HTML`);
      }
    });
  });
}

renderMenu(payload.typeUser);

// ---------- Slider ----------
const slides = document.querySelectorAll(".slide");
let currentSlide = 0;

function showSlide(index) {
  slides.forEach(s => s.classList.remove("active"));
  slides[index].classList.add("active");
}

document.getElementById("prevSlide").addEventListener("click", () => {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  showSlide(currentSlide);
});

document.getElementById("nextSlide").addEventListener("click", () => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
});

setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000);

// ---------- Notícias ----------
function loadNews() {
  const news = [
    "Novo protocolo de segurança implementado.",
    "Sistema atualizado com agendamento online.",
    "Dicas de saúde para pacientes crônicos."
  ];
  document.getElementById("newsContainer").innerHTML =
    news.map(n => `<div class="news-item">${n}</div>`).join("");
}
loadNews();

const btnSchedule = document.getElementById("btnSchedule");
  if (btnSchedule) {
    btnSchedule.addEventListener("click", () => {
      window.location.href = "scheduleAppointment.html";
    });
  }


async function loadDashboard() {
  try {
    const response = await fetch(`http://localhost:3000/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao carregar dados");
      return;
    }

    // ----------- PACIENTE ----------- //
    if (payload.typeUser === "PACIENTE") {
      const patientId = data.dataPatient.patientId;

      // buscar consultas do paciente
      const res = await fetch(
        `http://localhost:3000/api/appointment/patient/${patientId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const consultations = await res.json();
   
      renderList({ type: "PACIENTE", consultations });
    }

    // ----------- PROFISSIONAL ----------- //
    else if (payload.typeUser === "PROFISSIONAL") {
      renderList({ type: "PROFISSIONAL", records: data.records || [] });
    }

    // ----------- ADM ----------- //
    else if (payload.typeUser === "ADMIN") {
      renderList({ type: "ADMIN", users: data.users || [] });
    }

  } catch (err) {
    console.error("Erro no loadDashboard:", err);
    alert("Erro de conexão com o servidor");
  }
}

function renderList(data) {
  const usersContainer = document.getElementById("usersContainer");
  const cardsContainer = document.getElementById("cardsContainer");
  let htmlAppoint = "";
  let htmlUsers = "";

 if (data.type === "PACIENTE") {
  if (!data.consultations || data.consultations.length === 0) {
    htmlAppoint = "<p>Nenhuma consulta agendada.</p>";
  } else {
    htmlAppoint = data.consultations.map(c => {
      // Só exibe botão se a consulta não estiver cancelada
      let cancelButton = "";
      if (c.statusConsultations !== "CANCELADA") {
        cancelButton = `<button class="cancel-btn" data-id="${c.consultationId}">Cancelar Consulta</button>`;
      }

      return `
        <div class="list-item">
          <span><strong>Data</strong></span>
          <p>${formatDate(c.consultationDate)} - ${formatTime(c.consultationTime)}</p>
          <br>
          <hr>
          <br>
          <span><strong>Profissional</strong></span> 
          <p>${c.professionalName}</p>
          <br>
          <hr>
          <br>
          <span><strong>Especialidade</strong></span> 
          <p>${c.professionalSpecialty}</p>
          <br>
          <hr>
          <br>
          <span><strong>Status</strong></span> 
          <p class="statusAppoin ${c.statusConsultations.toLowerCase()}">
            ${c.statusConsultations}
          </p>
          <br>
          <br>
          <hr>
          <br>
          <span><strong>Informações</strong></span>
          <p>${c.notes}</p>
          <br>
          <hr>
          <br>

          ${cancelButton}
        </div>
      `;
    }).join("");
  }

  if (!data.exams ||  data.exams.length === 0) {
    html = "<p>Nenhum Exame</p>";
  }
}


  if (data.type === "PROFISSIONAL") {
    if (data.records.length === 0) {
      html = "<p>Nenhum prontuário disponível.</p>";
    } else {
      data.records.forEach(r => {
        html += `
          <div class="list-item">
            <h4>Prontuário do paciente ${r.patientName}</h4>
            <p><strong>Data:</strong> ${formatDate(r.date)}</p>
            <p><strong>Diagnóstico:</strong> ${r.diagnosis}</p>
            <p><strong>Exames:</strong> ${r.exams.join(", ")}</p>
          </div>`;
      });
    }
  }

 if (data.type === "ADMIN") {
  htmlUsers = `
    <div class="admin-actions">
      <button id="btnAddUser" class="add-user-btn">➕ Adicionar Usuário</button>
    </div>

    <div class="search-user">
      <input type="text" id="searchCpf" placeholder="Digite o CPF do usuário" />
      <button id="btnSearchUser" class="search-btn">🔍 Consultar</button>
    </div>

    <div id="searchResult"></div>
  `;

  if (data.users.length === 0) {
    htmlUsers += "<p>Nenhum usuário cadastrado.</p>";
  } else {
    htmlUsers += "<h3>Usuários Cadastrados</h3>";
    data.users.forEach(u => {
      htmlUsers += `
        <div class="list-item">
          <h4>${u.fullName}</h4>
          <p><strong>Email:</strong> ${u.email}</p>
          <p><strong>Tipo:</strong> ${u.typeUser}</p>
          <p><strong>CPF:</strong> ${u.cpf || "Não informado"}</p>
          ${u.typeUser === "PROFISSIONAL" ? `
            <p><strong>Especialidade:</strong> ${u.specialty || "Não informado"}</p>
            <p><strong>CRM:</strong> ${u.crm || "Não informado"}</p>
          ` : ""}
          ${u.typeUser === "ADMIN" ? `
            <p><strong>Permissões:</strong> ${u.permissions?.join(", ") || "Padrão"}</p>
          ` : ""}
        </div>`;
    });
  }
}


  usersContainer.innerHTML = htmlUsers;
  cardsContainer.innerHTML = htmlAppoint;
}

document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cancel-btn")) {
    const consultationId = e.target.dataset.id;

    const IntConsultationId = Number(consultationId);
    if (!confirm("Deseja realmente cancelar esta consulta?")) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/appointment/patient/${IntConsultationId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ statusConsultations: "CANCELADA" })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Consulta cancelada com sucesso!");
        loadDashboard(); // recarrega a lista de consultas
      } else {
        alert(result.error || "Erro ao cancelar consulta");
      }
    } catch (err) {
      console.error("Erro ao cancelar consulta:", err);
      alert("Erro de conexão com o servidor.");
    }
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id === "btnAddUser") {
    window.location.href = "userRegistration.html";
  }
});


// ---------- Logout ----------
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
});

// Inicializa
loadDashboard();