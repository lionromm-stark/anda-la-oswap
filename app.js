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
let neonModeEnabled = false;
let customAudioFile = null;

// 1. Cargar video
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  videoPreview.src = URL.createObjectURL(file);
  videoPreview.style.display = 'block';
  placeholderText.style.display = 'none';
  btnExport.disabled = false;
});

// 2. Cargar audio personalizado
audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  customAudioFile = file;
  alert('🎵 Audio listo para mezclar: ' + file.name);
});

// 3. Toggle Auto-Cortes (Zoom rítmico)
btnAutoCut.addEventListener('click', () => {
  autoCutEnabled = !autoCutEnabled;
  btnAutoCut.classList.toggle('active', autoCutEnabled);
});

// 4. Toggle Modo Neon / Espejo Viral
btnFaceSwap.textContent = '✨ Efecto Neon/Espejo';
btnFaceSwap.addEventListener('click', () => {
  neonModeEnabled = !neonModeEnabled;
  btnFaceSwap.classList.toggle('active', neonModeEnabled);
  updatePreviewCSS();
});

// 5. Toggle Filtro Viral
btnFilter.addEventListener('click', () => {
  activeFilter = !activeFilter;
  btnFilter.classList.toggle('active', activeFilter);
  updatePreviewCSS();
});

function updatePreviewCSS() {
  let filters = [];
  if (activeFilter) filters.push('contrast(1.28) saturate(1.45) brightness(1.06)');
  if (neonModeEnabled) filters.push('hue-rotate(25deg) contrast(1.15)');
  videoPreview.style.filter = filters.join(' ') || 'none';
  videoPreview.style.transform = neonModeEnabled ? 'scaleX(-1)' : 'none';
}

// 6. Renderizado real mediante Canvas + MediaRecorder
btnExport.addEventListener('click', async () => {
  renderModal.style.display = 'flex';
  statusText.textContent = 'Preparando motor de renderizado...';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  // Resolución vertical óptima para móviles (720x1280)
  canvas.width = 720;
  canvas.height = 1280;

  const stream = canvas.captureStream(30);

  // Configurar pista de audio (personalizada o del video)
  let audioCtx, audioElement, dest;
  if (customAudioFile) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioElement = new Audio(URL.createObjectURL(customAudioFile));
    const source = audioCtx.createMediaElementSource(audioElement);
    dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
  } else if (videoPreview.captureStream) {
    const vidStream = videoPreview.captureStream();
    vidStream.getAudioTracks().forEach(track => stream.addTrack(track));
  }

  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anda-la-oswap-viral.webm';
    a.click();
    renderModal.style.display = 'none';
    videoPreview.muted = false;
    if (audioElement) audioElement.pause();
  };

  // Reiniciar video para grabar desde el segundo 0
  videoPreview.pause();
  videoPreview.currentTime = 0;
  videoPreview.muted = !!customAudioFile;

  await videoPreview.play();
  if (audioElement) await audioElement.play();
  recorder.start();

  // Dibujar fotograma por fotograma con efectos reales
  function drawFrame() {
    if (videoPreview.paused || videoPreview.ended) {
      if (recorder.state === 'recording') recorder.stop();
      return;
    }

    const t = videoPreview.currentTime;
    const progress = Math.min(100, Math.round((t / videoPreview.duration) * 100));
    statusText.textContent = `Renderizando clip viral... ${progress}%`;

    ctx.save();
    // Aplicar filtros reales al canvas
    let canvasFilters = [];
    if (activeFilter) canvasFilters.push('contrast(1.28) saturate(1.45) brightness(1.06)');
    if (neonModeEnabled) canvasFilters.push('hue-rotate(25deg) contrast(1.15)');
    ctx.filter = canvasFilters.join(' ') || 'none';

    // Efecto Auto-Cortes (Zoom dinámico cada 1.5 segundos)
    let scale = 1;
    if (autoCutEnabled && Math.floor(t / 1.5) % 2 === 1) {
      scale = 1.18;
    }

    // Modo espejo + escalado centrado
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(neonModeEnabled ? -scale : scale, scale);
    ctx.drawImage(videoPreview, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    // Marca de agua sutil que promociona tu web en TikTok
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('🔥 Anda la oSwap', 30, canvas.height - 40);

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
});
