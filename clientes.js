const traduccionesPaises = {
  Spain: "España",
  "United States": "Estados Unidos",
  Brazil: "Brasil",
  "United Kingdom": "Reino Unido",
  France: "Francia",
  Germany: "Alemania",
  Italy: "Italia",
  Japan: "Japón",
};

document.addEventListener('DOMContentLoaded', function() {
  // Referencias a los elementos
  const addClientButton = document.getElementById('addClientButton'); // Botón de añadir cliente
  const formModal = document.getElementById('formModal'); // Modal del formulario
  const closeModal = document.getElementById('closeModal'); // Botón para cerrar el modal
  const addClientForm = document.getElementById('addClientForm'); // Formulario
  const modalTitle = formModal.querySelector('h2'); // Título del modal
  const submitButton = addClientForm.querySelector('button[type="submit"]'); // Botón de guardar cliente

  const confirmDeleteModal = document.getElementById('confirmDeleteModal'); // Modal de confirmación de eliminación
  const closeDeleteModal = document.getElementById('closeDeleteModal'); // Botón para cerrar el modal de eliminación
  const confirmDeleteButton = document.getElementById('confirmDeleteButton'); // Botón para confirmar eliminación
  const cancelDeleteButton = document.getElementById('cancelDeleteButton'); // Botón para cancelar eliminación
  const allOptionsMenus = document.querySelectorAll('.options-menu');

  let isEditing = false; // Variable para saber si estamos en modo edición
  let editingClientId = null; // Guardar el id del cliente que se está editando
  let clientToDeleteId = null; // Guardar el id del cliente que se va a eliminar

  // Asegurarse de que los modales estén siempre ocultos al iniciar
  formModal.style.display = 'none';
  confirmDeleteModal.style.display = 'none';

  // Abrir el modal al hacer clic en el botón de añadir cliente
  addClientButton.addEventListener('click', (event) => {
    event.stopPropagation();
    isEditing = false; // No estamos editando, estamos añadiendo
    addClientForm.reset(); // Limpiar formulario

    // Cambiar el título y el botón del modal para "Añadir Cliente"
    modalTitle.textContent = 'Nuevo Cliente';
    submitButton.innerHTML = '<i class="fas fa-save"></i> Guardar'; // Añadir ícono al botón de guardar

    abrirModal(formModal);

  });

  // Cerrar el modal al hacer clic en la 'x'
  closeModal.addEventListener('click', (event) => {
    event.stopPropagation();
    cerrarModal(formModal);
  });

  // Cerrar el modal si se hace clic fuera del contenido del modal
  window.addEventListener('click', (event) => {
    if (event.target === formModal) {
      cerrarModal(formModal);
    } else if (event.target === confirmDeleteModal) {
      cerrarModal(confirmDeleteModal);
    }
    // Cerrar todos los menús de opciones si se hace clic fuera de los menús o los botones de opciones
    const allOptionsMenus = document.querySelectorAll('.options-menu');
    allOptionsMenus.forEach(menu => {
      if (!menu.contains(event.target) && !event.target.classList.contains('options-button') && !event.target.closest('.options-button')) {
        menu.style.display = 'none'; // Ocultar el menú de opciones
      }
    });
  });

  // Añadir o modificar un cliente mediante el formulario
  addClientForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Obtener los valores del formulario
    const nombre = document.getElementById('nombre').value;
    const apellidos = document.getElementById('apellidos').value;
    const telefono = document.getElementById('telefono').value;
    const dni = document.getElementById('dni').value;
    const direccion = document.getElementById('direccion').value;
    const codigoPostal = document.getElementById('codigo_postal').value;
    const pais = document.getElementById('pais').value;
    const email = document.getElementById('email').value;
    const estado = document.getElementById('estado').value;
    const notas = document.getElementById('notas').value;
    const foto = document.getElementById('foto').value;

    // Crear un objeto de cliente para enviar al servidor
    const nuevoCliente = {
      nombre,
      apellidos,
      telefono,
      dni,
      direccion,
      codigo_postal: codigoPostal,
      pais,
      email,
      estado,
      notas,
      foto
    };

    // Si estamos editando, hacer una solicitud PUT
    if (isEditing) {
      fetch(`http://localhost/lempstack/clientes.php?id=${editingClientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoCliente)
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        mostrarModalExito('¡Cliente modificado correctamente!'); // Mostrar el modal de éxito
        // Recargar la lista de clientes
        cargarClientes();

        // Limpiar el formulario y cerrar el modal
        addClientForm.reset();
        formModal.style.display = 'none';
      })
      .catch(error => console.error('Error:', error));
    } else {
      // Si estamos añadiendo un nuevo cliente, hacer una solicitud POST
      fetch('http://localhost/lempstack/clientes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoCliente)
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        // Recargar la lista de clientes
        mostrarModalExito('¡Cliente añadido correctamente!'); // Mostrar el modal de éxito
        cargarClientes();

        // Limpiar el formulario y cerrar el modal
        addClientForm.reset();
        formModal.style.display = 'none';
      })
      .catch(error => console.error('Error:', error));
    }
  });

  // Función para editar un cliente (abre el modal con los datos pre-rellenados)
  function editarCliente(cliente) {
    isEditing = true;
    editingClientId = cliente.id;

    // Rellenar el formulario con los datos del cliente
    document.getElementById('nombre').value = cliente.nombre;
    document.getElementById('apellidos').value = cliente.apellidos;
    document.getElementById('telefono').value = cliente.telefono;
    document.getElementById('dni').value = cliente.dni;
    document.getElementById('direccion').value = cliente.direccion;
    document.getElementById('codigo_postal').value = cliente.codigo_postal;
    document.getElementById('pais').value = cliente.pais;
    document.getElementById('email').value = cliente.email;
    document.getElementById('estado').value = cliente.estado;
    document.getElementById('notas').value = cliente.notas;
    document.getElementById('foto').value = cliente.foto;

    // Cambiar el título y el botón del modal para "Modificar Cliente"
    modalTitle.textContent = 'Cliente';
    submitButton.innerHTML = '<i class="fas fa-edit"></i> Modificar'; // Añadir ícono al botón de modificar

    abrirModal(formModal);
  }

  // Cargar los clientes cuando se carga la página
  cargarClientes();

  // Función para cargar clientes (fetch con GET)
  function cargarClientes() {
    fetch('http://localhost/lempstack/clientes.php', {
      method: 'GET'
    })
    .then(response => response.json())
    .then(clientes => {
      renderClientes(clientes);
    })
    .catch(error => console.error('Error:', error));
  }

  // Función para renderizar los clientes
  function renderClientes(clientes) {
    const cardsContainer = document.getElementById('cardsContainer');
    cardsContainer.innerHTML = ''; // Limpiar el contenedor antes de renderizar
    clientes.forEach(cliente => {
      const card = crearTarjetaCliente(cliente);
      cardsContainer.appendChild(card);
    });
  }

  // Crear tarjeta de cliente
  function crearTarjetaCliente(cliente) {
    const card = document.createElement('div');
    card.classList.add('card');

    const img = document.createElement('img');
    // Comprobar si el cliente tiene una foto válida
    if (cliente.foto && cliente.foto.trim() !== "") {
      img.src = `imagenes/${cliente.foto}`; // Concatenar la carpeta 'imagenes/' antes del nombre del archivo
    } else {
      img.src = 'imagenes/cliente.png'; // Usar la imagen predeterminada
    }

    // Si hay un error al cargar la imagen (por ejemplo, si la imagen no existe), usar la imagen predeterminada
    img.onerror = function() {
      img.src = 'imagenes/cliente.png';
    };

    img.alt = `${cliente.nombre} ${cliente.apellidos}`;
    card.appendChild(img);

    // Añadir detalles del cliente
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const nombre = document.createElement('h2');
    nombre.textContent = `${cliente.nombre} ${cliente.apellidos}`;
    cardBody.appendChild(nombre);
    const descripcion = document.createElement('p');
    descripcion.textContent = cliente.telefono;
    cardBody.appendChild(descripcion);
    card.appendChild(cardBody);

    // Añadir botón de opciones
    const optionsButton = document.createElement('button');
    optionsButton.classList.add('options-button');
    optionsButton.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
    optionsButton.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleOptionsMenu(card);
    });
    card.appendChild(optionsButton);

    // Crear menú de opciones
    const optionsMenu = document.createElement('div');
    optionsMenu.classList.add('options-menu');
    const modifyButton = document.createElement('button');
    modifyButton.innerHTML = '<i class="fas fa-edit"></i> Modificar'; // Añadir ícono al botón de modificar

    modifyButton.addEventListener('click', () => {
      editarCliente(cliente);
      optionsMenu.style.display = 'none'; // Ocultar el menú después de modificar
    });
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar'; // Añadir ícono al botón de eliminar
    deleteButton.addEventListener('click', () => {
      clientToDeleteId = cliente.id;
      confirmDeleteModal.style.display = 'flex';
      optionsMenu.style.display = 'none'; // Ocultar el menú después de seleccionar eliminar
    });
    optionsMenu.appendChild(modifyButton);
    optionsMenu.appendChild(deleteButton);
    card.appendChild(optionsMenu);

    return card;
  }

  // Función para alternar la visibilidad del menú de opciones
  function toggleOptionsMenu(card) {
    const optionsMenu = card.querySelector('.options-menu');
    const optionsButton = card.querySelector('.options-button');
  // Cerrar cualquier otro menú abierto
  const allMenus = document.querySelectorAll('.options-menu');
  allMenus.forEach(menu => {
    if (menu !== optionsMenu) {
      menu.style.display = 'none';
      menu.classList.remove('show');
    }
  });

  // Alternar visibilidad del menú actual
  if (optionsMenu.style.display === 'block') {
    optionsMenu.style.display = 'none';
    optionsMenu.classList.remove('show');
  } else {
    optionsMenu.style.display = 'block';
    setTimeout(() => optionsMenu.classList.add('show'), 10); // Añadir animación si es necesario
  }
    //optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
  }

  // Función para eliminar un cliente con confirmación
  confirmDeleteButton.addEventListener('click', () => {
    if (clientToDeleteId) {
      fetch(`http://localhost/lempstack/clientes.php?id=${clientToDeleteId}`, {
        method: 'DELETE'
      })
      .then(response => response.json())
      .then(data => {
        console.log(data.message);
        mostrarModalExito('¡Cliente eliminado correctamente!'); // Mostrar el modal de éxito

        // Recargar la lista de clientes
        cargarClientes();
        confirmDeleteModal.style.display = 'none';
      })
      .catch(error => console.error('Error:', error));
    }
  });

  // Cancelar la eliminación
  cancelDeleteButton.addEventListener('click', () => {
    confirmDeleteModal.style.display = 'none';
  });

  closeDeleteModal.addEventListener('click', () => {
    confirmDeleteModal.style.display = 'none';
  });
});

function mostrarModalExito(mensaje) {
  const successModal = document.getElementById('successModal');
  const successModalMessage = document.getElementById('successModalMessage');
  successModalMessage.textContent = mensaje; // Establecer el mensaje dinámico
  successModal.style.display = 'flex'; // Mostrar el modal

  // Ocultar automáticamente después de 3 segundos
  setTimeout(() => {
    successModal.style.display = 'none';
  }, 3000);
}

// Manejar el cierre manual del modal
document.getElementById('closeSuccessModal').addEventListener('click', () => {
  document.getElementById('successModal').style.display = 'none';
});

function cargarPaises() {
  fetch('https://restcountries.com/v3.1/all')
    .then(response => response.json())
    .then(data => {
      const paisSelect = document.getElementById('pais');
      // Ordenar países alfabéticamente
      const paises = data.sort((a, b) =>
        a.name.common.localeCompare(b.name.common)
      );

      // Rellenar el select con los países traducidos
      paises.forEach(pais => {
        const nombreEnIngles = pais.name.common;
        const nombreEnEspanol = traduccionesPaises[nombreEnIngles] || nombreEnIngles; // Usar traducción o nombre original
        const option = document.createElement('option');
        option.value = nombreEnEspanol; // Establecer el valor en español
        option.textContent = nombreEnEspanol; // Mostrar el texto en español
        paisSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Error al cargar los países:', error));
}

// Llamar a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarPaises);


function abrirModal(modal) {
  // Asegurar que la página principal está en la parte superior antes de desactivar el scroll
  window.scrollTo(0, 0);

  // Desactivar el scroll de la ventana principal cuando el modal está abierto
  document.body.style.overflow = 'hidden';

  // Mostrar el modal
  modal.style.display = 'flex';

  // Buscar el elemento que tiene el scroll interno
  const modalBody = modal.querySelector('.modal-body');
  if (modalBody) {
    modalBody.scrollTop = 0; // Restablecer el scroll del contenido del modal
  } else {
    modal.scrollTop = 0; // En caso de que modalBody no exista, restablecer el scroll del modal
  }

  // Ajustar el foco al modal para asegurarse de que se vea en la pantalla
  modal.focus();
}



function cerrarModal(modal) {
  // Ocultar el modal
  modal.style.display = 'none';

  // Reactivar el scroll de la ventana principal cuando se cierra el modal
  document.body.style.overflow = 'auto';
}