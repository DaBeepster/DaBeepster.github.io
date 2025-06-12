function caesarEncode() {
  // Get the input string and the shift amount
  let inputString = document.getElementById("heh").value;
  let shiftAmount = parseInt(prompt("Shift amount"));
  if (!shiftAmount) {
    return "noooo";
  }

  // Get the unique characters in the string to create the charset
  let charset = [...new Set(inputString)].join("");

  // Function to perform the Caesar Cipher encoding
  function caesarCipher(str, shift, charset) {
    let result = "";
    let charsetLength = charset.length;

    // Loop through each character in the input string
    for (let i = 0; i < str.length; i++) {
      let char = str[i];
      let index = charset.indexOf(char);

      // If the character is in the charset, shift it
      if (index !== -1) {
        let newIndex = (index + shift) % charsetLength;
        if (newIndex < 0) newIndex += charsetLength; // Handle negative shifts
        result += charset[newIndex];
      } else {
        // If the character is not in the charset, keep it as is
        result += char;
      }
    }

    return result;
  }

  // Encode the string with the shift
  let encodedString = caesarCipher(inputString, shiftAmount, charset);

  // Display the result
  document.getElementById("heh").value = encodedString;
}
