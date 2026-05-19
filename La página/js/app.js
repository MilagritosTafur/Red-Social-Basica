function renderFeed() {
  const feed = document.getElementById('feed');
  const posts = getPosts();
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  const usuarioActual = sesion ? sesion.nombre : '';

  if (posts.length === 0) {
    feed.innerHTML = '<div class="empty">¡Bienvenido a CONECTA UTP! Sé el primero en publicar algo 🎉</div>';
    return;
  }

  feed.innerHTML = posts.map(post => {
    const fecha = new Date(post.fecha);
    const tiempo = fecha.toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });

    const yaLike = post.likedBy.includes(usuarioActual);
    const esDueno = post.autor === usuarioActual;

    const iniciales = post.autor
      .split(' ').map(n => n[0]).join('')
      .substring(0, 2).toUpperCase();

    const btnLike = esDueno
      ? '<button class="act disabled-act" onclick="mostrarAviso()" title="No puedes dar like a tu propio post">♥ ' + post.likes + '</button>'
      : '<button class="act ' + (yaLike ? 'liked' : '') + '" onclick="handleLike(' + post.id + ')" title="Me gusta">♥ ' + post.likes + '</button>';

    const btnsDueno = esDueno
      ? '<button class="act act-edit" onclick="editarPost(' + post.id + ')">✎ Editar</button>' +
      '<button class="act act-delete" onclick="handleDelete(' + post.id + ')">🗑 Eliminar</button>'
      : '';
    // contador de comentarios.
    const totalComs = post.comentarios
      ? post.comentarios.length : 0;

    // boton de comentarios con contador dinámico,
    //  que muestra el número de comentarios y permite alternar
    //  la visibilidad de la sección de comentarios.
    const btnComentar = '<button id="btn-comentar-' + post.id + '" ' +
      'class="act" ' +
      'data-total="' + totalComs + '" ' +
      'onclick="toggleComentarios(' + post.id + ')">' +
      '💬 ' + totalComs +
      '</button>';

    // Sección de comentarios — oculta por defecto
    const seccionComentarios =
      '<div id="comentarios-' + post.id + '" ' +
      'class="comentarios-seccion" style="display:none">' +
      '<div id="lista-comentarios-' + post.id + '">' +
      '</div>' +
      '<div class="com-input-wrap">' +
      '<input type="text" ' +
      'id="input-com-' + post.id + '" ' +
      'class="com-input" ' +
      'placeholder="Escribe un comentario..." ' +
      'maxlength="200" ' +
      'onkeydown="if(event.key===\'Enter\')handleComentario(' + post.id + ')">' +
      '<button class="com-send" ' +
      'onclick="handleComentario(' + post.id + ')">→</button>' +
      '</div>' +
      '</div>';
    const tagEditado = post.editado
      ? '<span class="editado-tag">editado</span>'
      : '';


    const tagRol = esDueno
      ? '<span class="role-tag tag-oficial">Tú</span>'
      : '<span class="role-tag tag-student">Estudiante</span>';

    return '<div class="post" id="post-' + post.id + '">' +
      '<div class="post-head">' +
      '<div class="avatar-md">' + iniciales + '</div>' +
      '<div class="post-info">' +
      '<div class="post-name">' + post.autor + ' ' + tagRol + '</div>' +
      '<div class="post-meta">' + tiempo + '</div>' +
      '</div>' +
      '</div>' +
      '<div class="post-body">' + post.texto + '</div>' +
      '<div class="post-actions">' +
      btnLike + btnComentar + btnsDueno + tagEditado +
      '</div>' +
      seccionComentarios +
      '</div>';
  }).join('');
}

function actualizarNavbar() {
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  if (!sesion) return;

  const iniciales = sesion.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  document.getElementById('nav-username').textContent =
    'Hola, ' + sesion.nombre.split(' ')[0];
  document.getElementById('nav-avatar').textContent = iniciales;
  const composeAvatar = document.getElementById('compose-avatar');
  if (composeAvatar) {
    composeAvatar.textContent = iniciales;
  }

  actualizarBadgeNotif();
}

document.getElementById('btn-publicar')
  .addEventListener('click', () => {
    const textarea = document.getElementById('texto-post');
    const texto = textarea.value.trim();


    if (!texto) return;

    addPost(texto);
    textarea.value = '';
    document.getElementById('contador').textContent = '280';
    renderFeed();
    renderTendencias()
  });


document.getElementById('texto-post')
  .addEventListener('input', function () {
    const restantes = 280 - this.value.length;
    const contador = document.getElementById('contador');
    contador.textContent = restantes;
    contador.style.color = restantes < 20 ? '#C8102E' : '';
  });


function handleLike(postId) {
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  if (!sesion) return;

  const posts = getPosts();
  const post = posts.find(p => p.id === postId);

  if (post && post.autor === sesion.nombre) {
    mostrarAviso();
    return;
  }
  const yaTeníaLike = post.likedBy.includes(sesion.nombre);

  toggleLike(postId);

  if (!yaTeníaLike && post) {
    saveNotificacion({
      tipo: 'like',
      mensaje: `${sesion.nombre} le dio like a tu post`,
      postId: post.id,
      postTexto: post.texto.substring(0, 50),
      destinatario: post.autor
    });
  }

  renderFeed();
  renderTendencias();
  actualizarBadgeNotif();
}

function handleDelete(postId) {
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  if (!sesion) return;
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post || post.autor !== sesion.nombre) {
    alert('No tienes permiso para eliminar este post.');
    return;
  }
  const modal = document.getElementById('modal-confirmar');
  modal.style.display = 'flex';
  document.getElementById('btn-confirmar-eliminar')
    .onclick = () => {
      deletePost(postId);
      cerrarModal();
      renderFeed();
      renderTendencias();
    };
}
function cerrarModal() {
  document.getElementById('modal-confirmar')
    .style.display = 'none';
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') cerrarModal();
});

function mostrarAviso() {
  const aviso = document.getElementById('aviso-seguridad');
  aviso.style.display = 'block';
  setTimeout(() => aviso.style.display = 'none', 2500);
}


document.getElementById('btn-sugerencia')
  .addEventListener('click', () => {
    const nombre = document.getElementById('sug-nombre').value.trim();
    const tipo = document.getElementById('sug-tipo').value;
    const mensaje = document.getElementById('sug-mensaje').value.trim();

    if (!nombre || !mensaje) {
      alert('Por favor completa tu nombre y mensaje.');
      return;
    }

    const estrellas = document.querySelectorAll('.star.on').length;

    saveSugerencia({ nombre, tipo, mensaje, estrellas });

    document.getElementById('sug-nombre').value = '';
    document.getElementById('sug-mensaje').value = '';
    document.getElementById('btn-sugerencia').textContent = '¡Enviado! ✓';
    document.getElementById('btn-sugerencia').style.background = '#1a1a1a';

    setTimeout(() => {
      document.getElementById('btn-sugerencia').textContent = 'Enviar';
      document.getElementById('btn-sugerencia').style.background = '';
    }, 2000);
  });

document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', () => {
    const valor = parseInt(star.dataset.i);
    document.querySelectorAll('.star').forEach(s => {
      s.classList.toggle('on', parseInt(s.dataset.i) <= valor);
    });
  });
});

function cerrarSesion() {
  localStorage.removeItem('sesion');
  window.location.href = 'login.html';
}

function renderTendencias() {
  const posts = getPosts();
  const conteo = {};

  posts.forEach(post => {
    const hashtags = post.texto.match(/#\w+/g);
    if (!hashtags) return;

    hashtags.forEach(tag => {
      const tagLower = tag.toLowerCase();
      conteo[tagLower] = (conteo[tagLower] || 0) + 1;
    });
  });

  const ordenados = Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const contenedor = document.querySelector('.trend-list');
  if (!contenedor) return;

  if (ordenados.length === 0) {
    contenedor.innerHTML = `
      <div class="trend-item">
        <span class="trend-tag">#HackathonUTP</span>
        <span class="trend-n">142</span>
      </div>
      <div class="trend-item">
        <span class="trend-tag">#PrácticasPro</span>
        <span class="trend-n">89</span>
      </div>
      <div class="trend-item">
        <span class="trend-tag">#SistemasUTP</span>
        <span class="trend-n">67</span>
      </div>
      <div class="trend-item">
        <span class="trend-tag">#BecasUTP</span>
        <span class="trend-n">54</span>
      </div>
    `;
    return;
  }

  contenedor.innerHTML = ordenados.map(([tag, n]) => `
    <div class="trend-item">
      <span class="trend-tag">${tag}</span>
      <span class="trend-n">${n}</span>
    </div>
  `).join('');
}

function actualizarBadgeNotif() {
  const badge = document.getElementById('notif-count');
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  if (!sesion) return;
  const total = getNotificaciones().filter(n =>
    !n.leida &&
    n.destinatario &&
    n.destinatario.trim().toLowerCase() ===
    sesion.nombre.trim().toLowerCase()
  ).length;

  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline' : 'none';
}

function toggleNotificaciones() {
  const panel = document.getElementById('panel-notif');
  const visible = panel.style.display === 'block';

  if (!visible) {
    renderNotificaciones();
    panel.style.display = 'block';
    marcarLeidas();
    actualizarBadgeNotif();
  } else {
    panel.style.display = 'none';
  }
}
function renderNotificaciones() {
  const notifs = getNotificaciones();
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  const lista = document.getElementById('notif-lista');

  if (!sesion) return;

  const misNotifs = notifs.filter(n =>
    n.destinatario &&
    n.destinatario.trim().toLowerCase() ===
    sesion.nombre.trim().toLowerCase()
  );

  if (misNotifs.length === 0) {
    lista.innerHTML = `
      <div class="notif-empty">
        Sin notificaciones aún
      </div>`;
    return;
  }

  lista.innerHTML = misNotifs.map(n => {
    const fecha = new Date(n.fecha);
    const tiempo = fecha.toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="notif-item ${n.leida ? '' : 'no-leida'}">
        <div class="notif-icon">♥</div>
        <div class="notif-info">
          <p class="notif-msg">${n.mensaje}</p>
          <p class="notif-post">"${n.postTexto}..."</p>
          <p class="notif-fecha">${tiempo}</p>
        </div>
      </div>
    `;
  }).join('');
}

function editarPost(postId) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const postBody = document.querySelector(
    `#post-${postId} .post-body`
  );
  const postActions = document.querySelector(
    `#post-${postId} .post-actions`
  );

  postBody.innerHTML = `
    <textarea
      id="edit-${postId}"
      class="edit-textarea"
      maxlength="280">${post.texto}</textarea>
  `;

  postActions.innerHTML = `
    <button class="act act-save"
      onclick="guardarEdicion(${postId})">
      ✓ Guardar
    </button>
    <button class="act"
      onclick="renderFeed()">
      ✕ Cancelar
    </button>
  `;
}

function guardarEdicion(postId) {
  const nuevoTexto = document.getElementById(`edit-${postId}`)
    .value.trim();

  if (!nuevoTexto) {
    alert('El post no puede estar vacío.');
    return;
  }

  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;


  post.texto = nuevoTexto;
  post.editado = true;
  savePosts(posts);

  renderFeed();
  renderTendencias();
}
// ── Mostrar/ocultar comentarios ──
function toggleComentarios(postId) {
  const seccion = document.getElementById('comentarios-' + postId);
  const btn = document.getElementById('btn-comentar-' + postId);

  if (seccion.style.display === 'none') {
    seccion.style.display = 'block';
    btn.textContent = '💬 Ocultar';
    renderComentarios(postId);
  } else {
    seccion.style.display = 'none';
    btn.textContent = '💬 ' + (btn.dataset.total || '0');
  }
}

// ── Renderizar comentarios de un post ──
function renderComentarios(postId) {
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  const lista = document.getElementById('lista-comentarios-' + postId);
  const comentarios = post.comentarios || [];
  const sesion = JSON.parse(localStorage.getItem('sesion'));

  if (comentarios.length === 0) {
    lista.innerHTML = '<p class="comentario-empty">Sin comentarios aún. ¡Sé el primero!</p>';
    return;
  }

  lista.innerHTML = comentarios.map(c => {
    const fecha = new Date(c.fecha).toLocaleDateString('es-PE', {
      day: 'numeric', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });

    const iniciales = c.autor
      .split(' ').map(n => n[0]).join('')
      .substring(0, 2).toUpperCase();

    const esDueno = sesion && c.autor === sesion.nombre;

    return '<div class="comentario" id="com-' + c.id + '">' +
      '<div class="com-avatar">' + iniciales + '</div>' +
      '<div class="com-body">' +
      '<div class="com-header">' +
      '<span class="com-autor">' + c.autor + '</span>' +
      '<span class="com-fecha">' + fecha + '</span>' +
      (esDueno
        ? '<button class="com-delete" onclick="handleDeleteComentario(' + postId + ',' + c.id + ')">✕</button>'
        : '') +
      '</div>' +
      '<p class="com-texto">' + c.texto + '</p>' +
      '</div>' +
      '</div>';
  }).join('');
}

// permite agregar un comentario a un post, 
// validando que el texto no esté vacío ni exceda los 200 caracteres, 
// y luego actualiza la sección de comentarios y el contador del botón.
function handleComentario(postId) {
  const input = document.getElementById('input-com-' + postId);
  const texto = input.value.trim();

  if (!texto) return;
  if (texto.length > 200) {
    alert('El comentario no puede tener más de 200 caracteres.');
    return;
  }

  addComentario(postId, texto);
  input.value = '';
  renderComentarios(postId);

  // actualiza el contador del botón de comentarios con el nuevo total después de agregar el comentario.
  const posts = getPosts();
  const post = posts.find(p => p.id === postId);
  const btn = document.getElementById('btn-comentar-' + postId);
  const total = post.comentarios ? post.comentarios.length : 0;
  btn.dataset.total = total;
  btn.textContent = '💬 Ocultar';
}

// permite eliminar el comentario usando su id, 
// luego actualiza la sección de comentarios para reflejar el cambio.
function handleDeleteComentario(postId, comentarioId) {
  const sesion = JSON.parse(localStorage.getItem('sesion'));
  if (!sesion) return;

  deleteComentario(postId, comentarioId);
  renderComentarios(postId);
}
actualizarNavbar();
renderFeed();
renderTendencias();