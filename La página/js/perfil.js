
function renderPerfil() {
  const p = getPerfil();

  const iniciales = p.nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  document.getElementById('perfil-avatar').textContent = iniciales;
  document.getElementById('perfil-nombre').textContent = p.nombre;
  document.getElementById('perfil-carrera').textContent = p.carrera;
  document.getElementById('perfil-bio').textContent = p.bio;
}


function renderMisPosts() {
  const perfil = getPerfil();
  const misPosts = getPosts()
    .filter(post => post.autor === perfil.nombre);
  const contenedor = document.getElementById('mis-posts');

  if (misPosts.length === 0) {
    contenedor.innerHTML =
      '<div class="empty">Aún no has publicado nada.</div>';
    return;
  }

  contenedor.innerHTML = misPosts.map(post => `
    <div class="post">
      <div class="post-body">${post.texto}</div>
      <div class="post-meta" style="margin-top:8px">
        ♥ ${post.likes} likes
      </div>
    </div>
  `).join('');
}

document.getElementById('btn-editar')
  .addEventListener('click', () => {
    const p = getPerfil();
    document.getElementById('input-nombre').value = p.nombre;
    document.getElementById('input-carrera').value = p.carrera;
    document.getElementById('input-bio').value = p.bio;
    document.getElementById('vista-perfil').style.display = 'none';
    document.getElementById('form-perfil').style.display = 'flex';
  });

document.getElementById('btn-guardar')
  .addEventListener('click', () => {
    savePerfil({
      nombre: document.getElementById('input-nombre').value.trim() || 'Usuario',
      carrera: document.getElementById('input-carrera').value.trim() || 'Carrera',
      bio: document.getElementById('input-bio').value.trim() || 'Sin bio todavía.',
      avatar: 'img/avatar.png'
    });
    document.getElementById('vista-perfil').style.display = 'block';
    document.getElementById('form-perfil').style.display = 'none';
    renderPerfil();
    renderMisPosts();
  });


document.getElementById('btn-cancelar')
  .addEventListener('click', () => {
    document.getElementById('vista-perfil').style.display = 'block';
    document.getElementById('form-perfil').style.display = 'none';
  });

renderPerfil();
renderMisPosts();