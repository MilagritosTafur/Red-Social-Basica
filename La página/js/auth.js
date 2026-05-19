function verificarSesion() {
    const sesion = localStorage.getItem('sesion');
    if (sesion) window.location.href = 'index.html';
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
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
}

function mostrarMensaje(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = 'block';
    setTimeout(() => el.style.display = 'none', 3000);
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

function mostrarFuerzaPass(pass) {
    const div = document.getElementById('pass-fuerza');
    if (!div) return;
    const errores = validarContrasena(pass);
    const fuerza = 3 - errores.length;
    if (pass.length === 0) {
        div.innerHTML = '';
        return;
    }
    const colores = ['#E24B4A', '#BA7517', '#1D9E75'];
    const textos = ['Débil', 'Regular', 'Fuerte'];
    const barras = ['33%', '66%', '100%'];
    div.innerHTML =
        '<div class="pass-barra-wrap">' +
        '<div class="pass-barra" style="width:' +
        (barras[fuerza - 1] || '10%') +
        ';background:' +
        (colores[fuerza - 1] || '#E24B4A') + '">' +
        '</div>' +
        '</div>' +
        '<span style="font-size:11px;color:' +
        (colores[fuerza - 1] || '#E24B4A') + '">' +
        (textos[fuerza - 1] || 'Muy débil') +
        '</span>';
}

document.getElementById('btn-registro')
    .addEventListener('click', () => {
        const nombre = document.getElementById('reg-nombre').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const carrera = document.getElementById('reg-carrera').value.trim();
        const pass = document.getElementById('reg-pass').value;
        const errorDiv = document.getElementById('reg-error');
        if (!validarNombre(nombre)) {
            errorDiv.textContent = 'El nombre solo puede tener letras y espacios.';
            mostrarMensaje('reg-error');
            return;
        }
        if (nombre.length > 60) {
            errorDiv.textContent = 'El nombre no puede tener más de 60 caracteres.';
            mostrarMensaje('reg-error');
            return;
        }
        if (!validarEmail(email)) {
            errorDiv.textContent = 'Ingresa un correo válido (ej: tu@utp.edu.pe).';
            mostrarMensaje('reg-error');
            return;
        }
        if (!validarTexto(carrera, 60)) {
            errorDiv.textContent = 'Ingresa una carrera válida.';
            mostrarMensaje('reg-error');
            return;
        }
        const erroresPass = validarContrasena(pass);
        if (erroresPass.length > 0) {
            errorDiv.textContent = 'Contraseña débil: ' + erroresPass.join(', ');
            mostrarMensaje('reg-error');
            return;
        }
        const existe = getUsuarios().find(
            u => u.email.toLowerCase() === email.toLowerCase()
        );
        if (existe) {
            errorDiv.textContent = 'Este correo ya está registrado.';
            mostrarMensaje('reg-error');
            return;
        }

        mostrarSpinner('btn-registro', 'reg-texto', 'reg-spinner');
        setTimeout(() => {
            guardarUsuario({
                nombre: sanitizar(nombre),
                email: email.toLowerCase(),
                carrera: sanitizar(carrera),
                pass
            });

            savePerfil({
                nombre: sanitizar(nombre),
                email: email.toLowerCase(),
                carrera: sanitizar(carrera),
                ciclo: '1',
                bio: 'Hola, soy nuevo en CONECTA UTP.',
                avatar: 'img/avatar.png'
            });

            document.getElementById('reg-nombre').value = '';
            document.getElementById('reg-email').value = '';
            document.getElementById('reg-carrera').value = '';
            document.getElementById('reg-pass').value = '';

            ocultarSpinner('btn-registro', 'reg-texto', 'reg-spinner');
            mostrarMensaje('reg-success');
            setTimeout(() => switchTab('login'), 1500);
        }, 800);
    });

document.getElementById('btn-login')
    .addEventListener('click', () => {
        const email = document.getElementById('login-email')
            .value.trim();
        const pass = document.getElementById('login-pass').value;
        const errorDiv = document.getElementById('login-error');
        if (!email || !pass) {
            errorDiv.textContent =
                'Por favor ingresa tu correo y contraseña.';
            mostrarMensaje('login-error');
            return;
        }
        if (!validarEmail(email)) {
            errorDiv.textContent = 'Ingresa un correo válido.';
            mostrarMensaje('login-error');
            return;
        }

        mostrarSpinner('btn-login', 'login-texto', 'login-spinner');

        setTimeout(() => {
            const usuarios = getUsuarios();
            const usuario = usuarios.find(
                u => u.email.toLowerCase() === email.toLowerCase()
                    && u.pass === pass
            );

            if (!usuario) {
                errorDiv.textContent = 'Correo o contraseña incorrectos.';
                mostrarMensaje('login-error');
                ocultarSpinner('btn-login', 'login-texto', 'login-spinner');
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
                bio: getPerfil().bio || 'Hola, soy nuevo en CONECTA UTP.',
                avatar: 'img/avatar.png'
            });
            window.location.href = 'index.html';
        }, 800);
    });

document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const loginVisible =
        document.getElementById('body-login').style.display !== 'none';
    if (loginVisible) {
        document.getElementById('btn-login').click();
    } else {
        document.getElementById('btn-registro').click();
    }
});

function mostrarSpinner(btnId, textoId, spinnerId) {
    document.getElementById(btnId).disabled = true;
    document.getElementById(textoId).style.display = 'none';
    document.getElementById(spinnerId).style.display = 'inline';
}

function ocultarSpinner(btnId, textoId, spinnerId) {
    document.getElementById(btnId).disabled = false;
    document.getElementById(textoId).style.display = 'inline';
    document.getElementById(spinnerId).style.display = 'none';
}

verificarSesion();