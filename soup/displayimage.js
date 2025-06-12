document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        selectedFile = file;
    });

    // Compress the image when the "Compress Image" button is clicked
    document.getElementById('imageButton').addEventListener('click', function() {
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
                    const quality = 1; // Get compression quality from the slider
                    const compressedDataUrl = canvas.toDataURL(selectedFile.type, quality);

                    // Display the compressed image inside the 'obe' div
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${compressedDataUrl}" alt="Image" style="max-width: 100%;">`;

                    // Create a download link for the compressed image
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = compressedDataUrl;
                    downloadLink.download = `image.${selectedFile.type.split('/')[1]}`;
                    downloadLink.style.display = 'inline';
                };
            };

            reader.readAsDataURL(selectedFile);
        } else {
            alert('No image file selected.');
        }
    });
});
