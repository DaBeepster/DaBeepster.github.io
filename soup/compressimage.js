document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Update the quality value label when the range slider is changed
    const qualityRange = document.getElementById('qualityRange');
    const qualityValue = document.getElementById('qualityValue');
    
    qualityRange.addEventListener('input', function() {
        qualityValue.textContent = qualityRange.value;
    });

    // Store the selected image file when the user selects it
    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        selectedFile = file;
    });

    // Compress the image when the "Compress Image" button is clicked
    document.getElementById('compressButton').addEventListener('click', function() {
        if (selectedFile) {
            const reader = new FileReader();

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

                    // Compress the image (JPEG/WebP compression with adjustable quality)
                    if (selectedFile.type === 'image/jpeg' || qualityRange.value <= 0.1) {
                      var outputFormat = 'image/jpeg';
                    } else {
                      var outputFormat = 'image/webp';
                    }
                    const quality = parseFloat(qualityRange.value); // Get compression quality from the slider
                    const compressedDataUrl = canvas.toDataURL(outputFormat, quality);

                    // Display the compressed image inside the 'obe' div
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${compressedDataUrl}" alt="Compressed Image" style="max-width: 100%;">`;

                    // Create a download link for the compressed image
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = compressedDataUrl;
                    downloadLink.download = `compressed-image.${outputFormat.split('/')[1]}`;
                    downloadLink.style.display = 'inline';
                };
            };

            reader.readAsDataURL(selectedFile);
        } else {
            alert('No image file selected.');
        }
    });
});
