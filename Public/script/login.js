function togglePasswordVisibility() {
    var passwordInput = document.getElementById("password");
    var togglePassword = document.querySelector(".toggle-password");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.textContent = "Hide";
    } else {
        passwordInput.type = "password";
        togglePassword.textContent = "Show";
    }
}


document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    fetch('/login', {

        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password, rememberMe }) 
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Invalid username or password');
        }
    })
    .then(data => {
        sessionStorage.setItem('authorized', true);
        sessionStorage.setItem('authorizedUsername', data.username);
        sessionStorage.setItem('AccountType', data.accountType);
        window.location.href = '/';
    })    
    .catch(error => {
        alert(error.message);
    });
});
