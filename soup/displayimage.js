document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Helper to promisify toBlob
    function canvasToBlob(canvas, type, quality = 0.92) {
        return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    }

    document.getElementById('fileInput').addEventListener('change', function(event) {
        selectedFile = event.target.files[0] || null;
    });

    document.getElementById('imageButton').addEventListener('click', async function() {
        if (!selectedFile) {
            alert('No image file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            const img = new Image();
            img.onload = async function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                const quality = 0.9; // adjust compression (0–1)
                const mimeType = selectedFile.type || 'image/jpeg';

                try {
                    const blob = await canvasToBlob(canvas, mimeType, quality);
                    if (!blob) {
                        alert('Compression failed — your browser may not support this format.');
                        return;
                    }

                    const objectUrl = URL.createObjectURL(blob);

                    // Preview compressed image
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${objectUrl}" alt="Image" style="max-width: 100%;">`;

                    // Download link
                    const ext = mimeType.split('/')[1] || 'jpg';
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = objectUrl;
                    downloadLink.download = `compressed.${ext}`;
                    downloadLink.style.display = 'inline';
                } catch (err) {
                    console.error('Compression error:', err);
                    alert('Error during compression: ' + err.message);
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
    });
});
