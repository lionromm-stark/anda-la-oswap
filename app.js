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
let customAudioUrl = null;
let currentVideoUrl = null;

// 1. Cargar video liberando memoria anterior
videoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
  currentVideoUrl = URL.createObjectURL(file);
  videoPreview.src = currentVideoUrl;
  videoPreview.style.display = 'block';
  placeholderText.style.display = 'none';
  btnExport.disabled = false;
});

// 2. Cargar audio liberando memoria anterior
audioInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (customAudioUrl) URL.revokeObjectURL(customAudioUrl);
  customAudioUrl = URL.createObjectURL(file);
  alert('🎵 Audio listo: ' + file.name);
});

// 3. Auto-Cortes (Zoom rítmico)
btnAutoCut.addEventListener('click', () => {
  autoCutEnabled = !autoCutEnabled;
  btnAutoCut.classList.toggle('active', autoCutEnabled);
});

// 4. Modo Neon / Espejo
btnFaceSwap.textContent = '✨ Efecto Neon/Espejo';
btnFaceSwap.addEventListener('click', () => {
  neonModeEnabled = !neonModeEnabled;
  btnFaceSwap.classList.toggle('active', neonModeEnabled);
  updatePreviewCSS();
});

// 5. Filtro Viral
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

// 6. Renderizado ultraligero (540x960 @ 24fps) para evitar errores de RAM en Android
btnExport.addEventListener('click', async () => {
  renderModal.style.display = 'flex';
  statusText.textContent = 'Iniciando motor ligero...';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  canvas.width = 540;
  canvas.height = 960;

  const stream = canvas.captureStream(24);
  let audioElement = null;

  if (customAudioUrl) {
    audioElement = new Audio(customAudioUrl);
    audioElement.crossOrigin = 'anonymous';
    if (audioElement.captureStream) {
      const aStream = audioElement.captureStream();
      aStream.getAudioTracks().forEach(t => stream.addTrack(t));
    }
  } else if (videoPreview.captureStream) {
    const vStream = videoPreview.captureStream();
    vStream.getAudioTracks().forEach(t => stream.addTrack(t));
  }

  const recorder = new MediaRecorder(stream, {
    mimeType: 'video/webm',
    videoBitsPerSecond: 1500000
  });
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anda-la-oswap-viral.webm';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    renderModal.style.display = 'none';
    videoPreview.muted = false;
    if (audioElement) audioElement.pause();
  };

  videoPreview.pause();
  videoPreview.currentTime = 0;
  videoPreview.muted = !!customAudioUrl;

  await videoPreview.play();
  if (audioElement) await audioElement.play();
  recorder.start(500);

  function drawFrame() {
    if (videoPreview.paused || videoPreview.ended) {
      if (recorder.state === 'recording') recorder.stop();
      return;
    }

    const t = videoPreview.currentTime;
    const progress = Math.min(100, Math.round((t / videoPreview.duration) * 100));
    statusText.textContent = `Renderizando... ${progress}%`;

    ctx.save();
    let canvasFilters = [];
    if (activeFilter) canvasFilters.push('contrast(1.28) saturate(1.45) brightness(1.06)');
    if (neonModeEnabled) canvasFilters.push('hue-rotate(25deg) contrast(1.15)');
    ctx.filter = canvasFilters.join(' ') || 'none';

    let scale = 1;
    if (autoCutEnabled && Math.floor(t / 1.5) % 2 === 1) {
      scale = 1.18;
    }

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(neonModeEnabled ? -scale : scale, scale);
    ctx.drawImage(videoPreview, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🔥 Anda la oSwap', 20, canvas.height - 28);

    requestAnimationFrame(drawFrame);
  }

  drawFrame();
});
