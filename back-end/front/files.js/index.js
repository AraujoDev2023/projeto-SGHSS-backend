const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("msg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Validação rápida no front
  if (!email || !password) {
    showMgs("Preencha todos os campos!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      showMgs(data.message || "Email ou senha incorretos!");
      return;
    }

    if (data) {
      // Salva token no localStorage
      localStorage.setItem("token", data.token);

      if (data.mustChangePassword === 1) {
        // Usuário precisa alterar senha temporária
        window.location.href = "./pages/change-password.html";
      } else {
        // Login normal
        window.location.href = "./pages/home.html";
      }
     
    } else {
      showMgs(data.message || "E-mail ou senha inválidos!");
    }
  } catch (error) {
    console.error("Erro de conexão:", error);
    showMgs("Erro de conexão com o servidor!");
  }
});

// Função para exibir erro estilizado
function showMgs(message) {
  errorMsg.textContent = message;
  errorMsg.style.color = "red";
  errorMsg.style.boxShadow = "0px 0px 8px red";
  errorMsg.style.padding = "6px";
  errorMsg.style.borderRadius = "4px";
}
