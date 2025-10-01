const form = document.getElementById("changePasswordForm");
const errorMsg = document.getElementById("errorMsg");

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "👁";
  } else {
    input.type = "password";
    btn.textContent = "👁";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!newPassword || !confirmPassword) {
    showError("Preencha todos os campos!");
    return;
  }

  if (newPassword !== confirmPassword) {
    showError("As senhas não coincidem!");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || "Erro ao alterar a senha!");
      return;
    }

    alert("Senha alterada com sucesso!");
    window.location.href = "./home.html";
  } catch (error) {
    console.error("Erro de conexão:", error);
    showError("Erro de conexão com o servidor!");
  }
});

function showError(message) {
  errorMsg.textContent = message;
}
