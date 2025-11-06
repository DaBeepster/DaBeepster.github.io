// --- helpers already defined above: selectedFile, obeDiv, logEl, fileInput, etc. ---

// Grab extra elements
const displayBtn   = document.getElementById('displayButton');
const encodeBtn    = document.getElementById('encodeButton');
const stripPrefix  = document.getElementById('stripPrefix');
const hehTextarea  = document.getElementById('heh'); // you already have this in your page

// 1) Display the selected file
displayBtn.addEventListener('click', () => {
  logEl.value = '';
  if (!selectedFile) {
    alert('No file selected.');
    return;
  }

  const url = URL.createObjectURL(selectedFile);
  const type = selectedFile.type || '';

  // If it's an image, show it. Otherwise, show a simple viewer/fallback.
  if (type.startsWith('image/')) {
    obeDiv.innerHTML = `<img src="${url}" alt="Selected" style="max-width:100%;height:auto;">`;
  } else if (type.startsWith('text/') || type === 'application/json') {
    // quick text preview
    const reader = new FileReader();
    reader.onload = e => {
      const text = String(e.target.result).slice(0, 5000); // avoid dumping huge files
      obeDiv.innerHTML = `<pre style="max-width:100%;white-space:pre-wrap;">${text.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))}</pre>`;
    };
    reader.readAsText(selectedFile);
  } else {
    // generic fallback
    obeDiv.innerHTML = `
      <div>File selected: ${selectedFile.name} (${type || 'unknown type'})</div>
      <a href="${url}" download="${selectedFile.name}">Download file</a>
    `;
  }
  logEl.value = `Displayed: ${selectedFile.name}`;
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
