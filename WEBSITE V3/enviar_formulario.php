<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];  // Added email
    $password = $_POST['password'];

    //  **IMPORTANT:** In a real application, you would:
    //  1.  Sanitize and validate the data (to prevent security issues).
    //  2.  Hash the password before storing it.  NEVER store passwords in plain text!
    //  3.  Connect to a database (MySQL, PostgreSQL, etc.) and store the user's information.

    echo "<h2>Registro Exitoso</h2>";
    echo "<p>Nombre: " . htmlspecialchars($name) . "</p>";
    echo "<p>Email: " . htmlspecialchars($email) . "</p>";  // Display email
    echo "<p>Contraseña: " . htmlspecialchars($password) . "</p>";  //  NEVER do this in production!

    //  In a real app, you'd redirect to a success page or dashboard.
} else {
    //  Handle cases where the form wasn't submitted properly.
    echo "Error: Formulario no enviado.";
}
?>