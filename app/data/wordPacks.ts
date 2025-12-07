// Word packs for the Skribbl.io game
// Each pack contains themed words for different categories

export interface WordPack {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

export const WORD_PACKS: WordPack[] = [
  {
    id: 'animals',
    name: 'Animals',
    emoji: '🐾',
    words: [
      "alligator", "alpaca", "ant", "anteater", "antelope", "ape", "armadillo", "baboon", "badger", "bat", "bear", "beaver", "bee", "beetle", "bird", "bison", "boar", "buffalo", "bull", "butterfly", "camel", "capybara", "cat", "caterpillar", "chameleon", "cheetah", "chicken", "chimpanzee", "chinchilla", "chipmunk", "cobra", "cockroach", "cow", "crab", "crane", "crocodile", "crow", "deer", "dinosaur", "dog", "dolphin", "donkey", "dragonfly", "duck", "eagle", "eel", "elephant", "elk", "emu", "falcon", "ferret", "fish", "flamingo", "fly", "fox", "frog", "gazelle", "gecko", "giraffe", "goat", "goose", "gorilla", "grasshopper", "hamster", "hare", "hawk", "hedgehog", "heron", "hippo", "hornet", "horse", "hummingbird", "hyena", "iguana", "impala", "jaguar", "jellyfish", "kangaroo", "koala", "komodo dragon", "ladybug", "lemur", "leopard", "lion", "lizard", "llama", "lobster", "locust", "magpie", "mammoth", "manatee", "mantis", "meerkat", "mole", "mongoose", "monkey", "moose", "mosquito", "moth", "mouse", "mule", "narwhal", "newt", "octopus", "okapi", "opossum", "orangutan", "ostrich", "otter", "owl", "ox", "oyster", "panda", "panther", "parrot", "peacock", "pelican", "penguin", "pig", "pigeon", "platypus", "polar bear", "porcupine", "possum", "prawn", "puffin", "puma", "python", "quail", "rabbit", "raccoon", "rat", "rattlesnake", "raven", "reindeer", "rhino", "rooster", "salamander", "salmon", "scorpion", "seahorse", "seal", "shark", "sheep", "shrimp", "skunk", "sloth", "slug", "snail", "snake", "spider", "squid", "squirrel", "starfish", "stork", "swan", "tapir", "tarantula", "termite", "tiger", "toad", "tortoise", "toucan", "trout", "tuna", "turkey", "turtle", "vulture", "walrus", "wasp", "weasel", "whale", "wolf", "wombat", "woodpecker", "worm", "yak", "zebra"
    ]
  },
  {
    id: 'food',
    name: 'Food & Drinks',
    emoji: '🍕',
    words: [
      "apple", "apricot", "avocado", "bacon", "bagel", "banana", "barbecue", "bean", "beer", "berry", "biscuit", "blackberry", "blueberry", "bread", "broccoli", "brownie", "burger", "burrito", "butter", "cabbage", "cake", "candy", "carrot", "cashew", "cauliflower", "cereal", "cheese", "cheeseburger", "cherry", "chestnut", "chili", "chips", "chocolate", "cinnamon", "coconut", "coffee", "cookie", "corn", "cotton candy", "cranberry", "cream", "croissant", "cucumber", "cupcake", "curry", "donut", "egg", "eggplant", "fish and chips", "fries", "garlic", "ginger", "grape", "grapefruit", "guacamole", "ham", "hamburger", "honey", "hot dog", "hot sauce", "ice cream", "jam", "jelly", "juice", "kebab", "ketchup", "kiwi", "lasagna", "lemon", "lettuce", "lime", "lobster", "lollipop", "mango", "marshmallow", "mayonnaise", "meatball", "melon", "milk", "milkshake", "mint", "muffin", "mushroom", "mustard", "nachos", "noodle", "nut", "olive", "onion", "orange", "pancake", "papaya", "pasta", "peach", "peanut", "pear", "peas", "pepper", "pepperoni", "pickle", "pie", "pineapple", "pistachio", "pizza", "plum", "popcorn", "popsicle", "potato", "pretzel", "pumpkin", "radish", "raisin", "raspberry", "rice", "salad", "salami", "salmon", "salt", "sandwich", "sausage", "shrimp", "soup", "soy sauce", "spaghetti", "spinach", "steak", "strawberry", "sugar", "sushi", "taco", "tea", "toast", "tofu", "tomato", "turkey", "waffle", "walnut", "watermelon", "yogurt", "zucchini"
    ]
  },
  {
    id: 'objects',
    name: 'Everyday Objects',
    emoji: '🏠',
    words: [
      "alarm clock", "anchor", "anvil", "armchair", "axe", "backpack", "ball", "balloon", "banana peel", "bandage", "basket", "basketball", "bat", "bathtub", "battery", "bed", "bell", "belt", "bench", "bicycle", "binoculars", "birdcage", "blender", "board", "boat", "bomb", "book", "boomerang", "boot", "bottle", "bowl", "box", "bracelet", "brain", "brick", "bridge", "broom", "brush", "bucket", "bulb", "button", "calculator", "calendar", "camera", "candle", "cannon", "cap", "car", "card", "carpet", "carrot", "castle", "catapult", "chair", "chalk", "chandelier", "charger", "chess", "chest", "chimney", "cigarette", "clock", "cloth", "cloud", "coat", "coffin", "coin", "comb", "compass", "computer", "controller", "cookie jar", "cork", "couch", "crayon", "credit card", "crib", "cup", "cupboard", "curtain", "cushion", "dagger", "dart", "desk", "diamond", "dice", "dictionary", "door", "doormat", "doorbell", "dress", "drill", "drum", "dumbbell", "dynamite", "earings", "easel", "egg", "envelope", "eraser", "fan", "feather", "fence", "fireplace", "flag", "flashlight", "flower", "flute", "fork", "fridge", "frying pan", "fuse", "garbage", "garden", "gate", "gem", "gift", "glass", "glasses", "glove", "glue", "goggles", "guitar", "gun", "hammer", "hammock", "handcuffs", "hanger", "harp", "hat", "headphones", "helmet", "hook", "hose", "hourglass", "house", "ice cube", "igloo", "ink", "ipad", "iphone", "iron", "jacket", "jar", "jeans", "key", "keyboard", "kite", "knife", "ladder", "lamp", "lantern", "laptop", "lasso", "leaf", "lego", "letter", "light bulb", "lighter", "lipstick", "lock", "log", "lollipop", "magnet", "magnifying glass", "mailbox", "manhole", "map", "marble", "mask", "match", "mattress", "medal", "megaphone", "microphone", "microwave", "mirror", "missile", "mittens", "money", "monitor", "mop", "motorcycle", "mountain", "mouse", "mousepad", "mug", "mushroom", "nail", "nail polish", "necklace", "needle", "net", "newspaper", "notebook", "oar", "oven", "paintbrush", "painting", "palette", "pan", "pants", "paper", "paper clip", "parachute", "pencil", "perfume", "phone", "photo", "piano", "pillow", "pin", "pipe", "pistol", "plate", "pliers", "plug", "pocket", "postcard", "poster", "pot", "potato", "present", "printer", "prism", "projector", "purse", "puzzle", "pyramid", "radar", "radio", "rake", "razor", "receipt", "record", "remote", "ring", "robot", "rocket", "rocking chair", "roof", "rope", "rug", "ruler", "safe", "safety pin", "sail", "sand castle", "sandpaper", "sandwich", "satellite", "saxophone", "scale", "scarf", "scissors", "screen", "screw", "screwdriver", "seat belt", "shampoo", "shield", "shirt", "shoe", "shoelace", "shopping cart", "shorts", "shovel", "shower", "skateboard", "skeleton", "ski", "skirt", "skull", "sledgehammer", "slipper", "smoke", "snowball", "snowflake", "snowman", "soap", "sock", "sofa", "sponge", "spoon", "spring", "stairs", "stamp", "stapler", "star", "statue", "steering wheel", "sticker", "stocking", "stop sign", "stove", "straw", "street light", "suitcase", "sun", "sunglasses", "sunscreen", "sweater", "swing", "sword", "syringe", "table", "tablet", "tank", "tape", "target", "taxi", "teapot", "teddy bear", "telephone", "telescope", "television", "tent", "thermometer", "thimble", "thread", "tie", "tire", "toaster", "toilet", "toilet paper", "toothbrush", "toothpaste", "torch", "towel", "tower", "toy", "train", "trash can", "tree", "triangle", "trophy", "trousers", "truck", "trumpet", "tshirt", "umbrella", "underwear", "usb", "vacuum", "vase", "violin", "wagon", "wallet", "wand", "washing machine", "watch", "water gun", "watering can", "web", "well", "wheel", "wheelchair", "whistle", "wig", "windmill", "window", "wire", "wrench", "xylophone", "yacht", "yoyo", "zipper"
    ]
  },
  {
    id: 'actions',
    name: 'Actions',
    emoji: '🏃',
    words: [
      "applaud", "bake", "balance", "bark", "bathe", "beg", "bite", "blow", "blush", "bounce", "bow", "box", "brush", "build", "burn", "buy", "calculate", "camp", "carry", "catch", "celebrate", "chase", "cheer", "chew", "clap", "clean", "climb", "cook", "cough", "count", "crawl", "cry", "cut", "dance", "dig", "dive", "draw", "dream", "drink", "drive", "eat", "explode", "fall", "feed", "fight", "fish", "float", "fly", "frown", "gallop", "give", "glow", "high five", "hit", "hop", "hug", "hunt", "jump", "kick", "kiss", "kneel", "knit", "laugh", "lick", "lift", "listen", "look", "love", "march", "melt", "mix", "mow", "open", "paint", "peel", "plant", "play", "point", "pour", "pray", "pull", "punch", "push", "race", "read", "recycle", "relax", "ride", "roar", "roll", "row", "run", "sail", "scream", "scrub", "search", "sew", "shake", "shave", "shop", "shout", "sing", "sit", "skate", "ski", "skip", "sleep", "slide", "smile", "smoke", "sneeze", "sniff", "snore", "spin", "spit", "splash", "spray", "squat", "stab", "stand", "stare", "steal", "sting", "stir", "stretch", "study", "surf", "sweat", "sweep", "swim", "swing", "talk", "taste", "teach", "tear", "text", "think", "throw", "tickle", "tie", "tip toe", "touch", "travel", "trip", "type", "unlock", "vomit", "vote", "wait", "walk", "wash", "watch", "wave", "whisper", "wink", "wipe", "write", "yawn", "yell", "yoga", "juggle", "mime", "marry", "propose", "argue"
    ]
  },
  {
    id: 'places',
    name: 'Places',
    emoji: '🌍',
    words: [
      "airport", "apartment", "arcade", "attic", "backyard", "bakery", "bank", "bar", "barn", "basement", "bathroom", "beach", "bedroom", "bridge", "bus stop", "cabin", "cafe", "cafeteria", "campsite", "casino", "castle", "cave", "cellar", "cemetery", "church", "cinema", "circus", "classroom", "clinic", "cloud", "club", "college", "concert", "court", "desert", "diner", "disco", "dock", "dungeon", "factory", "farm", "field", "forest", "garage", "garden", "gas station", "gym", "hallway", "harbor", "hospital", "hotel", "house", "island", "jail", "jungles", "kitchen", "laboratory", "lake", "library", "lighthouse", "living room", "lobby", "mansion", "market", "maze", "moon", "mosque", "mountain", "movie theater", "museum", "office", "palace", "park", "parking lot", "party", "pharmacy", "pier", "planet", "playground", "police station", "pool", "port", "post office", "prison", "pub", "pyramid", "restaurant", "river", "road", "room", "sauna", "school", "sea", "sewer", "shop", "shopping mall", "shower", "skyscraper", "stadium", "stage", "station", "store", "street", "studio", "subway", "supermarket", "swamp", "temple", "tent", "theater", "toilet", "tower", "town", "train station", "university", "valley", "village", "volcano", "warehouse", "waterfall", "well", "windmill", "zoo"
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    emoji: '🌳',
    words: [
      "asteroid", "aurora", "beach", "blizzard", "canyon", "cave", "cliff", "cloud", "comet", "constellation", "crystal", "desert", "dew", "dirt", "dust", "earth", "earthquake", "eclipse", "fire", "flower", "fog", "forest", "fossil", "galaxy", "geyser", "glacier", "grass", "hail", "hill", "hurricane", "ice", "iceberg", "island", "jungle", "lake", "lava", "leaf", "lightning", "magma", "meteor", "mist", "moon", "moss", "mountain", "mud", "nebula", "ocean", "orbit", "planet", "pond", "rain", "rainbow", "reef", "river", "rock", "root", "sand", "sea", "seed", "shadow", "sky", "smoke", "snow", "soil", "solar system", "space", "star", "steam", "stone", "storm", "sun", "sunflower", "sunrise", "sunset", "swamp", "thunder", "tornado", "tree", "tsunami", "universe", "valley", "volcano", "water", "waterfall", "wave", "wind"
    ]
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    emoji: '🧙',
    words: [
      "dragon", "unicorn", "wizard", "witch", "ghost", "vampire", "zombie", "mermaid", "robot", "alien",
      "superhero", "ninja", "pirate", "princess", "knight", "crown", "sword", "shield", "magic wand", "treasure",
      "castle", "dungeon", "potion", "spell", "phoenix", "griffin", "fairy", "troll", "ogre", "elf"
    ]
  },
  {
    id: 'movies',
    name: 'Movies & Web Series',
    emoji: '🎬',
    words: [
      'Titanic', 'Avatar', 'Star Wars', 'Harry Potter', 'Batman', 'Superman', 'Spider-Man', 'Iron Man',
      'Frozen', 'Shrek', 'Toy Story', 'Finding Nemo', 'Lion King', 'Aladdin', 'Moana', 'Coco',
      'Friends', 'The Office', 'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'Squid Game',
      'Avengers', 'Jurassic Park', 'Jaws', 'E.T.', 'Ghostbusters', 'Back to the Future', 'Matrix', 'Inception',
      'The Mandalorian', 'The Crown', 'Black Mirror', 'Wednesday', 'The Last of Us', 'The Witcher', 'Money Heist',
      'Better Call Saul', 'The Boys', 'Rick and Morty', 'Narcos', 'Peaky Blinders', 'Dark', 'Sherlock'
    ]
  },
  {
    id: 'gaming',
    name: 'Video Games',
    emoji: '🎮',
    words: [
      'Minecraft', 'Fortnite', 'Mario', 'Zelda', 'Pokemon', 'Sonic', 'Pacman', 'Tetris',
      'Call of Duty', 'GTA', 'FIFA', 'NBA', 'Roblox', 'Among Us', 'Fall Guys', 'Valorant',
      'League of Legends', 'Overwatch', 'Apex Legends', 'Rocket League', 'Elden Ring', 'God of War',
      'controller', 'joystick', 'headset', 'console', 'keyboard', 'mouse', 'power-up', 'boss fight'
    ]
  },
  {
    id: 'coding',
    name: 'Programming',
    emoji: '💻',
    words: [
      'computer', 'keyboard', 'mouse', 'monitor', 'laptop', 'server', 'database', 'cloud',
      'bug', 'debug', 'code', 'function', 'variable', 'loop', 'array', 'object',
      'website', 'app', 'browser', 'internet', 'wifi', 'download', 'upload', 'email',
      'robot', 'AI', 'algorithm', 'binary', 'pixel', 'cursor', 'folder', 'file'
    ]
  },
  {
    id: 'sports',
    name: 'Sports',
    emoji: '⚽',
    words: [
      'soccer', 'basketball', 'football', 'baseball', 'tennis', 'golf', 'hockey', 'volleyball',
      'swimming', 'running', 'cycling', 'skiing', 'skateboarding', 'surfing', 'boxing', 'wrestling',
      'goal', 'touchdown', 'home run', 'slam dunk', 'trophy', 'medal', 'referee', 'stadium',
      'ball', 'bat', 'racket', 'net', 'hoop', 'gloves', 'helmet', 'jersey'
    ]
  },
  {
    id: 'characters',
    name: 'Characters',
    emoji: '🎭',
    words: [
      "alien", "angel", "archer", "artist", "astronaut", "athlete", "baby", "baker", "ballerina", "bandit", "barber", "batman", "boxer", "bride", "burglar", "butcher", "captain", "chef", "clown", "cowboy", "cyclops", "dancer", "demon", "detective", "devil", "diver", "doctor", "dragon", "driver", "dwarf", "elf", "fairy", "farmer", "fireman", "fisherman", "genie", "ghost", "giant", "gnome", "goblin", "god", "goddess", "guard", "hacker", "hero", "hunter", "judge", "king", "knight", "magician", "maid", "mechanic", "medusa", "mermaid", "miner", "minion", "monster", "mummy", "musician", "ninja", "nurse", "ogre", "pilot", "pirate", "plumber", "police", "president", "priest", "prince", "princess", "prisoner", "queen", "robot", "samurai", "santa", "scarecrow", "scientist", "sheriff", "singer", "skeleton", "soldier", "spy", "student", "superhero", "surfer", "teacher", "thief", "troll", "vampire", "viking", "villain", "waiter", "warrior", "werewolf", "witch", "wizard", "worker", "writer", "zombie"
    ]
  },
  {
    id: 'general',
    name: 'General',
    emoji: '🎲',
    words: [
      "advertisement", "afternoon", "age", "air", "alarm", "alphabet", "america", "angel", "anger", "animal", "answer", "antartica", "app", "april", "arch", "army", "art", "asia", "atom", "august", "australia", "author", "autumn", "award", "back", "bad", "bag", "ball", "band", "bank", "base", "bath", "beard", "beautiful", "bed", "bee", "beef", "before", "bell", "best", "big", "bike", "bill", "billion", "bingo", "biology", "bird", "birth", "birthday", "black", "blade", "blind", "block", "blood", "blue", "board", "boat", "body", "bomb", "bone", "book", "border", "boss", "bottle", "bottom", "box", "boy", "brain", "brand", "bread", "break", "breakfast", "breath", "brick", "bridge", "brother", "brown", "brush", "bubble", "bug", "build", "bulb", "burn", "bus", "bush", "business", "butter", "button", "buy", "cake", "call", "camera", "camp", "can", "canada", "candle", "cap", "capital", "car", "card", "care", "carpet", "carry", "case", "cash", "cat", "catch", "cause", "ceiling", "cell", "cent", "center", "century", "chain", "chair", "chalk", "chance", "change", "character", "charge", "chart", "cheap", "check", "cheek", "cheese", "chef", "chemical", "chess", "chest", "chicken", "chief", "child", "china", "choice", "church", "circle", "city", "class", "clean", "clear", "climb", "clock", "close", "cloth", "cloud", "club", "coat", "code", "coffee", "coin", "cold", "college", "color", "comb", "come", "comfort", "comic", "common", "company", "compare", "compass", "complete", "computer", "condition", "cone", "connect", "control", "cook", "cool", "copy", "corn", "corner", "correct", "cost", "cotton", "couch", "cough", "count", "country", "couple", "course", "court", "cover", "cow", "crack", "crash", "cream", "credit", "crime", "cross", "crowd", "crown", "cry", "cup", "curtain", "curve", "custom", "cut", "cycle", "dad", "damage", "dance", "danger", "dark", "data", "date", "daughter", "day", "dead", "deal", "death", "debt", "december", "decision", "deep", "deer", "defense", "degree", "delete", "dentist", "design", "desk", "detail", "devil", "diamond", "diet", "difference", "dig", "dinner", "direction", "dirty", "discover", "disease", "disk", "distance", "divorce", "doctor", "dog", "dollar", "door", "dot", "double", "doubt", "down", "dragon", "draw", "dream", "dress", "drink", "drive", "drop", "drum", "dry", "duck", "dust", "duty", "ear", "early", "earth", "east", "easy", "eat", "edge", "education", "effect", "egg", "eight", "election", "electricity", "elephant", "elevator", "email", "energy", "engine", "engineer", "english", "enjoy", "enough", "enter", "entrance", "equal", "error", "europe", "evening", "event", "ever", "every", "evidence", "example", "exchange", "exercise", "exit", "experience", "expert", "eye", "face", "fact", "fail", "fall", "family", "famous", "fan", "farm", "farmer", "fast", "fat", "father", "fear", "feather", "february", "feed", "feel", "feet", "female", "fence", "fever", "few", "field", "fight", "figure", "file", "fill", "film", "final", "finance", "find", "finger", "finish", "fire", "first", "fish", "five", "flag", "flame", "flat", "flavor", "flesh", "flight", "floor", "flower", "fly", "focus", "fog", "fold", "food", "foot", "football", "force", "forest", "forget", "fork", "form", "fortune", "forward", "four", "frame", "france", "free", "freeze", "french", "fresh", "friday", "friend", "frog", "front", "fruit", "fry", "fuel", "full", "fun", "funeral", "funny", "furniture", "future", "game", "gap", "garage", "garden", "gas", "gate", "gear", "gender", "general", "germany", "ghost", "giant", "gift", "girl", "give", "glass", "glove", "go", "goal", "goat", "god", "gold", "golf", "good", "government", "grade", "grain", "gram", "grand", "grass", "gray", "great", "green", "ground", "group", "grow", "growth", "guard", "guess", "guest", "guide", "guitar", "gun", "gym", "habit", "hair", "half", "hall", "hammer", "hand", "handle", "hang", "happen", "happy", "harbor", "hard", "hat", "hate", "have", "head", "health", "hear", "heart", "heat", "heavy", "heel", "height", "hell", "hello", "help", "hen", "hero", "hide", "high", "history", "hit", "hobby", "hold", "hole", "holiday", "home", "honey", "hook", "hope", "horn", "horse", "hospital", "hot", "hotel", "hour", "house", "human", "humor", "hundred", "hungry", "hunt", "hurry", "hurt", "husband", "ice", "idea", "image", "impact", "important", "inch", "income", "increase", "india", "information", "ink", "insect", "inside", "insurance", "interest", "internet", "interview", "invention", "investment", "iron", "island", "issue", "item", "jail", "jam", "january", "japan", "jar", "jazz", "jeans", "jelly", "jet", "job", "join", "joke", "journey", "joy", "judge", "juice", "july", "jump", "june", "jury", "just", "justice", "keep", "key", "keyboard", "kick", "kid", "kill", "kind", "king", "kiss", "kitchen", "kite", "kitten", "knee", "knife", "knit", "knot", "know", "labor", "ladder", "lady", "lake", "lamp", "land", "language", "large", "last", "late", "laugh", "law", "lawyer", "lay", "layer", "lead", "leaf", "learn", "leather", "leave", "left", "leg", "legal", "lemon", "length", "lesson", "letter", "level", "library", "lie", "life", "lift", "light", "like", "limit", "line", "link", "lion", "lip", "liquid", "list", "listen", "liter", "literature", "little", "live", "liver", "load", "loan", "local", "lock", "log", "long", "look", "loose", "lord", "lose", "loss", "loud", "love", "low", "luck", "lunch", "lung", "machine", "magazine", "magic", "mail", "main", "major", "make", "male", "mall", "man", "manage", "manager", "map", "march", "mark", "market", "marriage", "mars", "mass", "match", "material", "math", "matter", "may", "meal", "mean", "measure", "meat", "media", "medicine", "meet", "melt", "member", "memory", "mental", "menu", "metal", "meter", "method", "middle", "midnight", "mile", "milk", "million", "mind", "mine", "minute", "mirror", "miss", "mistake", "mix", "mixture", "model", "modern", "mom", "moment", "monday", "money", "monitor", "month", "mood", "moon", "morning", "mortgage", "most", "mother", "motor", "mount", "mountain", "mouse", "mouth", "move", "movie", "mud", "muscle", "museum", "music", "nail", "name", "nation", "native", "natural", "nature", "navy", "near", "neck", "need", "needle", "neighbor", "nerve", "net", "network", "never", "new", "news", "newspaper", "next", "nice", "night", "nine", "noise", "north", "nose", "note", "nothing", "notice", "novel", "november", "now", "number", "nurse", "nut", "object", "ocean", "october", "odd", "offer", "office", "officer", "oil", "old", "one", "onion", "open", "opera", "operation", "opinion", "option", "orange", "order", "organ", "original", "other", "oven", "over", "own", "owner", "oxygen", "pack", "page", "pain", "paint", "pair", "palm", "pan", "panel", "paper", "parade", "parent", "park"
    ]
  }
];

// Get words from selected packs
export function getWordsFromPacks(packIds: string[]): string[] {
  if (packIds.length === 0) {
    // Return all words if no packs selected
    return WORD_PACKS.flatMap(pack => pack.words);
  }
  
  return WORD_PACKS
    .filter(pack => packIds.includes(pack.id))
    .flatMap(pack => pack.words);
}

// Get random words from selected packs
export function getRandomWordsFromPacks(packIds: string[], customWords: string[], count: number = 3): string[] {
  let allWords = getWordsFromPacks(packIds);
  
  // Add custom words if provided
  if (customWords.length > 0) {
    allWords = [...allWords, ...customWords];
  }
  
  // Shuffle and pick
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Default selection (all packs)
export const DEFAULT_PACK_IDS = WORD_PACKS.map(p => p.id);
