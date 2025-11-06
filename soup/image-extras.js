// Elements
const displayImageBtn = document.getElementById('displayImageBtn');
const displayTextBtn  = document.getElementById('displayTextBtn');
const hehTextarea     = document.getElementById('heh');

// Small helper for safe HTML
function esc(s) {
  return String(s).replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

// Display IMAGE only (never touches the text area)
displayImageBtn.addEventListener('click', () => {
  logEl.value = '';
  if (!selectedFile) {
    alert('No file selected.');
    return;
  }
  const type = selectedFile.type || '';
  if (!type.startsWith('image/')) {
    alert(`The selected file is not an image (${type || 'unknown type'}).`);
    return;
  }
  const url = URL.createObjectURL(selectedFile);
  obeDiv.innerHTML = `<img src="${url}" alt="Selected Image" style="max-width:100%;height:auto;">`;
  logEl.value = `Displayed image: ${selectedFile.name}`;
  // Do not modify #heh here
});

// Display TEXT only (puts text into #heh, not the image preview)
displayTextBtn.addEventListener('click', () => {
  logEl.value = '';
  if (!selectedFile) {
    alert('No file selected.');
    return;
  }

  const type = selectedFile.type || '';
  // Allow text/* or JSON. If MIME is missing, still try to read as text.
  const looksTextual = type.startsWith('text/') || type === 'application/json' || type === '';

  if (!looksTextual) {
    alert(`This file type (${type || 'unknown'}) is not a text format. Use "Display Image" for images.`);
    return;
  }

  const reader = new FileReader();
  reader.onload = e => {
    const text = String(e.target.result);
    if (hehTextarea) hehTextarea.value = text;  // only update the text area
    obeDiv.innerHTML = '';                      // don't show text in the image preview region
    logEl.value = `Displayed text in #heh: ${selectedFile.name} (${text.length} chars)`;
  };
  reader.onerror = () => (logEl.value = 'Failed to read file as text.');
  reader.readAsText(selectedFile);
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
