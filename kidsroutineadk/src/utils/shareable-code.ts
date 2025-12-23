/**
 * Shareable Family Code Generator
 * 
 * Generates human-friendly, shareable family codes in the format:
 * ADJECTIVE-NOUN-XX (e.g., "SUNNY-FALCON-27")
 */

// Predefined word lists - ASCII only, uppercase, easy to read and type
const ADJECTIVES = [
  "SUNNY", "BRAVE", "HAPPY", "SWIFT", "BOLD", "BRIGHT", "CLEVER", "DASHING",
  "FIERY", "GENTLE", "JOLLY", "MIGHTY", "NOBLE", "PROUD", "QUICK", "RADIANT",
  "SHARP", "TIDY", "VIVID", "WISE", "ZESTY", "COSMIC", "EPIC", "FUNNY",
  "GOLDEN", "HAPPY", "JAZZY", "KIND", "LOVELY", "MAGIC", "NEAT", "OCEAN",
  "PEACEFUL", "QUIET", "ROCKY", "SMOOTH", "TROPICAL", "UNIQUE", "VIBRANT",
  "WILD", "YELLOW", "ZEN", "ACTIVE", "BREEZY", "COOL", "DREAMY", "EAGER",
  "FANCY", "GLEAMING", "HOPEFUL", "INSPIRED", "JUBILANT", "KINETIC", "LUCKY",
  "MERRI", "NIMBLE", "OPTIMISTIC", "PLAYFUL", "QUICK", "RESTFUL", "SPARKLY",
  "TIDY", "UPBEAT", "VIVACIOUS", "WONDERFUL", "XENIAL", "YOUTHFUL", "ZANY"
];

const NOUNS = [
  "FALCON", "TIGER", "EAGLE", "LION", "WOLF", "BEAR", "FOX", "HAWK",
  "PANTHER", "JAGUAR", "LYNX", "RACCOON", "OTTER", "BADGER", "DEER", "ELK",
  "MOOSE", "BUFFALO", "BISON", "COUGAR", "BOBCAT", "PUMA", "CHEETAH", "LEOPARD",
  "STAR", "COMET", "PLANET", "MOON", "SUN", "GALAXY", "NEBULA", "ASTEROID",
  "ROCKET", "SPACESHIP", "ORBIT", "COSMOS", "UNIVERSE", "STELLAR", "NOVA",
  "QUASAR", "PULSAR", "METEOR", "CRATER", "CRYSTAL", "GEM", "DIAMOND", "PEARL",
  "RUBY", "SAPPHIRE", "EMERALD", "TOPAZ", "AMETHYST", "JADE", "OPAL", "QUARTZ",
  "MOUNTAIN", "RIVER", "OCEAN", "LAKE", "FOREST", "VALLEY", "CANYON", "CLIFF",
  "WATERFALL", "STREAM", "MEADOW", "FIELD", "ISLAND", "BEACH", "COAST", "BAY",
  "HARBOR", "LIGHTHOUSE", "CASTLE", "TOWER", "BRIDGE", "TEMPLE", "PALACE", "FORT"
];

/**
 * Options for generating a shareable code
 */
export interface ShareableCodeOptions {
  /** Number of digits to append (default: 2) */
  digitLength?: number;
  /** Maximum number of retry attempts for collision checking (default: 10) */
  maxRetries?: number;
  /** Custom adjective list for testing */
  adjectives?: string[];
  /** Custom noun list for testing */
  nouns?: string[];
}

/**
 * Generates a shareable family code in the format: ADJECTIVE-NOUN-XX
 * 
 * @param isCodeAvailable - Async function that checks if a code is already in use
 * @param options - Configuration options
 * @returns A unique shareable code (e.g., "SUNNY-FALCON-27")
 * @throws Error if unable to generate a unique code after max retries
 */
export async function generateShareableCode(
  isCodeAvailable: (code: string) => Promise<boolean> | boolean,
  options: ShareableCodeOptions = {}
): Promise<string> {
  const {
    digitLength = 2,
    maxRetries = 10,
    adjectives = ADJECTIVES,
    nouns = NOUNS,
  } = options;

  // Validate inputs
  if (digitLength < 1 || digitLength > 4) {
    throw new Error("digitLength must be between 1 and 4");
  }
  if (maxRetries < 1) {
    throw new Error("maxRetries must be at least 1");
  }
  if (adjectives.length === 0 || nouns.length === 0) {
    throw new Error("Word lists cannot be empty");
  }

  // Generate cryptographically secure random values
  const getRandomInt = (max: number): number => {
    // Use crypto.getRandomValues for secure randomness
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  };

  // Generate random digits (00-99 for 2 digits, 000-999 for 3, etc.)
  const generateDigits = (): string => {
    const max = Math.pow(10, digitLength) - 1;
    const num = getRandomInt(max + 1);
    return num.toString().padStart(digitLength, "0");
  };

  // Normalize code to uppercase for case-insensitive lookup
  const normalizeCode = (code: string): string => code.toUpperCase();

  // Main generation loop with collision checking
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Step 1: Select random adjective
    const adjective = adjectives[getRandomInt(adjectives.length)];

    // Step 2: Select random noun
    const noun = nouns[getRandomInt(nouns.length)];

    // Step 3: Generate random digits
    const digits = generateDigits();

    // Step 4: Join with hyphens
    const code = `${adjective}-${noun}-${digits}`;

    // Step 5: Normalize for lookup (case-insensitive)
    const normalizedCode = normalizeCode(code);

    // Step 6: Check if code is available
    const available = await isCodeAvailable(normalizedCode);

    if (available) {
      // Return the original code (uppercase) - normalization is for lookup only
      return code.toUpperCase();
    }

    // If not available, retry with a new random combination
    console.log(`[SHAREABLE_CODE] Code collision detected: ${code}, retrying... (attempt ${attempt + 1}/${maxRetries})`);
  }

  // If we've exhausted all retries, throw an error
  throw new Error(
    `Failed to generate unique shareable code after ${maxRetries} attempts. ` +
    `This may indicate the code space is exhausted or the collision checker is not working correctly.`
  );
}

/**
 * Validates if a string matches the shareable code format
 * 
 * @param code - Code to validate
 * @returns True if the code matches the format ADJECTIVE-NOUN-XX
 */
export function isValidShareableCodeFormat(code: string): boolean {
  // Match: UPPERCASE-WORD-UPPERCASE-WORD-DIGITS
  // Example: "SUNNY-FALCON-27"
  const pattern = /^[A-Z]+-[A-Z]+-\d{1,4}$/;
  return pattern.test(code);
}

/**
 * Normalizes a shareable code to uppercase for case-insensitive comparison
 * 
 * @param code - Code to normalize
 * @returns Uppercase version of the code
 */
export function normalizeShareableCode(code: string): string {
  return code.toUpperCase();
}

