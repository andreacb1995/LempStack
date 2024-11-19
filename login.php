<?php
// Permitir acceso desde cualquier origen para desarrollo (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

// Manejar solicitudes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de la base de datos
$servername = "localhost";
$username = "root";  // Reemplaza con tu usuario de MySQL
$password = "";      // Reemplaza con la contraseña de MySQL
$dbname = "lempstack"; // Nombre de la base de datos

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Conexión fallida: " . $conn->connect_error]);
    exit();
}

// Leer los datos recibidos en la solicitud POST
$data = json_decode(file_get_contents("php://input"));

// Verificar si los datos están presentes
if (isset($data->username) && isset($data->password)) {
    $usuario = $conn->real_escape_string(trim($data->username));
    $contrasena = trim($data->password);

    // Consultar la base de datos para verificar el usuario
    $sql = "SELECT * FROM usuarios WHERE username = '$usuario'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        // Verificar si la contraseña coincide (asumiendo que está almacenada con hash)
        if (password_verify($contrasena, $row['password'])) {
            // Contraseña correcta
            echo json_encode(["success" => true, "message" => "Login exitoso"]);
        } else {
            // Contraseña incorrecta
            echo json_encode(["success" => false, "message" => "Contraseña incorrecta"]);
        }
    } else {
        // Usuario no encontrado
        echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    }
} else {
    // Datos incompletos
    echo json_encode(["success" => false, "message" => "Datos incompletos"]);
}

$conn->close();
?>
