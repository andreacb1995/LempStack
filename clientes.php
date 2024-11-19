<?php
// Mostrar errores para propósitos de depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Habilitar CORS para permitir todas las solicitudes
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de solicitudes OPTIONS para la verificación CORS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Conectar a la base de datos
$servername = "localhost";
$username = "root";
$password = ""; // Ajustar según tu configuración de XAMPP
$dbname = "lempstack";

$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar la conexión
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Manejar diferentes métodos de solicitud
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Lógica para obtener clientes
        $sql = "SELECT * FROM clientes";
        $result = $conn->query($sql);
        $clientes = [];
        while ($row = $result->fetch_assoc()) {
            $clientes[] = $row;
        }
        echo json_encode($clientes);
        break;

    case 'POST':
        // Lógica para añadir un cliente
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "INSERT INTO clientes (nombre, apellidos, telefono, dni, direccion, codigo_postal, pais, email, estado, notas, foto)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssssss", $data['nombre'], $data['apellidos'], $data['telefono'], $data['dni'], $data['direccion'],
                          $data['codigo_postal'], $data['pais'], $data['email'], $data['estado'], $data['notas'], $data['foto']);
        $stmt->execute();
        echo json_encode(["message" => "Cliente añadido exitosamente"]);
        break;

    case 'PUT':
        // Lógica para actualizar un cliente
        parse_str($_SERVER['QUERY_STRING'], $query);
        $id = $query['id'];
        $data = json_decode(file_get_contents("php://input"), true);
        $sql = "UPDATE clientes SET nombre=?, apellidos=?, telefono=?, dni=?, direccion=?, codigo_postal=?, pais=?, email=?, estado=?, notas=?, foto=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssssssi", $data['nombre'], $data['apellidos'], $data['telefono'], $data['dni'], $data['direccion'],
                          $data['codigo_postal'], $data['pais'], $data['email'], $data['estado'], $data['notas'], $data['foto'], $id);
        $stmt->execute();
        echo json_encode(["message" => "Cliente actualizado exitosamente"]);
        break;

    case 'DELETE':
        // Lógica para eliminar un cliente
        parse_str($_SERVER['QUERY_STRING'], $query);
        if (isset($query['id'])) {
            $id = intval($query['id']);
            $sql = "DELETE FROM clientes WHERE id=?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("i", $id);
            if ($stmt->execute()) {
                echo json_encode(["message" => "Cliente eliminado exitosamente"]);
            } else {
                http_response_code(500);
                echo json_encode(["message" => "Error al eliminar el cliente"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["message" => "ID del cliente no proporcionado"]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["message" => "Método no permitido"]);
        break;
}

$conn->close();
?>
