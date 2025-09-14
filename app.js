// ====== UTIL ======
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

// ====== THEME (igual que antes) ======
const THEME_KEY = "pc_theme";
function applyTheme(t){
  document.documentElement.setAttribute("data-theme",
    t==="dark" ? "dark" : t==="contrast" ? "contrast" : t==="pastel" ? "pastel" : "light"
  );
}
function initTheme(){
  const saved = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(saved);
  const radio = document.querySelector(`#themeRow input[value="${saved}"]`);
  if(radio) radio.checked = true;
}
$('#themeRow').addEventListener('change',(e)=>{
  if(e.target.name==='theme'){
    localStorage.setItem(THEME_KEY, e.target.value);
    applyTheme(e.target.value);
  }
});
initTheme();

// ====== TTS ======
let VOICES = [], currentVoice = null;
const preferred = [
  "Microsoft Sabina Online (Natural) - Spanish (Mexico)",
  "Microsoft Dalia Online (Natural) - Spanish (Mexico)",
  "Google español de Estados Unidos", "Google español", "es-AR","es-ES","es-MX","Spanish"
];
function bestSpanishVoice(list){
  for(const p of preferred){
    const v = list.find(v => (v.name && v.name.includes(p)) || (v.lang && v.lang.toLowerCase().includes(p.toLowerCase())));
    if(v) return v;
  }
  return list.find(v=>v.lang?.toLowerCase().startsWith("es")) || list[0] || null;
}
function populateVoices(){
  VOICES = speechSynthesis.getVoices();
  const sel = $("#voiceSelect"); sel.innerHTML="";
  VOICES.forEach((v,i)=>{
    const o = document.createElement("option");
    o.value = i; o.textContent = `${v.name} (${v.lang})${v.default?" — predeterminada":""}`;
    sel.appendChild(o);
  });
  const best = bestSpanishVoice(VOICES);
  if(best){
    currentVoice = best;
    const idx = VOICES.indexOf(best);
    if(idx>=0) sel.value = String(idx);
  }
}
if("speechSynthesis" in window){
  speechSynthesis.onvoiceschanged = populateVoices;
  setTimeout(populateVoices, 100);
}
$("#voiceSelect").addEventListener("change", e => currentVoice = VOICES[+e.target.value]);

function speak(text){
  if(!text || !("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  if(currentVoice) u.voice = currentVoice;
  u.rate   = parseFloat($("#rate").value);
  u.pitch  = parseFloat($("#pitch").value);
  u.volume = parseFloat($("#volume").value);
  u.lang   = (currentVoice && currentVoice.lang) || "es-AR";
  speechSynthesis.speak(u);
}

// Topbar actions demo
$("#playBtn").addEventListener("click", ()=>{
  const tokens = Array.from($('#phraseBar').querySelectorAll('.lbl')).map(n=>n.textContent.trim());
  const frase = tokens.join(' ');
  speak(frase || "Hola, esto es PictoComunica Pro");
});
$("#clearBtn").addEventListener("click", ()=> { $('#phraseBar').innerHTML=''; speak("Limpio"); });

// ====== PWA Install ======
const installBtn = $("#installBtn");
const modal      = $("#modal");
const modalGrid  = $("#modalGrid");
const modalTitle = $("#modalTitle");
const modalClose = $("#modalClose");

let deferredPrompt = null;

// Mostrar/ocultar botón según modo instalado
function refreshInstallButton() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  installBtn.hidden = isStandalone || !deferredPrompt;
}

window.addEventListener('beforeinstallprompt', (e) => {
  // sólo si el manifest + SW están OK y el sitio no está instalado
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false; // mostrar botón
});

installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // Una vez usado, el evento ya no sirve
    deferredPrompt = null;
    refreshInstallButton();

    if (outcome !== 'accepted') {
      // Si no aceptó, muestro instrucciones como plan B
      showInstallHelp();
    }
  } else {
    showInstallHelp();
  }
});

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
  installBtn.hidden = true;
});

// plan B: instrucciones
function showInstallHelp(){
  modalTitle.textContent = "Cómo instalar";
  modalGrid.innerHTML = `
    <div style="grid-column:1/-1; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px;">
      <p><strong>Si no aparece el botón del sistema:</strong></p>
      <ul>
        <li><b>Chrome/Edge (PC):</b> Menú ⋮ → <i>Instalar app</i>.</li>
        <li><b>Android (Chrome):</b> Menú ⋮ → <i>Agregar a pantalla de inicio / Instalar app</i>.</li>
        <li><b>iOS (Safari):</b> Compartir ⎋ → <i>Añadir a pantalla de inicio</i>.</li>
      </ul>
      <p style="color:#64748b;font-size:12px;margin-top:8px">
        Si desinstalaste hace poco, el aviso puede tardar en volver a aparecer. Podés forzarlo cerrando todas las pestañas del sitio,
        borrando <i>Datos del sitio</i> y recargando.
      </p>
    </div>`;
  modal.classList.add('open');
}
modalClose.addEventListener('click', ()=> modal.classList.remove('open'));
modal.addEventListener('click', (e)=> { if(e.target===modal) modal.classList.remove('open'); });

// Back/side drawers (izq / der) — igual a lo que ya usabas
$("#rightToggle").addEventListener("click", ()=>{
  const d = $("#configDrawer");
  const open = !d.classList.contains("open");
  d.classList.toggle("open", open);
});
$("#leftToggle").addEventListener("click", ()=>{
  const s = $("#sidebar");
  const open = !s.classList.contains("open");
  s.classList.toggle("open", open);
});

// ====== PANEL (mantén aquí tus items / modales) ======
const PANEL_ITEMS = [
  { label:"HOLA", url:"./imagenes/portada/hola.png", color:"bg-orange" },
  { label:"YO", url:"./imagenes/portada/yo.png", color:"bg-light-green" },
  { label:"TÚ", url:"./imagenes/portada/tu.png", color:"bg-light-green" },
  { label:"ÉL", url:"./imagenes/portada/el.png", color:"bg-light-green" },
  { label:"SÍ", url:"./imagenes/portada/si.png", color:"btn-dont-want" },
  { label:"NO", url:"./imagenes/portada/no.png", color:"btn-dont-want" },
  { label:"ME GUSTA", url:"./imagenes/portada/megusta.png", color:"bg-blue-pastel" },
  { label:"NO ME GUSTA", url:"./imagenes/portada/nomegusta.png", color:"bg-blue-pastel" },
  { label:"¿CÓMO ESTÁS?", url:"./imagenes/portada/comoestas.png", color:"bg-blue-pastel" },
  { label:"NÚMEROS", url:"./imagenes/numeros/numeros.png", color:"bg-light-purple", kind:"folder", set:"numeros" },

  { label:"COMIDA", url:"./imagenes/portada/alimentos.png", color:"bg-light-purple" },
  { label:"COLORES", url:"./imagenes/Colores/colores.png", color:"bg-light-purple", kind:"folder", set:"colores" },
  { label:"BUEN DÍA", url:"./imagenes/portada/buendia.png", color:"bg-orange" },
  { label:"ELLOS", url:"./imagenes/portada/ellos.png", color:"bg-light-green" },
  { label:"NOSOTROS", url:"./imagenes/portada/nosotros.png", color:"bg-light-green" },
  { label:"HACER", url:"./imagenes/portada/hacer.png", color:"bg-yellow-light" },
  { label:"BIEN", url:"./imagenes/portada/bien.png", color:"bg-blue-pastel" },
  { label:"MAL", url:"./imagenes/portada/mal.png", color:"bg-blue-pastel" },
  { label:"LINDO", url:"./imagenes/portada/lindo.png", color:"bg-blue-pastel" },
  { label:"GRANDE", url:"./imagenes/portada/grande.png", color:"bg-blue-pastel" },
  { label:"PEQUEÑO", url:"./imagenes/portada/pequeno.png", color:"bg-blue-pastel" },
  { label:"GRACIAS", url:"./imagenes/portada/gracias.png", color:"bg-blue-pastel" },
  { label:"AGUA", url:"./imagenes/portada/bebidas.png", color:"bg-light-purple" },
  { label:"ANIMALES", url:"./imagenes/portada/animales.png", color:"bg-light-purple", kind:"folder", set:"animales" },

  { label:"BUENAS NOCHES", url:"./imagenes/portada/buenasnoches.png", color:"bg-orange" },
  { label:"IR", url:"./imagenes/portada/ir.png", color:"bg-yellow-light" },
  { label:"QUIERO", url:"./imagenes/portada/quiero.png", color:"bg-yellow-light" },
  { label:"PONER", url:"./imagenes/portada/poner.png", color:"bg-yellow-light" },
  { label:"TENGO", url:"./imagenes/portada/tener.png", color:"bg-yellow-light" },
  { label:"FELÍZ", url:"./imagenes/sentimientos/contento.png", color:"bg-blue-pastel" },
  { label:"ENOJADO", url:"./imagenes/sentimientos/enfado.png", color:"bg-blue-pastel" },
  { label:"TE AMO", url:"./imagenes/portada/amar.png", color:"bg-blue-pastel" },
  { label:"+EMOCIONES", url:"./imagenes/portada/emociones.png", color:"bg-blue-pastel", kind:"folder", set:"emociones" },

  { label:"CASA", url:"./imagenes/portada/casa.png", color:"bg-light-purple" },
  { label:"FRUTAS", url:"./imagenes/portada/frutas.png", color:"bg-light-purple", kind:"folder", set:"frutas" },
  { label:"ROPA", url:"./imagenes/portada/ropa.png", color:"bg-light-purple", kind:"folder", set:"ropa" },

  { label:"CHAU", url:"./imagenes/portada/chau.png", color:"bg-orange" },
  { label:"ES", url:"./imagenes/portada/es.png", color:"bg-yellow-light" },
  { label:"SOY", url:"./imagenes/portada/soy.png", color:"bg-yellow-light" },
  { label:"ESTOY", url:"./imagenes/portada/estar.png", color:"bg-yellow-light" },
  { label:"¿CUÁNDO?", url:"./imagenes/portada/cuando.png", color:"bg-yellow-light" },

  { label:"MÁS", url:"./imagenes/portada/mas.png", color:"bg-blue-pastel" },
  { label:"MENOS", url:"./imagenes/portada/menos.png", color:"bg-blue-pastel" },
  { label:"ESCUELA", url:"./imagenes/portada/escuela.png", color:"bg-light-purple" },
  { label:"IR AL BAÑO", url:"./imagenes/portada/bano.png", color:"bg-light-purple" },
  { label:"FAMILIA", url:"./imagenes/portada/familia.png", color:"bg-light-purple", kind:"folder", set:"familia" },
  { label:"CALENDARIO", url:"./imagenes/portada/calendario.png", color:"bg-light-purple" },
  { label:"PREPOSICIONES", url:"./imagenes/portada/A.png", color:"bg-light-purple", kind:"folder", set:"prepos" }
];

function renderPanel(){
  const grid = document.getElementById('panelGrid');
  grid.innerHTML = "";
  for(const item of PANEL_ITEMS){
    const el = document.createElement('button');
    el.className = 'card';
    el.title = item.label;
    el.innerHTML = `
      <div class="picto ${item.color}">
        <img src="${item.url}" alt="${item.label}">
      </div>
      <div class="lbl">${item.label}</div>
    `;
    el.addEventListener('click', ()=>{
      if(item.kind === 'folder'){
        openSet(item.set, item.label);
      }else{
        speak(item.label);
        addToPhrase(item);
      }
    });
    grid.appendChild(el);
  }
}
function addToPhrase(item){
  const bar = $('#phraseBar');
  const token = document.createElement('div');
  token.className = 'card';
  token.style.minHeight = '64px';
  token.innerHTML = `
    <div class="picto ${item.color}" style="width:44px;height:44px">
      <img src="${item.url}" alt="">
    </div>
    <div class="lbl" style="font-size:10px">${item.label}</div>
  `;
  token.addEventListener('click', ()=> bar.removeChild(token));
  bar.appendChild(token);
}
renderPanel();

// ====== Conjuntos (abre en modal): ejemplo rápido ======
const SETS = {
  numeros: Array.from({length:11}).map((_,i)=>({label:String(i), url:`./imagenes/numeros/${i}.png`, color:'bg-light-purple'})),
  colores: [
    {label:'VERDE', url:'./imagenes/Colores/verde.png', color:'bg-light-purple'},
    {label:'ROJO', url:'./imagenes/Colores/rojo.png', color:'bg-light-purple'},
    {label:'AZUL', url:'./imagenes/Colores/azul.png', color:'bg-light-purple'},
    // ... completa con los que ya tenés
  ],
  animales: [
    {label:'GATO', url:'./imagenes/animales/gato domestico.png', color:'bg-pink-pastel'},
    {label:'PERRO', url:'./imagenes/animales/perro.png', color:'bg-pink-pastel'}
    // ...
  ],
  frutas: [
    {label:'MANZANA', url:'./imagenes/frutas/manzana.png', color:'bg-light-purple'},
    {label:'BANANA', url:'./imagenes/frutas/banana.png', color:'bg-light-purple'}
    // ...
  ],
  ropa: [
    {label:'REMERA', url:'./imagenes/ropa/remera.png', color:'bg-coral-light'},
    {label:'PANTALÓN', url:'./imagenes/ropa/pantalon (1).png', color:'bg-coral-light'}
    // ...
  ],
  familia: [
    {label:'YO', url:'./imagenes/familia/yo.png', color:''},
    {label:'MAMÁ', url:'./imagenes/familia/mama.png', color:''},
    // ...
  ],
  emociones: [
    {label:'FELÍZ', url:'./imagenes/sentimientos/contento.png', color:'bg-blue-pastel'},
    {label:'ENOJADO', url:'./imagenes/sentimientos/enfado.png', color:'bg-blue-pastel'}
    // ...
  ],
  prepos: [
    {label:'A', url:'./imagenes/portada/A.png', color:'bg-light-purple'},
    // si preferís, usá botones de texto; aquí dejo una imagen ejemplo
  ]
};

function openSet(key, title){
  const arr = SETS[key] || [];
  modalTitle.textContent = title || 'Seleccionar';
  modalGrid.innerHTML = '';
  arr.forEach(item=>{
    const el = document.createElement('button');
    el.className = 'card';
    el.innerHTML = `
      <div class="picto ${item.color}">
        <img src="${item.url}" alt="${item.label}">
      </div>
      <div class="lbl">${item.label}</div>
    `;
    el.addEventListener('click', ()=>{
      speak(item.label);
      addToPhrase(item);
      modal.classList.remove('open');
    });
    modalGrid.appendChild(el);
  });
  modal.classList.add('open');
}
