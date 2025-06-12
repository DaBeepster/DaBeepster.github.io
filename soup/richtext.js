let isRichText = false; // Track the editor state

function toggleRichText() {
  const textArea = document.getElementById("heh");

  if (!isRichText) {
    // Switch to rich text mode
    const richTextDiv = document.createElement("div");
    richTextDiv.setAttribute("id", "heh");
    richTextDiv.setAttribute("contenteditable", "true");
    richTextDiv.classList.add("tex2");

    // Match the styles exactly
    richTextDiv.style.width =
      textArea.style.width || textArea.offsetWidth + "px";
    richTextDiv.style.height =
      textArea.style.height || textArea.offsetHeight + "px";
    richTextDiv.style.border = window.getComputedStyle(textArea).border;
    richTextDiv.style.padding = window.getComputedStyle(textArea).padding;
    richTextDiv.style.overflowY = "auto"; // Ensure scroll behavior matches

    // Copy the content from the textarea
    richTextDiv.innerHTML = textArea.value;

    // Replace textarea with rich text div
    textArea.replaceWith(richTextDiv);
  } else {
    // Switch back to normal textarea
    const newTextArea = document.createElement("textarea");
    newTextArea.setAttribute("id", "heh");
    newTextArea.setAttribute("placeholder", ">");
    newTextArea.classList.add("tex");

    // Match the styles exactly
    newTextArea.style.width =
      textArea.style.width || textArea.offsetWidth + "px";
    newTextArea.style.height =
      textArea.style.height || textArea.offsetHeight + "px";

    // Get content from the rich text div and convert invalid Base64 characters to HTML entities
    let richTextContent = document.getElementById("heh").innerHTML;

    // Convert to HTML entities if necessary
    newTextArea.value = convertInvalidBase64Chars(richTextContent);

    // Replace div with textarea
    document.getElementById("heh").replaceWith(newTextArea);
  }

  // Toggle state
  isRichText = !isRichText;
}

/**
 * Function to convert characters that can't be encoded in Base64 into HTML entities
 */
function convertInvalidBase64Chars(text) {
  return text.replace(/[\u007F-\uFFFF]/g, function (char) {
    return `&#${char.charCodeAt(0)};`;
  });
}
