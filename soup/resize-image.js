document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Promisified helper for toBlob
    function canvasToBlob(canvas, type, quality = 0.92) {
        return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    }

    document.getElementById('fileInput').addEventListener('change', function(event) {
        selectedFile = event.target.files[0] || null;
    });

    document.getElementById('resizeButton').addEventListener('click', async function() {
        if (!selectedFile) {
            alert('No image file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function(e) {
            const img = new Image();
            img.onload = async function() {
                // Ask user for new dimensions
                let outputWidth = parseInt(prompt(`Width? (Leave blank to auto-calculate) (${img.width})`), 10);
                let outputHeight = parseInt(prompt(`Height? (Leave blank to auto-calculate) (${img.height})`), 10);
                const aspectRatio = img.width / img.height;

                // Preserve aspect ratio if one dimension is blank
                if (!outputWidth && outputHeight) {
                    outputWidth = Math.round(outputHeight * aspectRatio);
                } else if (outputWidth && !outputHeight) {
                    outputHeight = Math.round(outputWidth / aspectRatio);
                } else if (!outputWidth && !outputHeight) {
                    outputWidth = img.width;
                    outputHeight = img.height;
                }

                console.log(`Adjusted Dimensions: ${outputWidth}x${outputHeight}`);

                // Resize image on canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = outputWidth;
                canvas.height = outputHeight;
                ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

                // Use the same MIME type as the input file
                const mimeType = selectedFile.type || 'image/png';

                try {
                    const blob = await canvasToBlob(canvas, mimeType);
                    if (!blob) {
                        alert('Resizing failed — unsupported format or browser limitation.');
                        return;
                    }

                    const objectUrl = URL.createObjectURL(blob);

                    // Show resized image preview
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${objectUrl}" alt="Resized Image" width="${outputWidth}" height="${outputHeight}" style="max-width:100%;">`;

                    // Enable download link
                    const ext = mimeType.split('/')[1] || 'png';
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = objectUrl;
                    downloadLink.download = `resized-image.${ext}`;
                    downloadLink.style.display = 'inline';

                } catch (error) {
                    console.error('Resize error:', error);
                    alert('Error during resizing: ' + error.message);
                }
            };
            img.onerror = () => alert('Failed to load image.');
            img.src = e.target.result;
        };

        reader.readAsDataURL(selectedFile);
    });
});
