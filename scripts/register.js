const registerBtn = document.getElementById("register");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

registerBtn.addEventListener("click", async(event) =>{
    event.preventDefault();
    const data = new FormData();

    data.append("username",usernameInput.value);
    data.append("email",emailInput.value);
    data.append("password",passwordInput.value);

    try{
        const response = await axios("http://localhost:8080/expense-tracker-website/APIs/register.php",{
            method:"POST",
            data:data,
        });

        if (response.data.status === "Register successful") {
            window.location.href = "login.html";
        } else {
            //console.log("Failed");
        }
    } 
    catch (error) {
        //console.error("An error occurred:", error);
    }
});