
let filtroActual = 'todos';

// ── Verificar sesión ──
(function verificarAcceso() {
    const sesion = localStorage.getItem('sesion');
    if (!sesion) window.location.href = 'login.html';
})();

// ── Actualizar navbar ──
function actualizarNavbar() {
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (!sesion) return;
    const iniciales = sesion.nombre
        .split(' ').map(n => n[0]).join('')
        .substring(0, 2).toUpperCase();
    document.getElementById('nav-username').textContent =
        'Hola, ' + sesion.nombre.split(' ')[0];
    document.getElementById('nav-avatar').textContent = iniciales;
}

// ── Cerrar sesión ──
function cerrarSesion() {
    localStorage.removeItem('sesion');
    window.location.href = 'login.html';
}

// ── Cambiar filtro ──
function setFiltro(filtro, btn) {
    filtroActual = filtro;
    document.querySelectorAll('.filtro-btn')
        .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buscarPosts();
}

// ── Buscar posts ──
function buscarPosts() {
    const query = document.getElementById('input-buscar')
        .value.trim().toLowerCase();
    let posts = getPosts();

    if (filtroActual === 'hashtag') {
        posts = posts.filter(p => /#\w+/.test(p.texto));
    } else if (filtroActual === 'recientes') {
        const hace24h = Date.now() - 24 * 60 * 60 * 1000;
        posts = posts.filter(p =>
            new Date(p.fecha).getTime() > hace24h
        );
    }

    if (query) {
        posts = posts.filter(p =>
            p.texto.toLowerCase().includes(query) ||
            p.autor.toLowerCase().includes(query)
        );
    }

    const count = document.getElementById('resultados-count');
    count.textContent = query || filtroActual !== 'todos'
        ? `${posts.length} resultado${posts.length !== 1 ? 's' : ''}`
        : '';

    renderResultados(posts);
}

// ── Renderizar resultados ──
function renderResultados(posts) {
    const feed = document.getElementById('explorar-feed');
    const query = document.getElementById('input-buscar')
        .value.trim().toLowerCase();
    const sesion = JSON.parse(localStorage.getItem('sesion'));

    if (posts.length === 0) {
        feed.innerHTML = `
    <div class="empty">
        No se encontraron posts 🔍
    </div>`;
        return;
    }

    feed.innerHTML = posts.map(post => {
        const fecha = new Date(post.fecha);
        const tiempo = fecha.toLocaleDateString('es-PE', {
            day: 'numeric', month: 'short',
            hour: '2-digit', minute: '2-digit'
        });

        const iniciales = post.autor
            .split(' ').map(n => n[0]).join('')
            .substring(0, 2).toUpperCase();

        let textoMostrar = post.texto;
        if (query) {
            const regex = new RegExp(`(${query})`, 'gi');
            textoMostrar = post.texto.replace(
                regex,
                '<mark class="highlight">$1</mark>'
            );
        }

        textoMostrar = textoMostrar.replace(
            /#\w+/g,
            '<span class="hashtag">$&</span>'
        );

        const esDueno = sesion && post.autor === sesion.nombre;

        return `
        <div class="post">
        <div class="post-head">
        <div class="avatar-md">${iniciales}</div>
        <div class="post-info">
            <div class="post-name">
            ${post.autor}
            ${esDueno
                ? '<span class="role-tag tag-oficial">Tú</span>'
                : '<span class="role-tag tag-student">Estudiante</span>'
            }
            </div>
            <div class="post-meta">${tiempo}</div>
        </div>
        </div>
        <div class="post-body">${textoMostrar}</div>
        <div class="post-actions">
        <span class="act">♥ ${post.likes}</span>
        </div>
    </div>
    `;
    }).join('');
}

// ── Inicializar ──
actualizarNavbar();
buscarPosts();