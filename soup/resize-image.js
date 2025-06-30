document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    document.getElementById('fileInput').addEventListener('change', function(event) {
        const file = event.target.files[0];
        selectedFile = file;
    });

    document.getElementById('resizeButton').addEventListener('click', function() {
        if (selectedFile) {
            const reader = new FileReader();


            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;

                img.onload = function() {
                    // Prompt user for dimensions
                    let outputWidth = parseInt(prompt(`Width? (Leave blank to auto-calculate) (${img.width})`), 10);
                    let outputHeight = parseInt(prompt(`Height? (Leave blank to auto-calculate) (${img.height})`), 10);
                    // Step 3: Adjust dimensions based on aspect ratio if needed
                    const aspectRatio = img.width / img.height;

                    if (!outputWidth && outputHeight) {
                        outputWidth = Math.round(outputHeight * aspectRatio);
                    } else if (outputWidth && !outputHeight) {
                        outputHeight = Math.round(outputWidth / aspectRatio);
                    } else if (!outputWidth && !outputHeight) {
                        // Default to original image dimensions if none are provided
                        outputWidth = img.width;
                        outputHeight = img.height;
                    }

                    // Log adjusted dimensions for debugging
                    console.log(`Adjusted Dimensions: ${outputWidth}x${outputHeight}`);

                    // Create a canvas and draw the image resized
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = outputWidth;
                    canvas.height = outputHeight;

                    ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

                    // Convert the canvas content to the selected image format
                    const resizedImageUrl = canvas.toDataURL(selectedFile.type);

                    // Display the converted image inside the 'obe' div
                    const obeDiv = document.getElementById('obe');
                    obeDiv.innerHTML = `<img src="${resizedImageUrl}" alt="Converted Image" width="${outputWidth}px" height="${outputHeight}px">`;

                    // Set up the download link
                    const downloadLink = document.getElementById('downloadLink');
                    downloadLink.href = resizedImageUrl;
                    downloadLink.download = `resized-image.${selectedFile.type.split('/')[1]}`;
                    downloadLink.style.display = 'inline';
                };
            };

            reader.readAsDataURL(selectedFile);
        } else {
            alert('No image file selected.');
        }
    });
});
