const form = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    errorMsg.textContent = "Preencha todos os campos!";
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = document.getElementById("msg");
      msg.textContent = "Email ou senha incorreto!";
      msg.style.color = "red";
      msg.style.boxShadow = "0px 0px 8px red";
      msg.style.padding = "4px"; // para o shadow não cortar o texto
      msg.style.borderRadius = "4px";
      return;
    }

    if (data.success) {
      // Salva token no localStorage (para usar em outras requisições)
      //localStorage.setItem("token", data.token);
      if (data.passwordTemp === 1) {
        window.location.href = "./pages/change-password.html";
        return;
      }
      window.location.href = "./pages/home.html";

      alert("Login realizado com sucesso!");
     
    } else {
      errorMsg.textContent = data.message || "E-mail ou senha inválidos!";
    }
  } catch (error) {
    console.error(error);
    errorMsg.textContent = "Erro de conexão com o servidor!";
  }
});
