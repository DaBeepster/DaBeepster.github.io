document.addEventListener('DOMContentLoaded', function () {
  let selectedFile = null;

  // Utility: promisified toBlob
  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  // Manual BMP encoder (24-bit, bottom-up)
  function encodeBMPFromCanvas(canvas) {
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, w, h);

    // Row size rounded to 4 bytes: each pixel = 3 bytes (BGR)
    const rowSize = (((w * 24 + 31) / 32) | 0) * 4;
    const pixelArraySize = rowSize * h;
    const fileSize = 54 + pixelArraySize; // 14 (file hdr) + 40 (info hdr) + pixels

    const buffer = new ArrayBuffer(fileSize);
    const dv = new DataView(buffer);
    let p = 0;

    // BITMAPFILEHEADER
    dv.setUint8(p++, 0x42); // 'B'
    dv.setUint8(p++, 0x4D); // 'M'
    dv.setUint32(p, fileSize, true); p += 4;
    dv.setUint16(p, 0, true); p += 2;
    dv.setUint16(p, 0, true); p += 2;
    dv.setUint32(p, 54, true); p += 4; // pixel data offset

    // BITMAPINFOHEADER (40 bytes)
    dv.setUint32(p, 40, true); p += 4;         // header size
    dv.setInt32(p,  w, true); p += 4;          // width
    dv.setInt32(p,  h, true); p += 4;          // height (positive = bottom-up)
    dv.setUint16(p, 1, true); p += 2;          // planes
    dv.setUint16(p, 24, true); p += 2;         // bpp
    dv.setUint32(p, 0, true); p += 4;          // BI_RGB
    dv.setUint32(p, pixelArraySize, true); p += 4;
    dv.setInt32(p, 2835, true); p += 4;        // ~72 DPI
    dv.setInt32(p, 2835, true); p += 4;        // ~72 DPI
    dv.setUint32(p, 0, true); p += 4;          // clr used
    dv.setUint32(p, 0, true); p += 4;          // clr important

    // Pixel data (BGR, bottom-up), with row padding
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

  document.getElementById('fileInput').addEventListener('change', function (event) {
    selectedFile = event.target.files[0] || null;
  });

  document.getElementById('convertButton').addEventListener('click', async function () {
    const logEl = document.getElementById('log');
    logEl.value = "";
    if (!selectedFile) {
      alert('No image file selected.');
      return;
    }

    const reader = new FileReader();
    const outputChoice = document.getElementById('formatSelect').value; // e.g., "png", "jpeg", "webp", "bmp", "avif"

    reader.onload = async function (e) {
      const img = new Image();
      img.onload = async function () {
        // Draw onto canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);

        try {
          let blob = null;
          let downloadExt = outputChoice.toLowerCase();

          if (outputChoice === 'bmp') {
            // Use manual encoder (always correct BMP file, no silent PNG)
            blob = encodeBMPFromCanvas(canvas);

          } else if (outputChoice === 'avif') {
            // Try native AVIF encode via toBlob
            blob = await canvasToBlob(canvas, 'image/avif', 0.9);
            if (!blob) {
              // Not supported: tell user clearly
              logEl.value = 'AVIF encoding is not supported in this browser. Try Chrome 85+/Edge 85+/Firefox 93+ (and ensure AVIF encoding is enabled), or use a WASM/libavif-based encoder.';
              return;
            }

          } else if (outputChoice === 'jpeg' || outputChoice === 'jpg') {
            blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);

          } else if (outputChoice === 'png') {
            blob = await canvasToBlob(canvas, 'image/png');

          } else if (outputChoice === 'webp') {
            blob = await canvasToBlob(canvas, 'image/webp', 0.9);
            if (!blob) {
              logEl.value = 'WEBP encoding not supported in this browser.';
              return;
            }

          } else {
            // Fallback: PNG
            blob = await canvasToBlob(canvas, 'image/png');
            downloadExt = 'png';
          }

          if (!blob) {
            logEl.value = 'Conversion failed or unsupported format.';
            return;
          }

          // Create preview and download
          const url = URL.createObjectURL(blob);
          const obeDiv = document.getElementById('obe');
          obeDiv.innerHTML = `<img src="${url}" alt="Converted Image" style="max-width: 100%;">`;

          const downloadLink = document.getElementById('downloadLink');
          downloadLink.href = url;
          downloadLink.download = `converted-image.${downloadExt}`;
          downloadLink.style.display = 'inline';

          logEl.value = `Image Converted to ${downloadExt.toUpperCase()}`;
        } catch (err) {
          console.error(err);
          logEl.value = 'Conversion error: ' + err.message;
        }
      };
      img.onerror = () => (logEl.value = 'Failed to load the selected image.');
      img.src = e.target.result;
    };

    reader.readAsDataURL(selectedFile);
  });
});
