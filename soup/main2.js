function swapDivs() {
  const div1 = document.getElementById("txtButtons");
  const div2 = document.getElementById("imgButtons");

  // Toggle the hidden class
  div1.classList.toggle("hidden");
  div2.classList.toggle("hidden");
}
function openTextAsDataURI() {
  var text = document.getElementById("heh").value;

  if (text.length === 0) {
    alert("Please provide some text to convert.");
    return;
  }

  // Convert text to Base64
  var base64 = btoa(unescape(encodeURIComponent(text))); // Encoding for non-ASCII characters

  // Create a data URI with the correct MIME type for HTML
  var dataURI = `data:text/html;base64,${base64}`;

  // Create a temporary anchor element
  var tempLink = document.createElement("a");
  tempLink.href = dataURI;
  tempLink.target = "_blank";
  tempLink.click();
}
document.addEventListener('DOMContentLoaded', function() {
            const textarea = document.getElementById('heh');

            textarea.addEventListener('keydown', function(event) {
                if (event.key === 'Tab') {
                    event.preventDefault(); // Stop default tab behavior (focusing next element)

                    const start = this.selectionStart;
                    const end = this.selectionEnd;

                    const tabCharacter = '    '; // You can replace this with '    ' for spaces

                    // Insert the tab character
                    this.value = this.value.slice(0, start) + tabCharacter + this.value.slice(end);

                    // Move the cursor after the inserted tab character
                    this.selectionStart = this.selectionEnd = start + tabCharacter.length;
                }
            });
        });
document.addEventListener("DOMContentLoaded", function () {
    const scrambleButton = document.getElementById("scrambleButton");

    scrambleButton.addEventListener("click", function () {
        const text = document.getElementById('heh').value;
        document.getElementById('heh').value = scrambleText(text);
    });

    function scrambleText(text) {
        return text.split('').sort(() => Math.random() - 0.5).join('');
    }
});
