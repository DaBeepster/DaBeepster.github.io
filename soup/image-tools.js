/* image-tools.js – works with your original HTML */
document.addEventListener('DOMContentLoaded', () => {
  // ---- Grab elements that already exist in your HTML ----
  const fileInput     = document.getElementById('fileInput');
  const encodeBtn     = document.getElementById('encodeButton');
  const displayBtn    = document.getElementById('displayButton'); // "Display File Contents" (text)
  const imageBtn      = document.getElementById('imageButton');   // "Display Image"
  const convertBtn    = document.getElementById('convertButton');
  const formatSelect  = document.getElementById('formatSelect');
  const qualityInput  = document.getElementById('qualityRange');  // number input 0..1
  const compressBtn   = document.getElementById('compressButton');
  const resizeBtn     = document.getElementById('resizeButton');
  const downloadLink  = document.getElementById('downloadLink');  // <a id="downloadLink"> inside a <button>
  const logEl         = document.getElementById('log');
  const hehTextarea   = document.getElementById('heh');
  const obeDiv        = document.getElementById('obe');

  let selectedFile = null;

  // ---- Helpers ----
  const log = (msg) => { if (logEl) logEl.value = msg; };
  const addLog = (msg) => { if (logEl) logEl.value = (logEl.value ? logEl.value + '\n' : '') + msg; };

  const canvasToBlob = (canvas, type, quality) =>
    new Promise(resolve => canvas.toBlob(resolve, type || undefined, quality));

  const loadImageFromFile = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = e => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    r.onerror = () => reject(new Error('File read failed'));
    r.readAsDataURL(file);
  });

  const drawToCanvas = (img, w, h) => {
    const W = w || img.naturalWidth || img.width;
    const H = h || img.naturalHeight || img.height;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = W; canvas.height = H;
    ctx.drawImage(img, 0, 0, W, H);
    return canvas;
  };

  const extFromMime = (mime, fallback='png') => {
    const t = (mime || '').split('/')[1] || fallback;
    return t === 'jpeg' ? 'jpg' : t;
  };

  const setPreviewAndDownload = (blob, filenameBase='image') => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    if (obeDiv) obeDiv.innerHTML = `<img src="${url}" alt="Preview" style="max-width:100%;height:auto;">`;
    if (downloadLink) {
      downloadLink.href = url;
      downloadLink.download = `${filenameBase}.${extFromMime(blob.type, 'png')}`;
      downloadLink.style.display = 'inline';
    }
  };

  // ---- Manual BMP encoder (24-bit) ----
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
    dv.setUint8(p++, 0x42); dv.setUint8(p++, 0x4D);
    dv.setUint32(p, fileSize, true); p += 4;
    dv.setUint16(p, 0, true); p += 2;
    dv.setUint16(p, 0, true); p += 2;
    dv.setUint32(p, 54, true); p += 4;

    // INFO HEADER
    dv.setUint32(p, 40, true); p += 4;
    dv.setInt32(p, w, true); p += 4;
    dv.setInt32(p, h, true); p += 4;
    dv.setUint16(p, 1, true); p += 2;
    dv.setUint16(p, 24, true); p += 2;
    dv.setUint32(p, 0, true); p += 4;        // BI_RGB
    dv.setUint32(p, pixelArraySize, true); p += 4;
    dv.setInt32(p, 2835, true); p += 4;      // ~72 DPI
    dv.setInt32(p, 2835, true); p += 4;
    dv.setUint32(p, 0, true); p += 4;
    dv.setUint32(p, 0, true); p += 4;

    // Pixel data (BGR bottom-up) + padding
    const pad = rowSize - w * 3;
    let offset = 54;
    for (let y = h - 1; y >= 0; y--) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        dv.setUint8(offset++, data[i + 2]); // B
        dv.setUint8(offset++, data[i + 1]); // G
        dv.setUint8(offset++, data[i + 0]); // R
      }
      for (let k = 0; k < pad; k++) dv.setUint8(offset++, 0);
    }
    return new Blob([buffer], { type: 'image/bmp' });
  }

  // ---- AVIF verification (prevents silent PNG) ----
  async function verifyAvifBlob(blob) {
    if (!blob || blob.type !== 'image/avif') return false;
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf.slice(0, 96));
    let s = '';
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return s.includes('ftypavif') || s.includes('ftypavis');
  }

  async function encodeWithCanvas(canvas, mime, quality) {
    const blob = await canvasToBlob(canvas, mime, quality);
    if (blob && mime && (!blob.type || blob.type === 'application/octet-stream')) {
      try { return blob.slice(0, blob.size, mime); } catch { return blob; }
    }
    return blob;
  }

  // ---- File input ----
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      selectedFile = e.target.files?.[0] || null;
      if (obeDiv) obeDiv.innerHTML = '';
      if (downloadLink) downloadLink.style.display = 'none';
      log('');
    });
  }

  // ---- Encode to Base64 (puts into #heh, preserves full data URL) ----
  if (encodeBtn) {
    encodeBtn.addEventListener('click', () => {
      if (!selectedFile) return alert('No file selected.');
      const r = new FileReader();
      r.onload = e => {
        const dataUrl = String(e.target.result);
        if (hehTextarea) hehTextarea.value = dataUrl;
        log(`Encoded ${selectedFile.name} to Base64 Data URL.`);
      };
      r.onerror = () => log('Base64 encoding failed.');
      r.readAsDataURL(selectedFile);
    });
  }

  // ---- Display File Contents (TEXT ONLY) -> writes to #heh ----
  if (displayBtn) {
    displayBtn.addEventListener('click', () => {
      if (!selectedFile) return alert('No file selected.');
      const type = selectedFile.type || '';
      const looksText = type.startsWith('text/') || type === 'application/json' || type === '';
      if (!looksText) {
        alert(`This file type (${type || 'unknown'}) is not text. Use "Display Image" for images.`);
        return;
      }
      const r = new FileReader();
      r.onload = e => {
        const txt = String(e.target.result);
        if (hehTextarea) hehTextarea.value = txt;
        if (obeDiv) obeDiv.innerHTML = '';
        log(`Displayed text: ${selectedFile.name} (${txt.length} chars)`);
      };
      r.onerror = () => log('Failed to read file as text.');
      r.readAsText(selectedFile);
    });
  }

  // ---- Display Image (preview in #obe only) ----
  if (imageBtn) {
    imageBtn.addEventListener('click', () => {
      if (!selectedFile) return alert('No file selected.');
      const type = selectedFile.type || '';
      if (!type.startsWith('image/')) {
        alert(`The selected file is not an image (${type || 'unknown type'}).`);
        return;
      }
      const url = URL.createObjectURL(selectedFile);
      if (obeDiv) obeDiv.innerHTML = `<img src="${url}" alt="Selected Image" style="max-width:100%;height:auto;">`;
      log(`Displayed image: ${selectedFile.name}`);
    });
  }

  // ---- Convert (uses #formatSelect; supports PNG/JPEG/WEBP/AVIF/BMP) ----
  if (convertBtn) {
    convertBtn.addEventListener('click', async () => {
      log('');
      if (!selectedFile) return alert('No image file selected.');

      // NOTE: your HTML has a typo: valie="avif" -> value="avif".
      // If not fixed, AVIF won't be selectable.
      const outShort = (formatSelect?.value || 'png').toLowerCase();
      const outMime = (()=>{
        if (outShort === 'png') return 'image/png';
        if (outShort === 'jpeg' || outShort === 'jpg') return 'image/jpeg';
        if (outShort === 'webp') return 'image/webp';
        if (outShort === 'bmp') return 'image/bmp';
        if (outShort === 'avif') return 'image/avif';
        return 'image/png';
      })();

      try {
        const img = await loadImageFromFile(selectedFile);
        const canvas = drawToCanvas(img);

        let blob;
        if (outMime === 'image/bmp') {
          blob = encodeBMPFromCanvas(canvas);
        } else if (outMime === 'image/avif') {
          blob = await encodeWithCanvas(canvas, 'image/avif', 0.9);
          if (!blob || !(await verifyAvifBlob(blob))) {
            throw new Error('AVIF encoding not supported (or invalid AVIF produced).');
          }
        } else {
          blob = await encodeWithCanvas(canvas, outMime, 0.92);
          if (!blob) throw new Error('Encoding failed or format not supported.');
        }

        setPreviewAndDownload(blob, 'converted-image');
        addLog(`Converted to ${outMime}`);

      } catch (err) {
        console.error(err);
        log(`Error: ${err.message}`);
        alert(err.message);
      }
    });
  }

  // ---- Compress (uses #qualityRange; JPEG under 0.1, else WEBP) ----
  if (compressBtn) {
    compressBtn.addEventListener('click', async () => {
      log('');
      if (!selectedFile) return alert('No image file selected.');

      const q = Math.max(0, Math.min(1, parseFloat(qualityInput?.value || '0.9')));
      const inputType = selectedFile.type || 'image/png';
      const outMime = (inputType === 'image/jpeg' || q <= 0.1) ? 'image/jpeg' : 'image/webp';

      try {
        const img = await loadImageFromFile(selectedFile);
        const canvas = drawToCanvas(img);
        const blob = await encodeWithCanvas(canvas, outMime, q);
        if (!blob) throw new Error('Compression failed (format not supported).');

        setPreviewAndDownload(blob, 'compressed-image');
        addLog(`Compressed as ${outMime} (q=${q})`);
      } catch (err) {
        console.error(err);
        log(`Error: ${err.message}`);
        alert(err.message);
      }
    });
  }

  // ---- Resize (prompts for W/H; keeps input MIME) ----
  if (resizeBtn) {
    resizeBtn.addEventListener('click', async () => {
      log('');
      if (!selectedFile) return alert('No image file selected.');

      try {
        const img = await loadImageFromFile(selectedFile);

        let outputWidth = parseInt(prompt(`Width? (Leave blank to auto) (${img.width})`) || '', 10);
        let outputHeight = parseInt(prompt(`Height? (Leave blank to auto) (${img.height})`) || '', 10);
        const ar = (img.width || img.naturalWidth) / (img.height || img.naturalHeight);

        if (!outputWidth && outputHeight) {
          outputWidth = Math.round(outputHeight * ar);
        } else if (outputWidth && !outputHeight) {
          outputHeight = Math.round(outputWidth / ar);
        } else if (!outputWidth && !outputHeight) {
          outputWidth = img.width; outputHeight = img.height;
        }

        const canvas = drawToCanvas(img, outputWidth, outputHeight);
        const outMime = selectedFile.type || 'image/png';

        let blob;
        if (outMime === 'image/bmp') {
          blob = encodeBMPFromCanvas(canvas);
        } else if (outMime === 'image/avif') {
          blob = await encodeWithCanvas(canvas, 'image/avif', 0.9);
          if (!blob || !(await verifyAvifBlob(blob))) {
            throw new Error('AVIF encoding not supported (or invalid AVIF produced).');
          }
        } else {
          blob = await encodeWithCanvas(canvas, outMime, 0.92);
          if (!blob) throw new Error('Resize encoding failed or format not supported.');
        }

        setPreviewAndDownload(blob, 'resized-image');
        addLog(`Resized to ${outputWidth}x${outputHeight} as ${outMime}`);

      } catch (err) {
        console.error(err);
        log(`Error: ${err.message}`);
        alert(err.message);
      }
    });
  }

  // ---- Safety: if any element was missing, log a note (helps debugging) ----
  [
    ['fileInput', fileInput],
    ['encodeButton', encodeBtn],
    ['displayButton', displayBtn],
    ['imageButton', imageBtn],
    ['convertButton', convertBtn],
    ['formatSelect', formatSelect],
    ['qualityRange', qualityInput],
    ['compressButton', compressBtn],
    ['resizeButton', resizeBtn],
    ['downloadLink', downloadLink],
    ['log', logEl],
    ['heh', hehTextarea],
    ['obe', obeDiv]
  ].forEach(([id, el]) => { if (!el) console.warn(`[image-tools] Missing #${id}`); });

});
