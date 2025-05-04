document.getElementById('login-link').addEventListener('click', function(event) {
    event.preventDefault();
    alert('Enlace a la página de inicio de sesión (implementar)');
});

document.getElementById('forgot-password-link').addEventListener('click', function(event) {
    event.preventDefault();
    alert('Enlace a la página de recuperar contraseña (implementar)');
});

function handleCredentialResponse(response) {
    //  This is where you'll send the Google ID token to your server
    //  for verification and user creation/login.
    console.log("Google Credential Response:");
    console.log(response.credential);

    fetch('/verify-google-token', { //  Send to your server endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: response.credential
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("Server response:", data);
            //  Handle server response (e.g., redirect, display message)
        })
        .catch(error => {
            console.error("Error verifying token:", error);
            //  Handle error
        });
}

window.onload = function() {
    google.accounts.id.initialize({
        client_id: "YOUR_GOOGLE_CLIENT_ID", //  Replace with your actual Client ID
        callback: handleCredentialResponse,
        auto_select: false,
    });
    google.accounts.id.renderButton(
        document.getElementById("google-button"), {
            theme: "outline",
            size: "large"
        } // customization attributes
    );
    //  Optional: If you want the one-tap prompt
    //  google.accounts.id.prompt();
};