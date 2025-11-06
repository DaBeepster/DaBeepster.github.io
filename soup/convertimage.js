document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Store the selected file when the user chooses an image
    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        selectedFile = file;
    });

    // Convert the image to the selected format when the button is clicked
    document.getElementById('convertButton').addEventListener('click', function() {
        document.getElementById('log').value = "";
        if (selectedFile) {
            const reader = new FileReader();
            const outputFormat = document.getElementById('formatSelect').value; // Get selected output format

            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function() {
                    // Create a canvas and draw the image on it
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = img.width;
                    canvas.height = img.height;

                    ctx.drawImage(img, 0, 0);

                    // Determine MIME type for supported formats
                    let mimeType = '';
                    switch (outputFormat) {
                        case 'png':
                            mimeType = 'image/png';
                            break;
                        case 'jpeg':
                        case 'jpg':
                            mimeType = 'image/jpeg';
                            break;
                        case 'webp':
                            mimeType = 'image/webp';
                            break;
                        case 'bmp':
                            mimeType = 'image/bmp';
                            break;
                        case 'avif':
                            mimeType = 'image/avif';
                            break;
                        default:
                            mimeType = 'image/png';
                    }

                    // Try to convert canvas to the selected format
                    let convertedDataUrl;
                    try {
                        convertedDataUrl = canvas.toDataURL(mimeType);
                    } catch (error) {
                        console.error('Conversion failed:', error);
                        document.getElementById('log').value = "Conversion failed. Your browser may not support this format.";
                        return;
                    }

                    // Display the converted image
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${convertedDataUrl}" alt="Converted Image" style="max-width: 100%;">`;

                    // Update log and download link
                    document.getElementById('log').value = "Image Converted";
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = convertedDataUrl;
                    downloadLink.download = `converted-image.${outputFormat}`;
                    downloadLink.style.display = 'inline';
                };
            };

            reader.readAsDataURL(selectedFile);
        } else {
            alert('No image file selected.');
        }
    });
});
