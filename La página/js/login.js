function verificarSesion() {
    const sesion = localStorage.getItem('sesion');
    if (sesion) {
        window.location.href = 'index.html';
    }
}

function switchTab(tab) {
    const esLogin = tab === 'login';
    document.getElementById('tab-login')
        .classList.toggle('active', esLogin);
    document.getElementById('tab-registro')
        .classList.toggle('active', !esLogin);
    document.getElementById('body-login')
        .style.display = esLogin ? 'flex' : 'none';
    document.getElementById('body-registro')
        .style.display = esLogin ? 'none' : 'flex';
    ocultarMensajes();
}

function ocultarMensajes() {
    ['login-error', 'reg-error', 'reg-success']
        .forEach(id => {
            document.getElementById(id).style.display = 'none';
        });
}

function mostrarMensaje(id) {
    document.getElementById(id).style.display = 'block';
    setTimeout(() => {
        document.getElementById(id).style.display = 'none';
    }, 3000);
}

function getUsuarios() {
    const data = localStorage.getItem('usuarios');
    return data ? JSON.parse(data) : [];
}

function guardarUsuario(usuario) {
    const usuarios = getUsuarios();
    usuarios.push(usuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

document.getElementById('btn-registro')
    .addEventListener('click', () => {
        const nombre = document.getElementById('reg-nombre').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const carrera = document.getElementById('reg-carrera').value.trim();
        const pass = document.getElementById('reg-pass').value;

        if (!nombre || !email || !carrera || !pass) {
            mostrarMensaje('reg-error');
            document.getElementById('reg-error').textContent =
                'Por favor completa todos los campos.';
            return;
        }

        if (pass.length < 6) {
            mostrarMensaje('reg-error');
            document.getElementById('reg-error').textContent =
                'La contraseña debe tener al menos 6 caracteres.';
            return;
        }

        const usuarios = getUsuarios();
        const existe = usuarios.find(u => u.email === email);
        if (existe) {
            mostrarMensaje('reg-error');
            document.getElementById('reg-error').textContent =
                'Este correo ya está registrado.';
            return;
        }

        guardarUsuario({ nombre, email, carrera, pass });

        savePerfil({
            nombre,
            email,
            carrera,
            ciclo: '1',
            bio: 'Hola, soy nuevo en CONECTA UTP.',
            avatar: 'img/avatar.png'
        });

        document.getElementById('reg-nombre').value = '';
        document.getElementById('reg-email').value = '';
        document.getElementById('reg-carrera').value = '';
        document.getElementById('reg-pass').value = '';

        mostrarMensaje('reg-success');
        setTimeout(() => switchTab('login'), 1500);
    });

document.getElementById('btn-login')
    .addEventListener('click', () => {
        const email = document.getElementById('login-email').value.trim();
        const pass = document.getElementById('login-pass').value;

        if (!email || !pass) {
            mostrarMensaje('login-error');
            document.getElementById('login-error').textContent =
                'Por favor ingresa tu correo y contraseña.';
            return;
        }

        const usuarios = getUsuarios();
        const usuario = usuarios.find(
            u => u.email === email && u.pass === pass
        );

        if (!usuario) {
            mostrarMensaje('login-error');
            document.getElementById('login-error').textContent =
                'Correo o contraseña incorrectos.';
            return;
        }

        localStorage.setItem('sesion', JSON.stringify({
            nombre: usuario.nombre,
            email: usuario.email,
            carrera: usuario.carrera
        }));

        savePerfil({
            nombre: usuario.nombre,
            email: usuario.email,
            carrera: usuario.carrera,
            ciclo: '1',
            bio: 'Hola, soy nuevo en CONECTA UTP.',
            avatar: 'img/avatar.png'
        });

        window.location.href = 'index.html';
    });

verificarSesion();