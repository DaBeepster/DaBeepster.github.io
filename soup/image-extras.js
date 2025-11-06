// Elements we already have from your module:
const displayBtn   = document.getElementById('displayButton');
const hehTextarea  = document.getElementById('heh');
const obeDiv       = document.getElementById('obe');
const logEl        = document.getElementById('log');

function ensurePreviewCanvas() {
  // Reuse or create a canvas inside #obe
  let canvas = obeDiv.querySelector('#previewCanvas');
  if (!canvas) {
    obeDiv.innerHTML = ''; // clear previous content
    canvas = document.createElement('canvas');
    canvas.id = 'previewCanvas';
    canvas.style.maxWidth = '100%';
    canvas.style.height = 'auto';
    obeDiv.appendChild(canvas);
  }
  return canvas;
}

displayBtn.addEventListener('click', () => {
  logEl.value = '';
  if (!selectedFile) {
    alert('No file selected.');
    return;
  }

  const type = selectedFile.type || '';

  // --- IMAGES -> draw to canvas ---
  if (type.startsWith('image/')) {
    const url = URL.createObjectURL(selectedFile);
    const img = new Image();
    img.onload = () => {
      const canvas = ensurePreviewCanvas();
      const ctx = canvas.getContext('2d');

      // draw at native size (change as needed)
      const dpr = window.devicePixelRatio || 1;
      const targetW = img.naturalWidth || img.width;
      const targetH = img.naturalHeight || img.height;

      // set backing store size for crispness on HiDPI
      canvas.width = Math.round(targetW * dpr);
      canvas.height = Math.round(targetH * dpr);
      canvas.style.width = `${targetW}px`;
      canvas.style.height = `${targetH}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // clear text area when showing image
      if (hehTextarea) hehTextarea.value = '';

      URL.revokeObjectURL(url);
      logEl.value = `Displayed image on canvas: ${selectedFile.name} (${type})`;
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      logEl.value = 'Failed to load image for preview.';
    };
    img.src = url;
    return;
  }

  // --- TEXT/JSON -> show in textarea ---
  if (type.startsWith('text/') || type === 'application/json' || type === '') {
    const reader = new FileReader();
    reader.onload = e => {
      const text = String(e.target.result);
      if (hehTextarea) hehTextarea.value = text;
      obeDiv.innerHTML = ''; // no image canvas
      logEl.value = `Displayed text in textarea: ${selectedFile.name}`;
    };
    reader.onerror = () => (logEl.value = 'Failed to read text file.');
    reader.readAsText(selectedFile);
    return;
  }

  // --- OTHER TYPES -> simple fallback ---
  const url = URL.createObjectURL(selectedFile);
  obeDiv.innerHTML = `
    <div>File selected: ${selectedFile.name} (${type || 'unknown'})</div>
    <a href="${url}" download="${selectedFile.name}">Download file</a>
  `;
  logEl.value = `Previewed generic file: ${selectedFile.name}`;
});


// 2) Encode the selected file to Base64 (Data URL)
encodeBtn.addEventListener('click', () => {
  logEl.value = '';
  if (!selectedFile) {
    alert('No file selected.');
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    let dataUrl = String(e.target.result);
    let output = dataUrl;

    if (stripPrefix && stripPrefix.checked) {
      const comma = dataUrl.indexOf(',');
      output = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl; // just the base64 payload
    }

    // put it in your #heh textarea so you can copy/use it with your existing tools
    if (hehTextarea) hehTextarea.value = output;

    // small confirmation + optional preview if it's an image
    logEl.value = `Encoded ${selectedFile.name} to Base64 ${stripPrefix.checked ? '(payload only)' : '(data URL)'}.`;
    if (selectedFile.type.startsWith('image/') && !stripPrefix.checked) {
      obeDiv.innerHTML = `<img src="${dataUrl}" alt="Preview" style="max-width:100%;height:auto;">`;
    } else {
      obeDiv.innerHTML = '';
    }
  };
  reader.onerror = () => (logEl.value = 'Base64 encoding failed.');
  reader.readAsDataURL(selectedFile);
});
