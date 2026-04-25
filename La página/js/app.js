
function renderFeed() {
  const feed = document.getElementById('feed');
  const posts = getPosts();

  if (posts.length === 0) {
    feed.innerHTML = `
      <div class="empty">
        ¡Bienvenido a CONECTA UTP! 
        Sé el primero en publicar algo 🎉
      </div>`;
    return;
  }

  
  feed.innerHTML = posts.map(post => {
    
    const fecha = new Date(post.fecha);
    const tiempo = fecha.toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });

    const yaLike = post.likedBy.includes(getPerfil().nombre);

    const iniciales = post.autor
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return `
      <div class="post" id="post-${post.id}">
        <div class="post-head">
          <div class="avatar-md">${iniciales}</div>
          <div class="post-info">
            <div class="post-name">${post.autor}
              <span class="role-tag tag-student">Estudiante</span>
            </div>
            <div class="post-meta">${tiempo}</div>
          </div>
        </div>
        <div class="post-body">${post.texto}</div>
        <div class="post-actions">
          <button class="act ${yaLike ? 'liked' : ''}"
            onclick="handleLike(${post.id})">
            ♥ ${post.likes}
          </button>
          <button class="act"
            onclick="handleDelete(${post.id})">
            🗑 Eliminar
          </button>
        </div>
      </div>
    `;
  }).join('');
}


function actualizarNavbar() {
  const perfil = getPerfil();
  const iniciales = perfil.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  document.getElementById('nav-username').textContent =
    'Hola, ' + perfil.nombre.split(' ')[0];
  document.getElementById('nav-avatar').textContent = iniciales;
  document.getElementById('compose-avatar').textContent = iniciales;
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
  });


document.getElementById('texto-post')
  .addEventListener('input', function() {
    const restantes = 280 - this.value.length;
    const contador = document.getElementById('contador');
    contador.textContent = restantes;
    contador.style.color = restantes < 20 ? '#C8102E' : '';
  });


function handleLike(postId) {
  toggleLike(postId);
  renderFeed();
}

function handleDelete(postId) {
  if (confirm('¿Eliminar esta publicación?')) {
    deletePost(postId);
    renderFeed();
  }
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


actualizarNavbar();
renderFeed();