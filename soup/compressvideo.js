document.addEventListener('DOMContentLoaded', function () {
  let selectedFile = null;
  const qualityRange = document.getElementById('qualityRange');
  const compressBtn  = document.getElementById('compressButton');
  const obeDiv       = document.getElementById('obe');
  const downloadLink = document.getElementById('downloadLink');

  // --- ffmpeg.wasm bootstrapping (works with <script> include) ---
  // If you're using a bundler, import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg'
  const { createFFmpeg, fetchFile } = window.FFmpeg || {};
  if (!createFFmpeg || !fetchFile) {
    console.error('FFmpeg library not found. Include @ffmpeg/ffmpeg before this script.');
  }
  const ffmpeg = createFFmpeg({ log: true }); // set log:false to silence console

  // File selection
  document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    selectedFile = file || null;
  });

  // Helper: map [0..1] slider to CRF (H.264 typical ~18..32; lower = better quality)
  function qualityToCrf(q01) {
    // Clamp and invert so higher slider value = higher quality (lower CRF)
    const q = Math.min(1, Math.max(0, parseFloat(q01)));
    const min = 18;  // good visually
    const max = 32;  // smaller file, more loss
    return Math.round(max - q * (max - min));
  }

  // Helper: pick a sensible preset based on quality (tradeoff speed vs file size)
  function qualityToPreset(q01) {
    const q = Math.min(1, Math.max(0, parseFloat(q01)));
    if (q > 0.8) return 'slow';
    if (q > 0.55) return 'medium';
    if (q > 0.3) return 'fast';
    return 'veryfast';
  }

  // Transcode on click
  compressBtn.addEventListener('click', async function () {
    if (!selectedFile) {
      alert('No video file selected.');
      return;
    }
    if (!createFFmpeg) {
      alert('FFmpeg not loaded. Include @ffmpeg/ffmpeg before this script.');
      return;
    }

    // UI: indicate work
    compressBtn.disabled = true;
    compressBtn.textContent = 'Compressing...';

    try {
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
      }

      // Write input into ffmpeg FS
      const inputName = `input.${(selectedFile.name.split('.').pop() || 'mp4').toLowerCase()}`;
      ffmpeg.FS('writeFile', inputName, await fetchFile(selectedFile));

      const q = parseFloat(qualityRange.value || '0.7'); // 0..1 like your image slider
      const crf = qualityToCrf(q);
      const preset = qualityToPreset(q);

      // Try H.264 MP4 first
      let success = false;
      let outName = 'output.mp4';
      try {
        await ffmpeg.run(
          '-i', inputName,
          // video encode: H.264 + CRF rate control
          '-c:v', 'libx264',
          '-preset', preset,
          '-crf', String(crf),
          // audio encode: AAC @ 128 kbps (widely compatible)
          '-c:a', 'aac',
          '-b:a', '128k',
          // faststart for web playback (moov atom at the front)
          '-movflags', 'faststart',
          outName
        );
        success = true;
      } catch (e) {
        console.warn('libx264 not available, falling back to VP9 WebM...', e);
      }

      // Fallback: VP9 WebM (smaller but slower to encode)
      if (!success) {
        outName = 'output.webm';
        await ffmpeg.run(
          '-i', inputName,
          // video: VP9 (CQ via -crf & -b:v 0)
          '-c:v', 'libvpx-vp9',
          '-b:v', '0',
          '-crf', String(Math.min(50, Math.max(16, crf + 6))), // slightly higher CRF for VP9
          // audio: Opus
          '-c:a', 'libopus',
          '-b:a', '96k',
          outName
        );
        success = true;
      }

      // Read output and create a blob URL
      const data = ffmpeg.FS('readFile', outName);
      const mime = outName.endsWith('.mp4') ? 'video/mp4' : 'video/webm';
      const blob = new Blob([data.buffer], { type: mime });
      const url = URL.createObjectURL(blob);

      // Show in-page preview
      obeDiv.innerHTML = `
        <video controls style="max-width:100%;height:auto;" src="${url}"></video>
        <div style="font:12px/1.4 system-ui, sans-serif;opacity:.7;margin-top:.25rem">
          CRF ${crf} · Preset ${preset} · ${mime}
        </div>
      `;

      // Download link
      downloadLink.href = url;
      downloadLink.download = `compressed-${selectedFile.name.replace(/\.[^.]+$/, '')}${outName.endsWith('.mp4') ? '.mp4' : '.webm'}`;
      downloadLink.style.display = 'inline';

      // Optional: cleanup FS to free memory
      try { ffmpeg.FS('unlink', inputName); } catch {}
      try { ffmpeg.FS('unlink', outName); } catch {}
    } catch (err) {
      console.error(err);
      alert('Video compression failed. See console for details.');
    } finally {
      compressBtn.disabled = false;
      compressBtn.textContent = 'Compress Video';
    }
  });
});
