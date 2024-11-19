<?php
// Permitir acceso desde cualquier origen para desarrollo (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");


// Configuración de la base de datos
$servername = "localhost";
$username = "root";  // Reemplaza con tu usuario de MySQL
$password = "";      // Reemplaza con la contraseña de MySQL
$dbname = "lempstack"; // Nombre de la base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("Conexión fallida: " . $conn->connect_error);
}

// Leer los datos recibidos en la solicitud POST
$data = json_decode(file_get_contents("php://input"));

// Verificar si se proporcionaron datos correctos
if (isset($data->username) && isset($data->password)) {
    $nuevoUsuario = $conn->real_escape_string(trim($data->username));
    $nuevaContrasena = trim($data->password);

    // Verificar si el usuario ya existe
    $sqlCheckUser = "SELECT * FROM usuarios WHERE username = '$nuevoUsuario'";
    $result = $conn->query($sqlCheckUser);

    if ($result->num_rows == 0) {
        // Si no existe, crear el usuario con la contraseña proporcionada (hash)
        $hashedPassword = password_hash($nuevaContrasena, PASSWORD_DEFAULT);
        $sqlInsertUser = "INSERT INTO usuarios (username, password) VALUES ('$nuevoUsuario', '$hashedPassword')";
        if ($conn->query($sqlInsertUser) === TRUE) {
            echo json_encode(["success" => true, "message" => "Usuario '$nuevoUsuario' creado correctamente."]);
        } else {
            echo json_encode(["success" => false, "message" => "Error al crear usuario: " . $conn->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "El usuario '$nuevoUsuario' ya existe."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Datos incompletos para crear un usuario."]);
}

// Cerrar la conexión
$conn->close();
?>
