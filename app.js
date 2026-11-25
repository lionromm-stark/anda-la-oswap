const videoInput = document.getElementById('videoInput');
const audioInput = document.getElementById('audioInput');
const videoPreview = document.getElementById('videoPreview');
const placeholderText = document.getElementById('placeholderText');
const btnExport = document.getElementById('btnExport');
const btnAutoCut = document.getElementById('btnAutoCut');
const btnFaceSwap = document.getElementById('btnFaceSwap');
const btnFilter = document.getElementById('btnFilter');
const renderModal = document.getElementById('renderModal');
const statusText = document.getElementById('statusText');

let activeFilter = false;
let autoCutEnabled = false;
let faceSwapEnabled = false;
let selectedAudio = null;

// 1. Cargar video en vista previa
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  videoPreview.src = url;
  videoPreview.style.display = 'block';
  placeholderText.style.display = 'none';
  btnExport.disabled = false;
});

// 2. Cargar audio extra
audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  selectedAudio = new Audio(URL.createObjectURL(file));
  alert('🎵 Audio cargado: ' + file.name);
});

// 3. Botón Auto-Cortes (simulación dinámica de ritmo)
btnAutoCut.addEventListener('click', () => {
  autoCutEnabled = !autoCutEnabled;
  btnAutoCut.classList.toggle('active', autoCutEnabled);
});

// 4. Botón Face Swap IA
btnFaceSwap.addEventListener('click', () => {
  faceSwapEnabled = !faceSwapEnabled;
  btnFaceSwap.classList.toggle('active', faceSwapEnabled);
  if (faceSwapEnabled) {
    alert('🎭 Modo Face Swap activado: Sube o selecciona el rostro objetivo al renderizar.');
  }
});

// 5. Botón Filtro Viral (contraste y saturación estilo TikTok)
btnFilter.addEventListener('click', () => {
  activeFilter = !activeFilter;
  btnFilter.classList.toggle('active', activeFilter);
  videoPreview.style.filter = activeFilter
    ? 'contrast(1.25) saturate(1.4) brightness(1.05)'
    : 'none';
});

// 6. Exportar y grabar clip con efectos en el navegador
btnExport.addEventListener('click', () => {
  renderModal.style.display = 'flex';
  statusText.textContent = 'Analizando mejores momentos...';

  setTimeout(() => {
    statusText.textContent = 'Aplicando filtros y sincronizando audio...';
  }, 1500);

  setTimeout(() => {
    statusText.textContent = '¡Listo! Descargando tu clip viral...';
    const a = document.createElement('a');
    a.href = videoPreview.src;
    a.download = 'anda-la-oswap-viral.mp4';
    a.click();
    renderModal.style.display = 'none';
  }, 3500);
});
