/* image-tools.js */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM =====
    const fileInput         = document.getElementById('fileInput');
    const modeSelect        = document.getElementById('modeSelect');
    const formatSelect      = document.getElementById('formatSelect');
    const qualityRange      = document.getElementById('qualityRange');
    const qualityVal        = document.getElementById('qualityVal');
    const widthInput        = document.getElementById('widthInput');
    const heightInput       = document.getElementById('heightInput');
    const resizeMimeSelect  = document.getElementById('resizeMimeSelect');
    const resizeQuality     = document.getElementById('resizeQuality');
    const resizeQualityVal  = document.getElementById('resizeQualityVal');
    const goButton          = document.getElementById('goButton');
    const logEl             = document.getElementById('log');
    const obeDiv            = document.getElementById('obe');
    const downloadLink      = document.getElementById('downloadLink');

    // Display + Base64
    const displayImageBtn   = document.getElementById('displayImageBtn');
    const displayTextBtn    = document.getElementById('displayTextBtn');
    const encodeBtn         = document.getElementById('encodeButton');
    const stripPrefix       = document.getElementById('stripPrefix');
    const hehTextarea       = document.getElementById('heh');

    let selectedFile = null;

    // ===== Utilities =====
    const hasEl = (el, id) => {
      if (!el) console.warn(`[image-tools] Missing element: #${id}`);
      return !!el;
    };

    function setLog(msg) {
      if (hasEl(logEl, 'log')) logEl.value = msg;
    }
    function addLog(msg) {
      if (!hasEl(logEl, 'log')) return;
      logEl.value = (logEl.value ? logEl.value + '\n' : '') + msg;
    }

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
      dv.setUint32(p, 40, true); p += 4;
      dv.setInt32(p,  w, true); p += 4;
      dv.setInt32(p,  h, true); p += 4;
      dv.setUint16(p, 1, true); p += 2;
      dv.setUint16(p, 24, true); p += 2;
      dv.setUint32(p, 0, true); p += 4;      // BI_RGB
      dv.setUint32(p, pixelArraySize, true); p += 4;
      dv.setInt32(p, 2835, true); p += 4;    // ~72 DPI
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

    // --- AVIF header verification ---
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

    function extFromMime(mime, fallback = 'png') {
      if (!mime) return fallback;
      const t = mime.split('/')[1] || fallback;
      return t === 'jpeg' ? 'jpg' : t;
    }

    function setPreviewAndDownload(blob, filenameBase = 'image') {
      if (!hasEl(obeDiv, 'obe') || !hasEl(downloadLink, 'downloadLink')) return;
      const url = URL.createObjectURL(blob);
      obeDiv.innerHTML = `<img src="${url}" alt="Preview" style="max-width:100%;height:auto;">`;
      downloadLink.href = url;
      downloadLink.download = `${filenameBase}.${extFromMime(blob.type, 'png')}`;
      downloadLink.style.display = 'inline';
    }

    // ===== Core ops =====
    async function doConvert(file, outMime, opts = {}) {
      const img = await loadImageFromFile(file);
      const canvas = drawToCanvas(img, opts.width, opts.height);

      if (outMime === 'image/bmp') {
        return encodeBMPFromCanvas(canvas);
      }
      if (outMime === 'image/avif') {
        const blob = await encodeWithCanvas(canvas, 'image/avif', opts.quality ?? 0.9);
        if (blob && await verifyAvifBlob(blob)) return blob;
        throw new Error('AVIF encoding not supported (or invalid AVIF produced).');
      }

      const blob = await encodeWithCanvas(canvas, outMime, opts.quality);
      if (!blob) throw new Error('Encoding failed or format not supported.');
      return blob;
    }

    async function doCompress(file, opts = {}) {
      const img = await loadImageFromFile(file);
      const canvas = drawToCanvas(img);
      const inputType = file.type || 'image/png';
      const outMime =
        opts.mime ||
        ((inputType === 'image/jpeg' || (opts.quality && opts.quality <= 0.1))
          ? 'image/jpeg'
          : 'image/webp');
      return doConvert(file, outMime, { quality: opts.quality });
    }

    async function doResize(file, opts = {}) {
      const img = await loadImageFromFile(file);
      let { width, height } = opts;
      const W = img.naturalWidth || img.width;
      const H = img.naturalHeight || img.height;
      const ar = W / H;

      if (!width && height) width = Math.round(height * ar);
      if (width && !height) height = Math.round(width / ar);
      if (!width && !height) { width = W; height = H; }

      const canvas = drawToCanvas(img, width, height);
      const outMime = opts.mime || (selectedFile?.type || 'image/png');

      if (outMime === 'image/bmp') {
        return encodeBMPFromCanvas(canvas);
      }
      if (outMime === 'image/avif') {
        const blob = await encodeWithCanvas(canvas, 'image/avif', opts.quality ?? 0.9);
        if (blob && await verifyAvifBlob(blob)) return blob;
        throw new Error('AVIF encoding not supported (or invalid AVIF produced).');
      }

      const blob = await encodeWithCanvas(canvas, outMime, opts.quality);
      if (!blob) throw new Error('Resize encoding failed or format not supported.');
      return blob;
    }

    // ===== Event wiring =====
    if (hasEl(fileInput, 'fileInput')) {
      fileInput.addEventListener('change', e => {
        selectedFile = e.target.files?.[0] || null;
        if (hasEl(obeDiv, 'obe')) obeDiv.innerHTML = '';
        if (hasEl(downloadLink, 'downloadLink')) downloadLink.style.display = 'none';
        setLog('');
      });
    }

    if (hasEl(qualityRange, 'qualityRange') && hasEl(qualityVal, 'qualityVal')) {
      qualityRange.addEventListener('input', () => {
        qualityVal.textContent = Number(qualityRange.value).toFixed(2);
      });
    }

    if (hasEl(resizeQuality, 'resizeQuality') && hasEl(resizeQualityVal, 'resizeQualityVal')) {
      resizeQuality.addEventListener('input', () => {
        resizeQualityVal.textContent = Number(resizeQuality.value).toFixed(2);
      });
    }

    if (hasEl(modeSelect, 'modeSelect')) {
      const convertControls = document.getElementById('convertControls');
      const compressControls = document.getElementById('compressControls');
      const resizeControls = document.getElementById('resizeControls');

      modeSelect.addEventListener('change', () => {
        setLog('');
        if (hasEl(obeDiv, 'obe')) obeDiv.innerHTML = '';
        if (hasEl(downloadLink, 'downloadLink')) downloadLink.style.display = 'none';
        const mode = modeSelect.value;
        if (convertControls)  convertControls.style.display  = (mode === 'convert')  ? '' : 'none';
        if (compressControls) compressControls.style.display = (mode === 'compress') ? '' : 'none';
        if (resizeControls)   resizeControls.style.display   = (mode === 'resize')   ? '' : 'none';
      });

      // Initialize visibility once
      modeSelect.dispatchEvent(new Event('change'));
    }

    if (hasEl(goButton, 'goButton')) {
      goButton.addEventListener('click', async () => {
        setLog('');
        if (!selectedFile) {
          alert('No file selected.');
          return;
        }
        try {
          const mode = hasEl(modeSelect, 'modeSelect') ? modeSelect.value : 'convert';
          let blob;

          if (mode === 'convert') {
            const outMime = hasEl(formatSelect, 'formatSelect') ? formatSelect.value : 'image/png';
            blob = await doConvert(selectedFile, outMime, { quality: 0.9 });
            addLog(`Converted to ${outMime}`);
          } else if (mode === 'compress') {
            const q = hasEl(qualityRange, 'qualityRange') ? Number(qualityRange.value) : 0.9;
            blob = await doCompress(selectedFile, { quality: q });
            addLog(`Compressed with quality=${q}`);
          } else {
            const w = hasEl(widthInput, 'widthInput') ? (Number(widthInput.value) || undefined) : undefined;
            const h = hasEl(heightInput, 'heightInput') ? (Number(heightInput.value) || undefined) : undefined;
            const outMime = hasEl(resizeMimeSelect, 'resizeMimeSelect')
              ? (resizeMimeSelect.value || (selectedFile.type || 'image/png'))
              : (selectedFile.type || 'image/png');
            const q = hasEl(resizeQuality, 'resizeQuality') ? Number(resizeQuality.value) : 0.9;
            blob = await doResize(selectedFile, { width: w, height: h, mime: outMime, quality: q });
            addLog(`Resized to ${w || 'auto'} x ${h || 'auto'} as ${outMime} (q=${q})`);
          }

          setPreviewAndDownload(blob, 'image');

        } catch (err) {
          console.error(err);
          addLog(`Error: ${err.message}`);
          alert(err.message);
        }
      });
    }

    // ===== Display Image / Display Text =====
    if (hasEl(displayImageBtn, 'displayImageBtn')) {
      displayImageBtn.addEventListener('click', () => {
        setLog('');
        if (!selectedFile) return alert('No file selected.');

        const type = selectedFile.type || '';
        if (!type.startsWith('image/')) {
          alert(`The selected file is not an image (${type || 'unknown type'}).`);
          return;
        }
        if (!hasEl(obeDiv, 'obe')) return;
        const url = URL.createObjectURL(selectedFile);
        obeDiv.innerHTML = `<img src="${url}" alt="Selected Image" style="max-width:100%;height:auto;">`;
        addLog(`Displayed image: ${selectedFile.name}`);
        // Never touch #heh here
      });
    }

    if (hasEl(displayTextBtn, 'displayTextBtn')) {
      displayTextBtn.addEventListener('click', () => {
        setLog('');
        if (!selectedFile) return alert('No file selected.');
        const type = selectedFile.type || '';
        const looksTextual = type.startsWith('text/') || type === 'application/json' || type === '';

        if (!looksTextual) {
          alert(`This file type (${type || 'unknown'}) is not a text format. Use "Display Image" for images.`);
          return;
        }
        const reader = new FileReader();
        reader.onload = e => {
          const text = String(e.target.result);
          if (hasEl(hehTextarea, 'heh')) hehTextarea.value = text;
          if (hasEl(obeDiv, 'obe')) obeDiv.innerHTML = '';
          addLog(`Displayed text in #heh: ${selectedFile.name} (${text.length} chars)`);
        };
        reader.onerror = () => setLog('Failed to read file as text.');
        reader.readAsText(selectedFile);
      });
    }

    // ===== Encode to Base64 =====
    if (hasEl(encodeBtn, 'encodeButton')) {
      encodeBtn.addEventListener('click', () => {
        setLog('');
        if (!selectedFile) return alert('No file selected.');

        const reader = new FileReader();
        reader.onload = e => {
          const dataUrl = String(e.target.result);
          let output = dataUrl;

          if (stripPrefix && stripPrefix.checked) {
            const comma = dataUrl.indexOf(',');
            output = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
          }
          if (hasEl(hehTextarea, 'heh')) hehTextarea.value = output;

          addLog(`Encoded ${selectedFile.name} to Base64 ${stripPrefix && stripPrefix.checked ? '(payload only)' : '(data URL)'} .`);

          // Optional inline preview only if full data URL AND image
          const type = selectedFile.type || '';
          if (type.startsWith('image/') && (!stripPrefix || !stripPrefix.checked) && hasEl(obeDiv, 'obe')) {
            obeDiv.innerHTML = `<img src="${dataUrl}" alt="Preview" style="max-width:100%;height:auto;">`;
          } else if (hasEl(obeDiv, 'obe')) {
            obeDiv.innerHTML = '';
          }
        };
        reader.onerror = () => setLog('Base64 encoding failed.');
        reader.readAsDataURL(selectedFile);
      });
    }
  });
})();
