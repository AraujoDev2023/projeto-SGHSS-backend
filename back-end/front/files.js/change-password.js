document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const msg = document.getElementById("msg");

  msg.textContent = "";

  if (newPassword !== confirmPassword) {
    msg.textContent = "As senhas não coincidem!";
    msg.style.color = "red";
    msg.style.boxShadow = "0px 0px 8px red";
    return;
  }

  try {
    const email = async (email) => {
        return email;
    }
    
    const response = await fetch("http://localhost:3000/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      msg.textContent = "Senha alterada com sucesso!";
      msg.style.color = "green";
      msg.style.boxShadow = "0px 0px 8px green";

      setTimeout(() => {
        window.location.href = "/login.html";
      }, 2000);
    } else {
      msg.textContent = data.message || "Erro ao trocar senha!";
      msg.style.color = "red";
      msg.style.boxShadow = "0px 0px 8px red";
    }
  } catch (error) {
    msg.textContent = "Erro de conexão!";
    msg.style.color = "red";
    msg.style.boxShadow = "0px 0px 8px red";
  }
});
