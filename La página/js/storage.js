
function getPosts() {
  const data = localStorage.getItem('posts');
  return data ? JSON.parse(data) : [];
}

function savePosts(posts) {
  localStorage.setItem('posts', JSON.stringify(posts));
}

function addPost(texto) {
  const posts = getPosts();

  const textoSeguro = sanitizar(texto.trim());

  const nuevoPost = {
    id: Date.now(),
    texto: textoSeguro, 
    autor: sanitizar(getPerfil().nombre),
    fecha: new Date().toISOString(),
    likes: 0,
    likedBy: []
  };

  posts.unshift(nuevoPost);
  savePosts(posts);
  return nuevoPost;
}

function toggleLike(postId) {
  const posts = getPosts();

  const post = posts.find(p => p.id === postId);
  if (!post) return; 

  const usuario = getPerfil().nombre;
  
  if (post.likedBy.includes(usuario)) {
    post.likes--;
    post.likedBy = post.likedBy.filter(u => u !== usuario);
  } else {
    post.likes++;
    post.likedBy.push(usuario);
  }

  savePosts(posts);
  return post;
}

function deletePost(postId) {
  const posts = getPosts().filter(p => p.id !== postId);
  savePosts(posts);
}

function getPerfil() {
  const data = localStorage.getItem('perfil');
  return data ? JSON.parse(data) : {
    nombre: 'Usuario',
    carrera: 'Carrera',
    ciclo: '1',
    bio: 'Hola, soy nuevo en CONECTA UTP.',
    avatar: 'img/avatar.png'
  };
}

function savePerfil(perfil) {
  localStorage.setItem('perfil', JSON.stringify(perfil));
}

function saveSugerencia(sugerencia) {
  const sugerencias = getSugerencias();
  sugerencias.push({
    id: Date.now(),
    ...sugerencia,        
    fecha: new Date().toISOString()
  });
  localStorage.setItem('sugerencias', JSON.stringify(sugerencias));
}

function getSugerencias() {
  const data = localStorage.getItem('sugerencias');
  return data ? JSON.parse(data) : [];
}

function getNotificaciones() {
  const data = localStorage.getItem('notificaciones');
  return data ? JSON.parse(data) : [];
}

function saveNotificacion(notif) {
  const notifs = getNotificaciones();
  notifs.unshift({
    id: Date.now(),
    ...notif,
    leida: false,
    fecha: new Date().toISOString()
  });
  localStorage.setItem('notificaciones', JSON.stringify(notifs));
}

function marcarLeidas() {
  const notifs = getNotificaciones().map(n => ({...n, leida: true}));
  localStorage.setItem('notificaciones', JSON.stringify(notifs));
}

function contarNoLeidas() {
  return getNotificaciones().filter(n => !n.leida).length;
}

function sanitizar(texto) {
  return texto
    .replace(/&/g, '&amp;')  
    .replace(/</g, '&lt;')    
    .replace(/>/g, '&gt;') 
    .replace(/"/g, '&quot;')  
    .replace(/'/g, '&#x27;'); 
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validarContrasena(pass) {
  const errores = [];
  if (pass.length < 8)
    errores.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(pass))
    errores.push('Al menos una mayúscula');
  if (!/[0-9]/.test(pass))
    errores.push('Al menos un número');
  return errores;
}


function validarTexto(texto, max = 280) {
  if (!texto || !texto.trim()) return false;
  if (texto.trim().length > max) return false;
  return true;
}

function validarNombre(nombre) {
  const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/;
  return regex.test(nombre.trim()) && nombre.trim().length >= 2;
}