document.addEventListener('DOMContentLoaded', function() {
    let selectedFile = null;

    // Store the selected file when user selects it
    document.getElementById('fileInput').addEventListener('change', function(event) {
        selectedFile = event.target.files[0];
    });

    // Encode the file to Base64 when the "Encode to Base64" button is pressed
    document.getElementById('encodeButton').addEventListener('click', function() {
        if (selectedFile) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const base64String = e.target.result.split(',')[1]; // Extract Base64 content
                const mimeType = selectedFile.type; // Get the file MIME type
                const output = `data:${mimeType};base64,${base64String}`; // Create full data URI
                
                document.getElementById('heh').value = output; // Output to textarea
            };
            
            reader.readAsDataURL(selectedFile); // Reads the file as a Base64 data URL
        } else {
            document.getElementById('heh').value = 'No file selected.';
        }
    });

    // Display file contents when the "Display File Contents" button is pressed
    document.getElementById('displayButton').addEventListener('click', function() {
        if (selectedFile) {
            const reader = new FileReader();

            reader.onload = function(e) {
                document.getElementById('heh').value = e.target.result; // Display raw contents
            };

            reader.readAsText(selectedFile); // Reads the file as plain text
        } else {
            document.getElementById('heh').value = 'No file selected.';
        }
    });
});
