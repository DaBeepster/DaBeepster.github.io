// Function to create MD5 hash using CryptoJS
function otherMD5(str) {
  return CryptoJS.MD5(str).toString();
}

// Brute-force search method in worker
self.onmessage = function (e) {
  const { workerId, md5Hash, charset, charsetLength, maxLength, totalCombinations, concurrency } = e.data;
  let candidateCount = 0;
  let matchFound = false;

  // Convert the linear index to indices
  function linearToIndices(linear) {
    let indices = [];
    for (let i = 0; i < maxLength; i++) {
      indices.push(linear % charsetLength);
      linear = Math.floor(linear / charsetLength);
    }
    return indices.reverse();
  }

  // Generate candidate string from indices
  function getNextCandidate(indices) {
    return indices.map(i => charset[i]).join('');
  }

  // Process worker's chunk of search space
  const start = workerId;
  const step = concurrency;

  for (let linear = start; linear < totalCombinations; linear += step) {
    if (matchFound) break;

    const indices = linearToIndices(linear);
    const candidate = getNextCandidate(indices);
    const hash = otherMD5(candidate);

    candidateCount++;

    // Post progress to the main thread every 1000 candidates
    if (candidateCount % 1000 === 0) {
      self.postMessage({ message: 'progress', workerId, candidateCountUpdate: 1000 });
    }

    // If a match is found, notify the main thread
    if (hash === md5Hash) {
      self.postMessage({ message: 'match', candidate, workerId, candidateCountUpdate: candidateCount });
      matchFound = true;
      break;
    }
  }

  // Notify the main thread that this worker is done
  if (!matchFound) {
    self.postMessage({ message: 'done', workerId, candidateCountUpdate: candidateCount });
  }
};
