// Fuzzy search utility to handle typos and approximate string matching

/**
 * Calculate Levenshtein distance between two strings
 * This measures the minimum number of single-character edits needed to transform one string into another
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  // Create matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score between two strings (0-1, where 1 is identical)
 */
function calculateSimilarity(str1, str2) {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLength - distance) / maxLength;
}

/**
 * Generate common typo variations of a search term
 */
function generateTypoVariations(query) {
  const variations = new Set([query]);
  const lowerQuery = query.toLowerCase();
  
  // Character swaps (transpose adjacent characters)
  for (let i = 0; i < lowerQuery.length - 1; i++) {
    const chars = lowerQuery.split('');
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    variations.add(chars.join(''));
  }
  
  // Character insertions (add common letters)
  const commonLetters = ['a', 'e', 'i', 'o', 'u', 'r', 'n', 't', 's'];
  for (let i = 0; i <= lowerQuery.length; i++) {
    commonLetters.forEach(letter => {
      const variation = lowerQuery.slice(0, i) + letter + lowerQuery.slice(i);
      if (variation.length <= lowerQuery.length + 2) { // Don't make it too long
        variations.add(variation);
      }
    });
  }
  
  // Double letter corrections (for cases like "jurasic" -> "jurassic")
  const doubleLetterPatterns = [
    { single: 's', double: 'ss' },
    { single: 'l', double: 'll' },
    { single: 't', double: 'tt' },
    { single: 'n', double: 'nn' },
    { single: 'm', double: 'mm' },
    { single: 'p', double: 'pp' },
    { single: 'r', double: 'rr' },
    { single: 'f', double: 'ff' },
    { single: 'z', double: 'zz' }
  ];
  
  doubleLetterPatterns.forEach(({ single, double }) => {
    // Add double letters where single exists
    if (lowerQuery.includes(single) && !lowerQuery.includes(double)) {
      variations.add(lowerQuery.replace(new RegExp(single, 'g'), double));
    }
    // Remove double letters where they exist
    if (lowerQuery.includes(double)) {
      variations.add(lowerQuery.replace(new RegExp(double, 'g'), single));
    }
  });
  
  // Character substitutions (replace with similar letters)
  const similarChars = {
    'a': ['e', 'o'], 'e': ['a', 'i'], 'i': ['e', 'a'], 'o': ['a', 'u'], 'u': ['o', 'i'],
    'b': ['p', 'v'], 'p': ['b'], 'v': ['b', 'f'], 'f': ['v', 'ph'],
    'c': ['k', 's'], 'k': ['c'], 's': ['c', 'z'], 'z': ['s'],
    'm': ['n'], 'n': ['m'], 'r': ['l'], 'l': ['r'],
    't': ['d'], 'd': ['t'], 'g': ['q'], 'q': ['g']
  };
  
  for (let i = 0; i < lowerQuery.length; i++) {
    const char = lowerQuery[i];
    if (similarChars[char]) {
      similarChars[char].forEach(replacement => {
        const variation = lowerQuery.slice(0, i) + replacement + lowerQuery.slice(i + 1);
        variations.add(variation);
      });
    }
  }
  
  // Missing characters (remove one character at a time)
  for (let i = 0; i < lowerQuery.length; i++) {
    const variation = lowerQuery.slice(0, i) + lowerQuery.slice(i + 1);
    if (variation.length > 2) {
      variations.add(variation);
    }
  }
  
  // Common word patterns and corrections
  const commonCorrections = {
    'batmna': 'batman',
    'batmn': 'batman',
    'btman': 'batman',
    'spidermna': 'spiderman',
    'spidermn': 'spiderman',
    'supermna': 'superman',
    'supermn': 'superman',
    'ironmna': 'ironman',
    'ironmn': 'ironman',
    'avengrs': 'avengers',
    'avengers': 'avengers',
    'jurasic': 'jurassic',
    'jurassic': 'jurassic',
    'jurrasic': 'jurassic',
    'jurasick': 'jurassic',
    'starwars': 'star wars',
    'star wars': 'star wars',
    'lordoftherings': 'lord of the rings',
    'lord of the rings': 'lord of the rings',
    'harrypotter': 'harry potter',
    'harry potter': 'harry potter',
    'fastfurious': 'fast furious',
    'fast furious': 'fast furious',
    'missionimpossible': 'mission impossible',
    'mission impossible': 'mission impossible'
  };
  
  if (commonCorrections[lowerQuery]) {
    variations.add(commonCorrections[lowerQuery]);
  }
  
  // Add more aggressive character pattern matching
  // For cases like "batmna" where 'a' and 'n' are swapped
  if (lowerQuery.includes('mna')) {
    variations.add(lowerQuery.replace('mna', 'man'));
  }
  if (lowerQuery.includes('mn') && !lowerQuery.includes('man')) {
    variations.add(lowerQuery.replace('mn', 'man'));
  }
  
  // Specific patterns for common movie titles
  const moviePatterns = [
    { pattern: /bat.*n.*a/i, replacement: 'batman' },
    { pattern: /spider.*n.*a/i, replacement: 'spiderman' },
    { pattern: /super.*n.*a/i, replacement: 'superman' },
    { pattern: /iron.*n.*a/i, replacement: 'ironman' },
    { pattern: /jur.*s.*c/i, replacement: 'jurassic' },
    { pattern: /juras.*c/i, replacement: 'jurassic' },
    { pattern: /jurasic/i, replacement: 'jurassic' },
    { pattern: /aveng.*r/i, replacement: 'avengers' },
    { pattern: /star.*war/i, replacement: 'star wars' },
    { pattern: /harry.*pot/i, replacement: 'harry potter' },
    { pattern: /lord.*ring/i, replacement: 'lord of the rings' }
  ];
  
  moviePatterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(lowerQuery)) {
      variations.add(replacement);
    }
  });
  
  // Try partial matches for compound words
  if (lowerQuery.length > 4) {
    // Split potential compound words
    for (let i = 2; i < lowerQuery.length - 2; i++) {
      const part1 = lowerQuery.slice(0, i);
      const part2 = lowerQuery.slice(i);
      variations.add(`${part1} ${part2}`);
    }
  }
  
  return Array.from(variations);
}

/**
 * Enhanced search function that tries multiple variations and fuzzy matching
 */
export async function fuzzySearch(searchFunction, originalQuery, options = {}) {
  const {
    similarityThreshold = 0.4, // Lower threshold for more lenient matching
    maxVariations = 10,
    combineResults = true
  } = options;
  
  const results = new Map(); // Use Map to avoid duplicates
  const variations = generateTypoVariations(originalQuery);
  
  // Debug logging
  console.log(`Fuzzy search for: "${originalQuery}"`);
  console.log('Generated variations:', variations.slice(0, 10));
  
  // Try original query first
  try {
    const response = await searchFunction(originalQuery);
    if (response.data.results && response.data.results.length > 0) {
      response.data.results.forEach(item => {
        results.set(item.id, { ...item, searchScore: 1.0 });
      });
    }
  } catch (error) {
    console.warn('Original search failed:', error);
  }
  
  // Always try variations, even if original query had results
  // This ensures we catch typos like "batmna" -> "batman"
  const variationsToTry = variations.slice(1, maxVariations + 1);
  
  for (const variation of variationsToTry) {
    try {
      const response = await searchFunction(variation);
      if (response.data.results) {
        response.data.results.forEach(item => {
          const title = (item.title || item.name || '').toLowerCase();
          const originalLower = originalQuery.toLowerCase();
          
          // Calculate multiple similarity scores
          const titleSimilarity = calculateSimilarity(originalLower, title);
          const variationSimilarity = calculateSimilarity(variation, title);
          
          // Use the best similarity score
          const bestSimilarity = Math.max(titleSimilarity, variationSimilarity);
          
          // Also check if the title contains the search term or vice versa
          const containsScore = title.includes(originalLower) || originalLower.includes(title) ? 0.8 : 0;
          
          // Check for partial word matches (for compound titles)
          const words = title.split(/\s+/);
          const queryWords = originalLower.split(/\s+/);
          let wordMatchScore = 0;
          
          words.forEach(word => {
            queryWords.forEach(queryWord => {
              if (word.includes(queryWord) || queryWord.includes(word)) {
                wordMatchScore = Math.max(wordMatchScore, 0.6);
              }
              if (calculateSimilarity(word, queryWord) > 0.7) {
                wordMatchScore = Math.max(wordMatchScore, 0.7);
              }
            });
          });
          
          const finalScore = Math.max(bestSimilarity, containsScore, wordMatchScore);
          
          if (finalScore >= similarityThreshold) {
            if (!results.has(item.id) || results.get(item.id).searchScore < finalScore) {
              results.set(item.id, { ...item, searchScore: finalScore });
            }
          }
        });
      }
    } catch (error) {
      console.warn(`Search variation "${variation}" failed:`, error);
    }
  }
  
  // If still no results, try even more aggressive matching
  if (results.size === 0) {
    console.log('No results found, trying aggressive matching...');
    
    // Try searching for individual words
    const words = originalQuery.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 2) {
        try {
          const response = await searchFunction(word);
          if (response.data.results) {
            response.data.results.forEach(item => {
              const title = (item.title || item.name || '').toLowerCase();
              if (title.includes(word)) {
                const score = 0.3; // Lower score for partial matches
                if (!results.has(item.id)) {
                  results.set(item.id, { ...item, searchScore: score });
                }
              }
            });
          }
        } catch (error) {
          console.warn(`Word search for "${word}" failed:`, error);
        }
      }
    }
  }
  
  // Sort by search score (relevance)
  const sortedResults = Array.from(results.values())
    .sort((a, b) => b.searchScore - a.searchScore)
    .slice(0, 20);
  
  return {
    data: {
      results: sortedResults
    }
  };
}

export { calculateSimilarity, generateTypoVariations };