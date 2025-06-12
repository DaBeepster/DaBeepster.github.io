function txt() {
  var place = document.getElementById("heh");
  var tex = place.value;
  document.getElementById("obe").innerText = tex;
}
function hml() {
  var place = document.getElementById("heh");
  var hm = place.value;
  document.getElementById("obe").innerHTML = hm;
}
function base() {
  var place = document.getElementById("heh");
  var lol = place.value;
  var ah = btoa(unescape(encodeURIComponent(lol)));
  place.value = ah;
}
function notbase() {
  var place = document.getElementById("heh");
  var ok = place.value;
  var ko = atob(ok);
  place.value = ko;
}
function enur() {
  var place = document.getElementById("heh");
  var txt = place.value;
  var nice = encodeURIComponent(txt);
  place.value = nice;
}
function deur() {
  var place = document.getElementById("heh");
  var txt = place.value;
  var nice = decodeURIComponent(txt);
  place.value = nice;
}
function save1() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.piss;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.piss = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function load1() {
  var area = document.getElementById("heh");
  var yea = localStorage.piss;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function save2() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.sav2;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.sav2 = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function load2() {
  var area = document.getElementById("heh");
  var yea = localStorage.sav2;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function toRoman(num) {
  const romanNumerals = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let result = "";

  for (let key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      result += key;
      num -= romanNumerals[key];
    }
  }

  return result;
}

function toNumber(roman) {
  const romanNumerals = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let result = 0;

  for (let i = 0; i < roman.length; i++) {
    let current = romanNumerals[roman[i]];
    let next = romanNumerals[roman[i + 1]];

    if (next && current < next) {
      result += next - current;
      i++;
    } else {
      result += current;
    }
  }

  return result;
}
function numToRoman() {
  var num = document.getElementById("heh").value;
  var ronum = toRoman(num);
  document.getElementById("heh").value = ronum;
}
function romanToNum() {
  var rome = document.getElementById("heh").value;
  var numb = toNumber(rome);
  document.getElementById("heh").value = numb;
}
function saveThree() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.thirdSave;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.thirdSave = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function loadThree() {
  var area = document.getElementById("heh");
  var yea = localStorage.thirdSave;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function saveFour() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.fourthSave;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.fourthSave = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function loadFour() {
  var area = document.getElementById("heh");
  var yea = localStorage.fourthSave;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function saveFive() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.fiveSave;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.fiveSave = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function loadFive() {
  var area = document.getElementById("heh");
  var yea = localStorage.fiveSave;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function saveSix() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.sexthSave;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.sexthSave = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function loadSix() {
  var area = document.getElementById("heh");
  var yea = localStorage.sexthSave;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function saveSeven() {
  var area = document.getElementById("heh");
  var conten = area.value;
  var sav = localStorage.sevenSave;
  var confirm = prompt(
    `This slot currently contains ${sav}. Are you sure you want to overwrite?`,
    "Y/N"
  );
  if (confirm.toUpperCase() == "Y") {
    localStorage.sevenSave = conten;
    alert("Saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("Save Cancelled");
  } else {
    console.log("Ag");
  }
}
function loadSeven() {
  var area = document.getElementById("heh");
  var yea = localStorage.sevenSave;
  var confirm = prompt(`Currently saved: ${yea}. Load save?`, "Y/N");
  if (confirm.toUpperCase() == "Y") {
    area.value = yea;
  } else if (confirm.toUpperCase() == "N") {
    console.log("ok");
  } else {
    console.log("hm");
  }
}
function saveTemp() {
  var gyatt = document.getElementById("heh");
  var skibidi = gyatt.value;
  localStorage.tempSave = skibidi;
}
function loadTemp() {
  var ohio = document.getElementById("heh");
  var sigma = localStorage.tempSave;
  ohio.value = sigma;
}
function saveImp() {
  var box = document.getElementById("heh");
  var content = box.value;
  var confirm = prompt("Are you sure you want to overwrite this save? Y/N");
  if (confirm.toUpperCase() == "Y") {
    localStorage.importantSave = content;
    alert("saved!");
  } else if (confirm.toUpperCase() == "N") {
    alert("save cancelled");
  } else {
    console.log("suss");
  }
}
function loadImp() {
  var box = document.getElementById("heh");
  var savedcontent = localStorage.importantSave;
  box.value = savedcontent;
}
function linkTemplate() {
  var thing = atob("PGEgaHJlZj0iIiB0YXJnZXQ9Il9ibGFuayI+TGluazwvYT4=");
  document.getElementById("heh").value = thing;
}
function iframeTemplate() {
  var thingy = atob(
    "PGlmcmFtZSBzcmM9IiIgd2lkdGg9IjY5MHB4IiBoZWlnaHQ9IjY5MHB4Ij48L2lmcmFtZT4="
  );
  document.getElementById("heh").value = thingy;
}
function imageTemplate() {
  var imag = atob("PGltZyBzcmM9IiIgYWx0PSJ3aG9vcHMiIHdpZHRoPSI0ODBweCIvPg==");
  document.getElementById("heh").value = imag;
}
function encodeAllHtmlEntities(str) {
  return str
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      return `&#${code};`;
    })
    .join("");
}
function encodeHtml() {
  var thetext = document.getElementById("heh").value;
  var encodedText = encodeAllHtmlEntities(thetext);
  document.getElementById("heh").value = encodedText;
}
function decodeHtml() {
  var thetext = document.getElementById("heh").value;
  var area = document.getElementById("sus");
  document.getElementById("sus").innerHTML = thetext;
  document.getElementById("heh").value = area.innerText;
  document.getElementById("sus").innerText = "";
}
function setTitle() {
  var t = document.getElementById("heh").value;
  if (t == "") {
    document.title = "My Silly Stuff";
  } else {
    document.title = t;
  }
}

function splitTest() {
  var text = document.getElementById("heh").value;
  var chars = prompt("how many characters", "82");
  if (!chars) {
    return;
  }
  var amount = Number(chars);
  var len = text.length;
  let splitted = "";
  for (let i = 0; i < len; i += amount) {
    splitted += text.slice(i, i + amount) + "\n";
  }
  document.getElementById("heh").value = splitted;
}
function charCount() {
  var text = document.getElementById("heh").value;
  var len = text.length.toString();
  alert("The count is " + len);
}
function getUniqueCharacters(str) {
  if (str.length === 0) return ""; // Handle empty string

  // Create a Map to store character frequencies
  let charFreq = new Map();

  // Count the frequency of each character in the string
  for (let char of str) {
    if (charFreq.has(char)) {
      charFreq.set(char, charFreq.get(char) + 1);
    } else {
      charFreq.set(char, 1);
    }
  }

  // Get the first and last characters of the string
  const firstChar = str[0];
  const lastChar = str[str.length - 1];

  // Remove first and last characters from the frequency map to prioritize them manually
  charFreq.delete(firstChar);
  charFreq.delete(lastChar);

  // Sort remaining characters by frequency
  let sortedChars = [...charFreq.keys()].sort(
    (a, b) => charFreq.get(b) - charFreq.get(a)
  );

  // If the first and last characters are the same, only add it once at the beginning
  if (firstChar === lastChar) {
    return firstChar + sortedChars.join("");
  } else {
    // Return first character, then last character, followed by the sorted remaining characters
    return firstChar + lastChar + sortedChars.join("");
  }
}

// Function to update the input field with sorted unique characters
function spawnUniqueChars() {
  let uniqueChars = getUniqueCharacters(document.getElementById("heh").value);
  document.getElementById("heh").value = uniqueChars;
}

function textCompare() {
  let text1 = prompt("First string");
  let text2 = prompt("Second string");
  if (text1.toString() === text2.toString()) {
    document.getElementById("heh").value = "Text matches!";
  } else {
    document.getElementById("heh").value = "Does not match";
  }
}
function MD5(str) {
  localStorage.befstring = document.getElementById("heh").value;
  var hash = CryptoJS.MD5(str).toString();
  document.getElementById("heh").value = hash;
  return hash;
}
function getCharactersWithNumbers(str) {
  // Create an object to store the character counts
  const charCount = {};

  // Loop through each character in the string and count occurrences
  for (let char of str) {
    if (charCount[char]) {
      charCount[char]++;
    } else {
      charCount[char] = 1;
    }
  }

  // Convert the charCount object into an array of [character, count] pairs
  const charCountArray = Object.entries(charCount);

  // Sort the array based on the count in descending order
  charCountArray.sort((a, b) => b[1] - a[1]);

  // Map the sorted array to a string format "character: count"
  const sortedCounts = charCountArray.map(
    ([char, count]) => `[${char}, ${count}]`
  );

  // Join the array into a single string separated by commas
  return sortedCounts.join(", ");
}

function getCharsWithCount() {
  let chars = getCharactersWithNumbers(document.getElementById("heh").value);
  document.getElementById("heh").value = chars;
}
function getUniqueCharactersForHash(str) {
  // Create a Map to store character counts
  let charMap = new Map();

  // List of likely MD5 hex characters
  const hexChars = "0123456789abcdef";

  // Loop through the string and count each character
  for (let char of str) {
    charMap.set(char, (charMap.get(char) || 0) + 1);
  }

  // Convert the Map to an array of [character, count] pairs
  let sortedChars = [...charMap.entries()].sort((a, b) => {
    // Check if both characters are hex characters
    const aIsHex = hexChars.includes(a[0]);
    const bIsHex = hexChars.includes(b[0]);

    // Prioritize hex characters first
    if (aIsHex && !bIsHex) return -1;
    if (!aIsHex && bIsHex) return 1;

    // Sort by frequency if both are hex or both are not hex
    return b[1] - a[1];
  });

  // Return the characters in order of priority and frequency as a string
  return sortedChars.map((entry) => entry[0]).join("");
}

function spawnUniqueCharsForHash() {
  let chares = getUniqueCharactersForHash(document.getElementById("heh").value);
  document.getElementById("heh").value = chares;
}
function byelog() {
  document.getElementById("log").value = "";
}
function convertToHex() {
  // Get the string from the textarea
  let inputString = document.getElementById("heh").value;

  // Ask user for the separator character
  let separator = prompt(
    "Enter the separator character (leave empty for no separator):",
    ""
  );

  // Convert the string into hexadecimal
  let hexString = "";
  for (let i = 0; i < inputString.length; i++) {
    // Convert each character to its hexadecimal representation
    let hex = inputString.charCodeAt(i).toString(16).padStart(2, "0");

    // Append the hex value and the separator (if applicable)
    hexString += hex + (i < inputString.length - 1 ? separator : "");
  }

  // Output the result back into the textarea
  document.getElementById("heh").value = hexString;
}
