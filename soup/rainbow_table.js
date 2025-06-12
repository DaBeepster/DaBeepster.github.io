// Function to create MD5 hash using CryptoJS (for consistency)
function otherMD5(str) {
  return CryptoJS.MD5(str).toString();
}

// Function to read the rainbow table from localStorage
function readRainbowTable() {
  try {
    const data = localStorage.getItem("rainbow_table");
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error reading the rainbow table from localStorage:", error);
    return {};
  }
}

// Function to write the rainbow table to localStorage
function writeRainbowTable(rainbowTable) {
  try {
    localStorage.setItem("rainbow_table", JSON.stringify(rainbowTable));
    console.log(`Successfully wrote to rainbow table in localStorage`);
  } catch (error) {
    console.error("Error writing to the rainbow table in localStorage:", error);
  }
}

// Function to manually add a hash-string pair to the rainbow table
function addToRainbowTable(md5Hash, plainText) {
  const rainbowTable = readRainbowTable();
  
  // Check if the hash already exists in the table
  if (rainbowTable[md5Hash]) {
    console.log(`The hash ${md5Hash} already exists in the rainbow table with value: ${rainbowTable[md5Hash]}`);
    return;
  }
  
  // Add the new hash-string pair
  rainbowTable[md5Hash] = plainText;
  writeRainbowTable(rainbowTable);
  console.log(`Added to rainbow table: ${md5Hash} -> ${plainText}`);
}

// Function to manually remove a hash-string pair from the rainbow table
function removeFromRainbowTable(md5Hash) {
  const rainbowTable = readRainbowTable();

  // Check if the hash exists in the table
  if (rainbowTable[md5Hash]) {
    delete rainbowTable[md5Hash]; // Remove the hash from the table
    writeRainbowTable(rainbowTable);
    console.log(`Removed from rainbow table: ${md5Hash}`);
  } else {
    console.log(`The hash ${md5Hash} was not found in the rainbow table.`);
  }
}

// Function to clear the entire rainbow table
function clearRainbowTable() {
  try {
    localStorage.removeItem("rainbow_table"); // Remove the entire rainbow table from localStorage
    console.log("Rainbow table cleared.");
  } catch (error) {
    console.error("Error clearing the rainbow table:", error);
  }
}

// Example usage: Prompt the user for a hash and string to add
function addHashManually() {
  var which = parseInt(prompt("Where to get plaintext from? 1: The textarea, 2: Prompt"));
  if (!which) {
    return "zamn";
  } else if (which === 1) {
    var plainText = document.getElementById('heh').value;
    if (!plainText) {
      alert("Invalid input");
      return "bruh";
    }
  } else if (which === 2) {
    var plainText = prompt("Enter the plaintext string you want to add:");
    if (!plainText) {
      alert("Invalid input");
      return "bruh";
    }
  } else {
    return "sigma";
  }
  const md5Hash = prompt("Enter the corresponding MD5 hash (or leave empty to generate it):");

  // If the user does not provide an MD5 hash, generate it from the plainText
  const hashToUse = md5Hash ? md5Hash : otherMD5(plainText);

  addToRainbowTable(hashToUse, plainText);
}

// Example usage: Prompt the user for a hash to remove
function removeHashManually() {
  const md5Hash = prompt("Enter the MD5 hash you want to remove:");
  if (md5Hash) {
    removeFromRainbowTable(md5Hash);
  } else {
    console.log("Invalid input. No hash was provided.");
  }
}

// Example usage: Prompt the user to clear the rainbow table
function clearTable() {
  const confirmation = confirm("Are you sure you want to clear the entire rainbow table? This action cannot be undone.");
  if (confirmation) {
    clearRainbowTable();
  }
}
// Function to display the contents of the rainbow table in the log textarea
function displayRainbowTable() {
  const rainbowTable = readRainbowTable();
  const logElement = document.getElementById('log');

  if (logElement) {
    if (Object.keys(rainbowTable).length === 0) {
      logElement.value = "";
      logElement.value += "Rainbow table is empty.\n";
    } else {
      logElement.value = "";
      logElement.value += "Current Rainbow Table:\n";
      for (const [hash, plaintext] of Object.entries(rainbowTable)) {
        logElement.value += `${hash} -> ${plaintext}\n`;
      }
    }
  } else {
    console.log("Log element not found.");
  }
}