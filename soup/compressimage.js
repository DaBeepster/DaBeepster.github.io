document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Get slider element
    const qualityRange = document.getElementById('qualityRange');

    // Helper: promisified toBlob
    function canvasToBlob(canvas, type, quality) {
        return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    }

    // Store selected file
    document.getElementById('fileInput').addEventListener('change', function(event) {
        selectedFile = event.target.files[0] || null;
    });

    // Compress the image when "Compress Image" is clicked
    document.getElementById('compressButton').addEventListener('click', async function() {
        document.getElementById('log').value = "";
        if (!selectedFile) {
            alert('No image file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = async function() {
                // Draw image to canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // Determine output format
                let outputFormat;
                const quality = parseFloat(qualityRange.value);
                if (selectedFile.type === 'image/jpeg' || quality <= 0.1) {
                    outputFormat = 'image/jpeg';
                } else {
                    outputFormat = 'image/webp';
                }

                try {
                    // Convert to blob
                    const blob = await canvasToBlob(canvas, outputFormat, quality);
                    if (!blob) {
                        document.getElementById('log').value = 'Compression failed (format not supported).';
                        return;
                    }

                    const objectUrl = URL.createObjectURL(blob);

                    // Display compressed image
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${objectUrl}" alt="Compressed Image" style="max-width: 100%;">`;

                    // Update log
                    document.getElementById('log').value = `Image compressed (${outputFormat}, quality: ${quality})`;

                    // Create download link
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = objectUrl;
                    downloadLink.download = `compressed-image.${outputFormat.split('/')[1]}`;
                    downloadLink.style.display = 'inline';
                } catch (error) {
                    console.error('Compression error:', error);
                    document.getElementById('log').value = 'Error during compression: ' + error.message;
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
    });
});
