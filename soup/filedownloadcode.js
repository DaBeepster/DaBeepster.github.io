function generateRandomString(length, set) {
    const charset = set.toString();
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        result += charset[randomIndex];
    }
    return result;
}
function downloadContent() {

  // Define a simple MIME type mapping for common extensions
  const mimeTypes = {
    "txt": "text/plain",
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "csv": "text/csv",
    "xml": "application/xml",
    "pdf": "application/pdf",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "zip": "application/zip",
    "mp3": "audio/mpeg",
    "mp4": "video/mp4",
    // Add other extensions as needed
  };

  // Get MIME type or fallback to 'application/octet-stream' for unknown extensions
  const type = mimeTypes["txt"] || "application/octet-stream";

  const link = document.createElement("a");
  const content = document.getElementById("heh").value;
  const file = new Blob([content], { type: type });
  link.href = URL.createObjectURL(file);
  link.download = generateRandomString(10, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789").toString() + ".txt";
  link.click();
  URL.revokeObjectURL(link.href);
}