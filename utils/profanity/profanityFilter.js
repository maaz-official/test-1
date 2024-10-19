// src/utils/profanity/profanityFilter.js
const wordList = require('./wordList');

// Trie Node Class
class TrieNode {
  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

// Trie Class with Optimizations
class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // Insert word into Trie with normalization
  insert(word) {
    let node = this.root;
    for (let char of word) {
      char = this.normalizeChar(char);
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEndOfWord = true;
  }

  // Normalize characters (e.g., accents removal and case conversion)
  normalizeChar(char) {
    return char.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  // Search word in Trie with normalization
  search(word) {
    let node = this.root;
    for (let char of word) {
      char = this.normalizeChar(char);
      if (!node.children[char]) {
        return false;
      }
      node = node.children[char];
    }
    return node.isEndOfWord;
  }
}

// Initialize Trie and Insert Words from Custom List
const trie = new Trie();
wordList.forEach(word => trie.insert(word));

/**
 * Profanity Handler
 * @param {string} text - The text to check for profanity.
 * @param {boolean} [censor=false] - Whether to censor profane words.
 * @returns {Object} - Returns an object with `containsProfanity` and `processedText`.
 */
const handleProfanity = (text, censor = false) => {
  const words = text.match(/\w+('\w+)?/g) || []; 
  let containsProfanity = false;

  const processedText = words.map(word => {
    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    if (trie.search(cleanWord)) {
      containsProfanity = true;
      return censor ? '*'.repeat(word.length) : word; 
    }
    return word; 
  }).join(' ');

  return { containsProfanity, processedText };
};

module.exports = handleProfanity;
