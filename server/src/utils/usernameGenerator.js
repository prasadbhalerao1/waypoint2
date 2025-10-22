/**
 * Adjective + Noun Username Generator
 * Generates fun, anonymous usernames like "happyPixel", "jollyRocket"
 * No numeric suffixes - pure word combinations
 * 120 adjectives × 120 nouns = 14,400 unique combinations
 */

const ADJECTIVES = [
  "happy", "zippy", "quirky", "jolly", "merry", "bouncy", "neon", "spark", "blitz", "nifty",
  "whiz", "fuzzy", "doodle", "tango", "breeze", "sizzle", "pepper", "bubble", "giggle", "whirl",
  "sprout", "fluff", "starlit", "lucky", "scoot", "ripple", "crisp", "zest", "glimmer", "poppy",
  "muse", "jazzy", "blossom", "orbit", "comet", "twist", "flutter", "marble", "pickle", "crayon",
  "sparkle", "cuddle", "plum", "sunny", "plucky", "brisk", "cheery", "dapper", "eager", "feisty",
  "giddy", "hasty", "ironic", "jumpy", "keen", "lively", "mellow", "opal", "peppy", "quirk",
  "rosy", "spry", "snappy", "urbane", "vivid", "wicked", "yummy", "zany", "allegro", "blithe",
  "calm", "dandy", "frolic", "gala", "heedful", "intrepid", "jaunty", "keenly", "lumos", "mirth",
  "nova", "optim", "perky", "quell", "regal", "tremor", "undaunted", "vogue", "wistful", "xenial",
  "yearly", "zephyr", "amber", "brio", "cobalt", "dawn", "ember", "fern", "garnet", "harbor",
  "indigo", "jewel", "kismet", "lagoon", "mantis", "nectar", "opaline", "prairie", "quartz", "raven",
  "saffron", "timber", "ultra", "velvet", "willow", "xenon", "yarrow", "zenith", "azure", "bronze",
  "cosmic", "dreamy", "electric", "frosty", "golden", "hazy", "ivory", "jade"
];

const NOUNS = [
  "pixel", "pocket", "rocket", "panda", "breeze", "bubble", "pepper", "spark", "mango", "pickle",
  "marble", "comet", "orbit", "crayon", "canyon", "meadow", "cinder", "flute", "gadget", "jungle",
  "lighthouse", "meerkat", "nebula", "oasis", "panther", "quill", "ripple", "sprocket", "tornado", "vapor",
  "willow", "zealot", "anchor", "barrel", "cobalt", "doodle", "ember", "fable", "gizmo", "harbor",
  "iceberg", "jigsaw", "kettle", "lantern", "monsoon", "narwhal", "orchid", "paddock", "quokka", "rocker",
  "sprout", "tulip", "utopia", "vortex", "whistle", "xylophone", "yeti", "zeppelin", "almond", "brigade",
  "canvas", "drift", "echo", "flicker", "grove", "horizon", "ignite", "jovial", "keystone", "lagoon",
  "murmur", "noodle", "opal", "pioneer", "quartz", "riddle", "shoal", "truffle", "umbra", "valet",
  "xenon", "yardarm", "zephyr", "apricot", "bayou", "caper", "delta", "fjord", "glider", "harlequin",
  "inkling", "julep", "koi", "lumen", "mosaic", "nimbus", "olive", "parasol", "quince", "ranger",
  "sable", "thimble", "undertow", "verve", "wisp", "yarrow", "zircon", "aurora", "dynamo", "evergreen",
  "folio", "glisten", "hush", "iris", "jasper", "karma", "lotus", "mystic", "nectar", "onyx",
  "prism", "quasar", "ruby", "sage", "topaz", "umber", "violet"
];

/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a single username (Adjective + Noun)
 * @returns {string} Generated username like "happyPixel"
 */
export function generateUsername() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}${capitalize(noun)}`;
}

/**
 * Generate all possible unique usernames (Cartesian product)
 * @returns {string[]} Array of all possible usernames (14,400)
 */
export function generateAllUsernames() {
  const allUsernames = [];
  for (const adj of ADJECTIVES) {
    for (const noun of NOUNS) {
      allUsernames.push(`${adj}${capitalize(noun)}`);
    }
  }
  return allUsernames;
}

/**
 * Generate N unique random usernames
 * @param {number} count - Number of usernames to generate
 * @returns {string[]} Array of unique usernames
 */
export function generateUsernames(count = 10) {
  const allUsernames = generateAllUsernames();
  
  // Shuffle array using Fisher-Yates
  for (let i = allUsernames.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allUsernames[i], allUsernames[j]] = [allUsernames[j], allUsernames[i]];
  }
  
  return allUsernames.slice(0, Math.min(count, allUsernames.length));
}

/**
 * Check if username is valid (Adjective+Noun format)
 * @param {string} username - Username to validate
 * @returns {boolean} True if valid
 */
export function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 5 || username.length > 30) return false;
  
  // Must start with lowercase, have one uppercase (camelCase)
  return /^[a-z]+[A-Z][a-z]+$/.test(username);
}

/**
 * Generate username suggestions
 * @param {number} count - Number of suggestions
 * @returns {string[]} Array of username suggestions
 */
export function generateSuggestions(count = 5) {
  const suggestions = new Set();
  
  while (suggestions.size < count) {
    suggestions.add(generateUsername());
  }
  
  return Array.from(suggestions);
}

export default {
  generateUsername,
  generateUsernames,
  isValidUsername,
  generateSuggestions
};
