document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const fileInput = document.getElementById('fileInput');
  const modeSelect = document.getElementById('modeSelect');
  const formatSelect = document.getElementById('formatSelect');
  const qualityRange = document.getElementById('qualityRange');
  const qualityVal = document.getElementById('qualityVal');
  const widthInput = document.getElementById('widthInput');
  const heightInput = document.getElementById('heightInput');
  const resizeMimeSelect = document.getElementById('resizeMimeSelect');
  const resizeQuality = document.getElementById('resizeQuality');
  const resizeQualityVal = document.getElementById('resizeQualityVal');
  const goButton = document.getElementById('goButton');
  const logEl = document.getElementById('log');
  const obeDiv = document.getElementById('obe');
  const downloadLink = document.getElementById('downloadLink');

  const convertControls = document.getElementById('convertControls');
  const compressControls = document.getElementById('compressControls');
  const resizeControls = document.getElementById('resizeControls');

  let selectedFile = null;

  // -------------- Utilities --------------

  const canvasToBlob = (canvas, type, quality) =>
    new Promise(resolve => canvas.toBlob(resolve, type || undefined, quality));

  const loadImageFromFile = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('File read failed'));
      reader.readAsDataURL(file);
    });

  function drawToCanvas(img, width, height) {
    const w = width || img.naturalWidth || img.width;
    const h = height || img.naturalHeight || img.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);
    return canvas;
  }

  // --- BMP encoder (24-bit) ---
  function encodeBMPFromCanvas(canvas) {
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, w, h);

    const rowSize = (((w * 24 + 31) / 32) | 0) * 4;
    const pixelArraySize = rowSize * h;
    const fileSize = 54 + pixelArraySize;

    const buffer = new ArrayBuffer(fileSize);
    const dv = new DataView(buffer);
    let p = 0;

    // FILE HEADER
    dv.setUint8(p++, 0x42); // 'B'
    dv.setUint8(p++, 0x4D); // 'M'
    dv.setUint32(p, fileSize, true); p += 4;
    dv.setUint16(p, 0, true); p += 2;
    dv.setUint16(p, 0, true); p += 2;
    dv.setUint32(p, 54, true); p += 4;

    // INFO HEADER
    dv.setUint32(p, 40, true); p += 4;      // header size
    dv.setInt32(p,  w, true); p += 4;
    dv.setInt32(p,  h, true); p += 4;
    dv.setUint16(p, 1, true); p += 2;
    dv.setUint16(p, 24, true); p += 2;      // 24 bpp
    dv.setUint32(p, 0, true); p += 4;       // BI_RGB
    dv.setUint32(p, pixelArraySize, true); p += 4;
    dv.setInt32(p, 2835, true); p += 4;     // ~72 DPI
    dv.setInt32(p, 2835, true); p += 4;
    dv.setUint32(p, 0, true); p += 4;       // colors used
    dv.setUint32(p, 0, true); p += 4;

    // Pixel data (BGR bottom-up) + padding
    const rowPad = rowSize - w * 3;
    let offset = 54;
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        dv.setUint8(offset++, data[i + 2]); // B
        dv.setUint8(offset++, data[i + 1]); // G
        dv.setUint8(offset++, data[i + 0]); // R
      }
      for (let k = 0; k < rowPad; k++) dv.setUint8(offset++, 0);
    }
    return new Blob([buffer], { type: 'image/bmp' });
  }

  // --- AVIF verification: ensure it’s truly AVIF, not PNG fallback ---
  async function verifyAvifBlob(blob) {
    if (!blob || blob.type !== 'image/avif') return false;
    const buf = await blob.arrayBuffer();
    // Look for ftyp brand 'avif' or 'avis' early in the file
    const bytes = new Uint8Array(buf.slice(0, 64));
    const text = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
    return text.includes('ftypavif') || text.includes('ftypavis');
  }

  // --- Try encode with canvas encoder ---
  async function encodeWithCanvas(canvas, mime, quality) {
    const blob = await canvasToBlob(canvas, mime, quality);
    // Some browsers may set blob.type='' even if encoded; enforce type for safety
    if (blob && mime && (!blob.type || blob.type === 'application/octet-stream')) {
      try { return blob.slice(0, blob.size, mime); } catch { return blob; }
    }
    return blob;
  }

  // --- Generic operation helpers ---

  async function doConvert(file, outMime, opts = {}) {
    const img = await loadImageFromFile(file);
    const canvas = drawToCanvas(img, opts.width, opts.height);

    if (outMime === 'image/bmp') {
      return encodeBMPFromCanvas(canvas); // always works
    }
    if (outMime === 'image/avif') {
      const blob = await encodeWithCanvas(canvas, 'image/avif', opts.quality ?? 0.9);
      if (blob && await verifyAvifBlob(blob)) return blob;
      throw new Error('AVIF encoding not supported in this browser (or produced invalid AVIF).');
    }
    // PNG / JPEG / WEBP etc.
    const blob = await encodeWithCanvas(canvas, outMime, opts.quality);
    if (!blob) throw new Error('Encoding failed or format not supported.');
    return blob;
  }

  async function doCompress(file, opts = {}) {
    const img = await loadImageFromFile(file);
    const canvas = drawToCanvas(img);
    const inputType = file.type || 'image/png';

    // Choose sensible default target based on input + requested opts
    const outMime = opts.mime ||
      ((inputType === 'image/jpeg' || (opts.quality && opts.quality <= 0.1))
        ? 'image/jpeg'
        : 'image/webp');

    return doConvert(file, outMime, { quality: opts.quality });
  }

  async function doResize(file, opts = {}) {
    const img = await loadImageFromFile(file);

    // Compute dimensions with aspect ratio preservation when one is missing
    let { width, height } = opts;
    const imgW = img.naturalWidth || img.width;
    const imgH = img.naturalHeight || img.height;
    const ar = imgW / imgH;
    if (!width && height) width = Math.round(height * ar);
    if (width && !height) height = Math.round(width / ar);
    if (!width && !height) { width = imgW; height = imgH; }

    const canvas = drawToCanvas(img, width, height);
    const outMime = opts.mime || (file.type || 'image/png');

    if (outMime === 'image/bmp') {
      return encodeBMPFromCanvas(canvas);
    }
    if (outMime === 'image/avif') {
      const blob = await encodeWithCanvas(canvas, 'image/avif', opts.quality ?? 0.9);
      if (blob && await verifyAvifBlob(blob)) return blob;
      throw new Error('AVIF encoding not supported in this browser (or produced invalid AVIF).');
    }
    const blob = await encodeWithCanvas(canvas, outMime, opts.quality);
    if (!blob) throw new Error('Resize encoding failed or format not supported.');
    return blob;
  }

  function extFromMime(mime, fallback = 'png') {
    if (!mime) return fallback;
    const t = mime.split('/')[1] || fallback;
    // Handle jpeg vs jpg preference
    return t === 'jpeg' ? 'jpg' : t;
  }

  function setPreviewAndDownload(blob, filenameBase = 'output') {
    const url = URL.createObjectURL(blob);
    obeDiv.innerHTML = `<img src="${url}" alt="Preview" style="max-width:100%;height:auto;">`;
    downloadLink.href = url;
    const ext = extFromMime(blob.type, 'png');
    downloadLink.download = `${filenameBase}.${ext}`;
    downloadLink.style.display = 'inline';
  }

  function log(msg) {
    logEl.value = (logEl.value ? logEl.value + '\n' : '') + msg;
  }

  // -------------- UI wiring --------------

  fileInput.addEventListener('change', e => {
    selectedFile = e.target.files[0] || null;
    logEl.value = '';
    obeDiv.innerHTML = '';
    downloadLink.style.display = 'none';
  });

  qualityRange.addEventListener('input', () => {
    qualityVal.textContent = Number(qualityRange.value).toFixed(2);
  });

  resizeQuality.addEventListener('input', () => {
    resizeQualityVal.textContent = Number(resizeQuality.value).toFixed(2);
  });

  modeSelect.addEventListener('change', () => {
    logEl.value = '';
    obeDiv.innerHTML = '';
    downloadLink.style.display = 'none';
    const mode = modeSelect.value;
    convertControls.style.display  = (mode === 'convert')  ? '' : 'none';
    compressControls.style.display = (mode === 'compress') ? '' : 'none';
    resizeControls.style.display   = (mode === 'resize')   ? '' : 'none';
  });

  goButton.addEventListener('click', async () => {
    logEl.value = '';
    if (!selectedFile) {
      alert('No image file selected.');
      return;
    }

    try {
      const mode = modeSelect.value;
      let blob;

      if (mode === 'convert') {
        const outMime = formatSelect.value;
        blob = await doConvert(selectedFile, outMime, { quality: 0.9 });
        log(`Converted to ${outMime}`);

      } else if (mode === 'compress') {
        const q = Number(qualityRange.value);
        blob = await doCompress(selectedFile, { quality: q });
        log(`Compressed with quality=${q}`);

      } else { // resize
        const w = Number(widthInput.value) || undefined;
        const h = Number(heightInput.value) || undefined;
        const outMime = resizeMimeSelect.value || (selectedFile.type || 'image/png');
        const q = Number(resizeQuality.value);
        blob = await doResize(selectedFile, { width: w, height: h, mime: outMime, quality: q });
        log(`Resized to ${w || 'auto'} x ${h || 'auto'} as ${outMime} (q=${q})`);
      }

      setPreviewAndDownload(blob, 'image');

    } catch (err) {
      console.error(err);
      log(`Error: ${err.message}`);
      alert(err.message);
    }
  });

  // Initial state
  modeSelect.dispatchEvent(new Event('change'));
});
