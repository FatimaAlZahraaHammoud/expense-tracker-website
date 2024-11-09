const LoginButton = document.getElementById("login");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

LoginButton.addEventListener("click", async (event) => {
    event.preventDefault(); 

    const data = new FormData();

    data.append("username",usernameInput.value);
    data.append("email",emailInput.value);
    data.append("password",passwordInput.value);

    try {
        const response = await axios("http://localhost:8080/expense-tracker-website/APIs/login.php", {
            method: "POST",
            data:data,
        });

        if (response.data.status === "Login Succesful") {
            const UserId = response.data.UserId;
            localStorage.setItem("UserId", UserId);
            window.location.href = "transactions.html";
        } 
        else {
        }
    } catch (error) {
        //console.error("An error occurred:", error);
    }
});