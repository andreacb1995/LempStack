document.addEventListener('DOMContentLoaded', function () {
  // Crear usuario admin si no existe
  fetch('http://localhost/lempstack/crear_usuario.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: 'admin', password: '12345' })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log(data.message); // Usuario creado o ya existente
    } else {
      console.error(data.message); // Error al crear usuario (si existiera algún problema)
    }
  })
  .catch(error => console.error('Error al crear el usuario admin:', error));

  // Lógica del formulario de login
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevenir la recarga de la página al enviar el formulario

    // Obtener valores ingresados
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('errorMessage');

    // Crear un objeto con las credenciales del usuario
    const userData = {
      username: username,
      password: password
    };

    // Hacer la petición al backend PHP para validar las credenciales
    fetch('http://localhost/lempstack/login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Redirigir a pantalla de clientes si el login es exitoso
        window.location.href = 'clientes.html';
      } else {
        // Mostrar mensaje de error si las credenciales son incorrectas
        errorMessage.textContent = data.message || 'Usuario o contraseña incorrectos.';
        errorMessage.style.display = 'block';
      }
    })
    .catch(error => {
      console.error('Error al intentar iniciar sesión:', error);
      errorMessage.textContent = 'Hubo un error al intentar iniciar sesión.';
      errorMessage.style.display = 'block';
    });
  });
});
