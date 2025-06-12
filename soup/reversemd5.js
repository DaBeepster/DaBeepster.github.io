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

// Function to reverse MD5 by brute-forcing all combinations in batches with detailed candidate logging
async function reverseMd5BruteForce(md5Hash, charset, maxLength, batchSize = 1000) {
  const charsetArray = Array.from(charset);
  const charsetLength = charsetArray.length;
  const totalCombinations = Math.pow(charsetLength, maxLength); // Total search space
  let candidateCount = 0; // Track total number of candidates tried
  let batchCount = 0; // Track total number of batches processed

  // Load the existing rainbow table from localStorage
  const rainbowTable = readRainbowTable();

  // Check if the hash already exists in the rainbow table
  if (rainbowTable[md5Hash]) {
    logToPage(`Found in rainbow table: ${rainbowTable[md5Hash]}`);
    return rainbowTable[md5Hash]; // Return the matching string from the table
  }

  // Function to update the debugging info on the web page
  function logToPage(message) {
    const logElement = document.getElementById('log');
    if (logElement) {
      logElement.value += message + "\n";
    } else {
      console.log(message); // Fallback to console if there's no HTML log element
    }
  }

  // Helper function to increment indices and generate the next candidate string
  function getNextCandidate(indices) {
    return indices.map(i => charsetArray[i]).join('');
  }

  // Brute-force search method: process candidates in batches
  async function bruteForceSearch() {
    const indices = Array(maxLength).fill(0); // Initialize indices to start at the first character
    let batch = [];

    while (candidateCount < totalCombinations) {
      // Generate a batch of candidates
      batch = [];
      const batchStartCandidateCount = candidateCount;

      for (let i = 0; i < batchSize && candidateCount < totalCombinations; i++) {
        const candidate = getNextCandidate(indices);
        batch.push(candidate);

        // Increment indices to the next candidate
        let incremented = false;
        for (let j = maxLength - 1; j >= 0; j--) {
          indices[j]++;
          if (indices[j] < charsetLength) {
            incremented = true;
            break;
          }
          indices[j] = 0; // Reset this index and carry over to the next one
        }
        if (!incremented) {
          break; // No more combinations left
        }
      }

      // Log the batch progress and show the first 5 and last 5 candidates
      batchCount++;
      const firstFive = batch.slice(0, 5).join(', ');
      const lastFive = batch.slice(-5).join(', ');
      logToPage(`Batch ${batchCount}: Processing ${batch.length} candidates`);
      logToPage(`  First 5 candidates: ${firstFive}`);
      logToPage(`  Last 5 candidates: ${lastFive}`);

      // Process the batch: compute hashes and check for matches
      for (let candidate of batch) {
        const hash = otherMD5(candidate);
        candidateCount++;

        // Check if the hash matches the target MD5 hash
        if (hash === md5Hash) {
          logToPage(`Match found: ${candidate} after ${candidateCount} total attempts in batch ${batchCount}.`);

          // Save the match to the rainbow table and write it to localStorage
          rainbowTable[md5Hash] = candidate;
          writeRainbowTable(rainbowTable);

          return candidate; // Return the matching string
        }
      }
    }

    logToPage(`No match found after ${candidateCount} total attempts.`);
    return "No Match"; // No match found after trying all combinations
  }

  // Start brute-force search
  return bruteForceSearch();
}

// Example usage of reverse MD5 with batch brute-force search, rainbow table, and detailed candidate logging
async function undoMd5() {
  const hash = document.getElementById('heh').value; // MD5 hash input
  const charset = prompt("Original Charset", "abcdefghijklmnopqrstuvwxyz .,"); // Charset used for brute-force
  const maxLength = parseInt(prompt("Original string length", "35")); // Length of the string
  const batchSize = parseInt(prompt("Batch size", "1000")); // Number of candidates per batch
  
  if (!hash || !charset || !maxLength || !batchSize) {
    document.getElementById('heh').value = "Invalid input";
    return;
  }

  // Clear the logs before starting a new search
  document.getElementById('log').value = "";

  // Start reverse process with brute-force search in batches
  const startTime = performance.now();
  const result = await reverseMd5BruteForce(hash, charset, maxLength, batchSize);
  const endTime = performance.now();

  // Correct handling for "No Match" result
  if (result === "No Match") {
    document.getElementById('heh').value = "No Match";
  } else {
    document.getElementById('heh').value = `Found: ${result} (in ${(endTime - startTime) / 1000} seconds)`;
    logToPage(`Found: ${result} (in ${(endTime - startTime) / 1000} seconds)`);
  }
}
