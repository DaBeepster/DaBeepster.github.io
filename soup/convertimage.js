document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Store the selected file when the user chooses an image
    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        selectedFile = file;
    });

    // Convert the image to the selected format when the button is clicked
    document.getElementById('convertButton').addEventListener('click', function() {
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

                    // Convert the canvas content to the selected image format
                    const convertedDataUrl = canvas.toDataURL(outputFormat);

                    // Display the converted image inside the 'obe' div
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${convertedDataUrl}" alt="Converted Image" style="max-width: 100%;">`;
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = convertedDataUrl;
                    downloadLink.download = `converted-image.${outputFormat.split('/')[1]}`;
                    downloadLink.style.display = 'inline';
                };
            };

            reader.readAsDataURL(selectedFile);
        } else {
            alert('No image file selected.');
        }
    });
});
