// Course content: "Let's build a Storyteller".
// Running story: the learner builds Tale, a friendly robot storyteller (a tiny language model).
// Teachers are cartoon AI characters inspired by real scientists, not the real people.

export const COURSE = {
  id: "storyteller",
  title: "Let's build a Storyteller",
  tagline: "Build Tale, a little robot storyteller, one piece at a time.",
};

export const UNITS = [
  { id: 1, title: "What is intelligence?", blurb: "Big questions, rulebooks, and Tale's very first brain cell." },
  { id: 2, title: "How machines learn", blurb: "How mistakes turn into lessons and neurons team up into networks." },
  { id: 3, title: "Machines that read", blurb: "Turning words into numbers, meanings, and next-word guesses." },
  { id: 4, title: "Building the Storyteller", blurb: "Snap the parts together, train Tale, and hear its first story." },
  { id: 5, title: "AI and us", blurb: "Rewards, new senses, and how to keep AI fair and safe." },
];

export const LESSONS = [
  // ───────────────────────── Unit 1: What is intelligence? ─────────────────────────
  {
    id: "can-machines-think",
    unit: 1,
    title: "Can a Machine Think?",
    sub: "Turing's imitation game",
    topic: "What is AI",
    teacher: "turing",
    mins: 5,
    scene: "lab",
    taleGets: "a name and a big dream",
    beats: [
      {
        say: "Hello, I'm Turing, and welcome to the lab! Under that sheet sleeps a robot with no name and no words yet. By the end of this course, it will tell stories.",
        art: "🤖",
        caption: "A sleeping robot",
      },
      {
        say: "I once asked a huge question: can machines think? It's slippery, because nobody agrees on exactly what thinking means. So I swapped it for a game we can actually play.",
        art: "🤔",
        caption: "A very big question",
      },
      {
        say: "It's called the imitation game. A judge trades typed notes with two hidden players, one person and one machine. If the judge can't reliably tell which is which, the machine passes.",
        art: "✉️",
        caption: "Notes behind a curtain",
      },
      {
        say: "Today we call machines that do clever things, like recognizing faces or writing sentences, artificial intelligence. Most modern AI doesn't follow a script. It learns patterns from huge piles of examples.",
        art: "🧠",
        caption: "Patterns, not magic",
      },
      {
        say: "Now our robot needs a name. Let's call it Tale, because one day it will tell tales. Tale just got a name and a big dream!",
        art: "✨",
        caption: "Meet Tale",
      },
    ],
    predict: {
      q: "If a machine could chat so well that you couldn't tell it from a person, would that prove it truly thinks? Why or why not?",
      hint: "Ask yourself whether acting smart and being smart are the same thing.",
    },
    check: [
      {
        q: "In the imitation game, how does the judge talk to the hidden players?",
        options: ["By looking at their faces", "By typed messages", "By listening to their voices"],
        answer: 1,
        why: "Typing hides looks and voices, so only the conversation itself counts.",
        hint: "The game wants nothing but the words to matter.",
      },
      {
        q: "How does a machine pass the imitation game?",
        options: ["By solving math puzzles fastest", "By beating a human at chess", "The judge can't reliably tell it from the human"],
        answer: 2,
        why: "Passing means its conversation is good enough that the judge can't reliably spot which player is the machine.",
        hint: "Think about what the judge is trying to figure out.",
      },
    ],
    explain: {
      prompt: "Explain Turing's imitation game to me as if I'd never heard of it.",
      key: "A judge exchanges typed messages with two hidden players, a human and a machine. If the judge can't reliably tell which one is the machine, the machine passes. Turing used it to replace the fuzzy question 'can machines think?' with a test of behavior we can actually run.",
    },
    concepts: ["Artificial intelligence", "Turing test", "Imitation game"],
  },
  {
    id: "rules-or-learning",
    unit: 1,
    title: "Rules or Learning?",
    sub: "The penguin problem",
    topic: "Symbolic AI vs machine learning",
    teacher: "mccarthy",
    mins: 6,
    scene: "library",
    taleGets: "a notebook for learning from examples",
    beats: [
      {
        say: "Hi, I'm McCarthy! I helped give this whole field its name: artificial intelligence. Early on, many of us tried to make machines smart by writing down rules, like a giant recipe book.",
        art: "📜",
        caption: "A giant rulebook",
      },
      {
        say: "Watch this. Rule one: if it has feathers and lays eggs, it's a bird; rule two: birds can fly. So Tale says a robin can fly, and it's right!",
        art: "🐦",
        caption: "If this, then that",
      },
      {
        say: "Then a penguin waddles in with feathers and eggs, so it flies, right? Nope! Every exception needs another rule, and the real world has endless exceptions, so the rulebook grows and grows.",
        art: "🐧",
        caption: "The penguin problem",
      },
      {
        say: "Writing rules like this is called symbolic AI. It shines when the rules are clear, like chess moves or logic puzzles. But nobody can write every rule for recognizing a face or telling a story.",
        art: "♟️",
        caption: "Clear rules, clear wins",
      },
      {
        say: "So there's another way, called machine learning. Instead of writing rules, we show the machine lots of examples and let it find the patterns itself. Tale just got a notebook for learning from examples!",
        art: "📓",
        caption: "Learning from examples",
      },
    ],
    predict: {
      q: "How would you write rules so a computer can tell a cat photo from a dog photo? What problems might you run into?",
      hint: "Try listing a few rules, then picture a cat or dog that breaks them.",
    },
    check: [
      {
        q: "What does symbolic AI rely on?",
        options: ["Random guessing", "Rules written by people", "Photos of real brains"],
        answer: 1,
        why: "Symbolic AI follows explicit if-then rules and facts that people write down.",
        hint: "Think of the giant recipe book.",
      },
      {
        q: "Why did the penguin cause trouble for the rulebook?",
        options: ["Penguins are too big for computers", "The robot ran out of paper", "It broke a rule, so a new exception was needed"],
        answer: 2,
        why: "Penguins are birds that can't fly, so the 'birds fly' rule needed an exception, and the real world is full of those.",
        hint: "What did rule two say about birds?",
      },
    ],
    explain: {
      prompt: "What's the difference between giving a machine rules and letting it learn from examples?",
      key: "In symbolic AI, people write explicit if-then rules and the machine follows them; this works when rules are clear but breaks down with endless exceptions. In machine learning, the machine is shown many examples and adjusts itself to find the patterns, which handles messy real-world tasks better.",
    },
    concepts: ["Symbolic AI", "Expert systems", "Machine learning"],
  },
  {
    id: "tiny-voter",
    unit: 1,
    title: "The Tiny Voter",
    sub: "Build a perceptron",
    topic: "Perceptron",
    teacher: "minsky",
    mins: 6,
    scene: "workshop",
    taleGets: "its very first brain cell",
    beats: [
      {
        say: "Hello, I'm Minsky! Today we build Tale's first brain cell, called a perceptron. Real neurons collect signals and fire when they get enough, and a perceptron copies that idea.",
        art: "⚡",
        caption: "A brain cell, inspired",
      },
      {
        say: "Think of it as a tiny voter deciding whether Tale should go outside, using two inputs: is it sunny, and is it warm? Each input has a weight, which says how much that vote counts.",
        art: "🗳️",
        caption: "A tiny voter",
      },
      {
        say: "Multiply each input by its weight, add them up, and compare the total to a threshold. Above it, the perceptron says yes; below it, no. Try the knobs yourself!",
        art: "🎛️",
        caption: "Weights and a threshold",
        widget: "neuron",
      },
      {
        say: "Here's the clever part, shown by Frank Rosenblatt: perceptrons can learn. When one answers wrong, nudge its weights toward the right answer, and after many examples it gets good.",
        art: "🔧",
        caption: "Learning by nudging",
      },
      {
        say: "One perceptron can only split things with a single straight line. Seymour Papert and I showed it can't learn 'one or the other, but not both.' Tale just got its very first brain cell!",
        art: "🧠",
        caption: "One cell, one line",
      },
    ],
    predict: {
      q: "If 'sunny' has a big weight and 'warm' has a tiny weight, which input mostly decides the answer? Why?",
      hint: "A bigger weight means a louder vote.",
    },
    check: [
      {
        q: "What does a perceptron do with its weighted inputs?",
        options: ["Picks the biggest input and ignores the rest", "Multiplies them all together", "Adds them up and compares the total to a threshold"],
        answer: 2,
        why: "A perceptron sums weight times input for each input and fires if the total passes the threshold.",
        hint: "Remember the voter counting up the votes.",
      },
      {
        q: "What does a weight tell the perceptron?",
        options: ["How much an input counts", "How heavy the robot is", "How many inputs there are"],
        answer: 0,
        why: "A weight sets how strongly an input pushes the decision toward yes or no.",
        hint: "Some votes are louder than others.",
      },
    ],
    explain: {
      prompt: "Explain how a perceptron decides yes or no, and how it learns.",
      key: "Each input is multiplied by a weight showing how much it matters, and the results are added up. If the sum is above a threshold, it outputs yes; otherwise no. It learns by nudging its weights toward the right answer whenever it gets an example wrong.",
    },
    concepts: ["Perceptron", "Weights", "Threshold"],
  },

  // ───────────────────────── Unit 2: How machines learn ─────────────────────────
  {
    id: "fog",
    unit: 2,
    special: "fog",
    title: "Lost in the Fog",
    sub: "Which way is downhill?",
    topic: "Gradient descent",
    teacher: "einstein",
    mins: 6,
    taleGets: "a compass that points downhill",
    beats: [],
    concepts: ["Loss", "Gradient descent", "Slope"],
  },
  {
    id: "passing-the-blame",
    unit: 2,
    title: "Passing the Blame",
    sub: "How mistakes flow backward",
    topic: "Backpropagation",
    teacher: "feynman",
    mins: 7,
    scene: "workshop",
    taleGets: "a way to learn from its mistakes",
    beats: [
      {
        say: "Hey, Feynman here! In the fog you learned to walk downhill on the error, but Tale has many knobs, its weights. Which knob should turn, and which way?",
        art: "🕵️",
        caption: "Which knob is guilty?",
      },
      {
        say: "Picture a chain of kitchen helpers: one measures sugar, one doubles it, one mixes it into the batter. The cake comes out too sweet. Who's to blame, and how much?",
        art: "🎂",
        caption: "A chain of helpers",
      },
      {
        say: "Start at the end and work backward. The last helper sees how far off the cake was and passes the blame back, and each helper works out its own share. That's backpropagation.",
        art: "⬅️",
        caption: "Blame flows backward",
      },
      {
        say: "The rule for sharing blame is the chain rule: your share equals how much you changed the next step, times the blame that step received. Multiply along the chain, and every knob gets a number.",
        art: "🔗",
        caption: "The chain rule",
      },
      {
        say: "Those numbers are gradients. Each one says which way to turn a knob to shrink the error, and how much it matters. Tale just got a way to learn from its mistakes!",
        art: "📉",
        caption: "Every knob gets a nudge",
      },
    ],
    predict: {
      q: "The cake is too sweet. Should the helper who doubled the sugar share the blame? How could you figure out how much?",
      hint: "Ask: if each helper changed their step a tiny bit, how much would the sweetness change?",
    },
    check: [
      {
        q: "Which direction does backpropagation pass the blame?",
        options: ["From the inputs forward to the output", "From the output backward to the inputs", "In a random order"],
        answer: 1,
        why: "It starts from the error at the output and works backward, step by step, to every weight.",
        hint: "The lesson's name gives a clue about direction.",
      },
      {
        q: "What does a gradient tell you about a weight?",
        options: ["Which way to nudge it to lower the error, and how strongly", "How old the weight is", "Whether the weight is a positive number"],
        answer: 0,
        why: "A gradient measures how the error changes when that weight changes, so it points the way to improve.",
        hint: "Think back to finding downhill in the fog.",
      },
    ],
    explain: {
      prompt: "How does a network figure out which weights to fix after a wrong answer?",
      key: "It measures the error at the output, then works backward through each step using the chain rule, multiplying local effects together, to get a gradient for every weight. Each gradient shows how the error changes if that weight changes, so every weight can be nudged a little in the direction that lowers the error.",
    },
    concepts: ["Backpropagation", "Chain rule", "Gradients"],
  },
  {
    id: "many-voters",
    unit: 2,
    title: "Many Voters",
    sub: "Layers of neurons",
    topic: "Multilayer perceptron",
    teacher: "cajal",
    mins: 6,
    scene: "forest",
    taleGets: "a whole team of brain cells, stacked in layers",
    beats: [
      {
        say: "Hola, I'm Cajal! I spent years at my microscope drawing brain cells, which branch like a forest and link to many others. A brain isn't one cell; it's a crowd.",
        art: "🌳",
        caption: "A forest of neurons",
      },
      {
        say: "Remember Minsky's warning: one perceptron can only draw one straight line. So let's use many! A first layer of voters each spots something simple and passes its answer on.",
        art: "👥",
        caption: "Voters in a row",
      },
      {
        say: "A second layer listens to the first and combines their answers. Layers in the middle are called hidden layers. Together they can bend that straight line into curves and solve the 'not both' puzzle.",
        art: "🧩",
        caption: "Hidden layers",
      },
      {
        say: "The secret ingredient is a bend. Each voter passes its total through an activation function, like ReLU, which turns negatives into zero. Without that bend, many layers would act like just one.",
        art: "〰️",
        caption: "The bendy part",
      },
      {
        say: "Backpropagation trains every layer at once, passing blame back through all of them. This is a multilayer perceptron, a true neural network. Tale just got a whole team of brain cells, stacked in layers!",
        art: "🧠",
        caption: "A neural network",
      },
    ],
    predict: {
      q: "Why might two layers of voters solve puzzles that one voter can't?",
      hint: "Think of the first layer spotting clues and the second layer combining them.",
    },
    check: [
      {
        q: "What is a hidden layer?",
        options: ["The final answer of the network", "A layer the programmer forgot about", "A layer between the input and the output"],
        answer: 2,
        why: "Hidden layers sit between inputs and outputs, turning simple clues into more useful features.",
        hint: "Where are the layers you don't see from outside?",
      },
      {
        q: "Why does each neuron use an activation function like ReLU?",
        options: ["To make the network run on batteries", "To add a bend, so stacked layers can learn curvy patterns", "To delete wrong answers"],
        answer: 1,
        why: "Without a nonlinear bend, stacked layers collapse into one straight-line layer.",
        hint: "What would happen if every layer only drew straight lines?",
      },
    ],
    explain: {
      prompt: "Why do we stack perceptrons into layers instead of using just one?",
      key: "A single perceptron can only separate things with one straight line. Stacking layers, with a nonlinear activation between them, lets the network combine simple features into complex, curved boundaries, like solving 'one or the other but not both' (XOR). Without the nonlinearity, many layers would act like a single linear layer.",
    },
    concepts: ["Multilayer perceptron", "Hidden layers", "Activation functions"],
  },
  {
    id: "seeing-in-patterns",
    unit: 2,
    title: "Seeing in Patterns",
    sub: "How machines see pictures",
    topic: "Convolutional neural networks",
    teacher: "davinci",
    mins: 6,
    scene: "city",
    taleGets: "a pattern-spotting magnifying glass",
    beats: [
      {
        say: "Buongiorno, I'm Leonardo! I filled notebooks by studying things up close, like birds' wings and swirling water. Today Tale learns to look closely too, at pictures.",
        art: "🎨",
        caption: "Notebooks full of looking",
      },
      {
        say: "To a computer, a picture is a grid of numbers, one for each pixel's brightness or color. A cat photo is just thousands of numbers. So how do you find the cat?",
        art: "🔢",
        caption: "A grid of numbers",
      },
      {
        say: "Use a tiny window called a filter, and slide it across the picture patch by patch, checking each spot for one pattern, like an edge. The same filter checks everywhere. That sliding is called convolution.",
        art: "🔍",
        caption: "Sliding a little window",
      },
      {
        say: "Now stack layers. The first spots edges, the next combines edges into curves and corners, and deeper ones build eyes, ears, whiskers, then whole cats. Big ideas, built from small pieces.",
        art: "🐱",
        caption: "Edges to eyes to cats",
      },
      {
        say: "Best of all, nobody draws the filters by hand; the network learns them from labeled examples with backpropagation. This is a convolutional neural network. Tale just got a pattern-spotting magnifying glass!",
        art: "🖼️",
        caption: "Filters learn themselves",
      },
    ],
    predict: {
      q: "Why might it help to use the same small filter everywhere in a picture, instead of different rules for every spot?",
      hint: "A cat's ear looks like an ear whether it's at the top or the bottom of the photo.",
    },
    check: [
      {
        q: "To a computer, what is a picture?",
        options: ["A list of words", "A sound wave", "A grid of numbers"],
        answer: 2,
        why: "Each pixel is stored as numbers for its brightness or color, arranged in a grid.",
        hint: "Think about pixels.",
      },
      {
        q: "What do the first layers of a CNN usually detect?",
        options: ["Simple things like edges", "Whole faces", "The photo's file name"],
        answer: 0,
        why: "Early filters find simple features like edges, and deeper layers combine them into bigger shapes.",
        hint: "Big ideas are built from small pieces.",
      },
    ],
    explain: {
      prompt: "How does a convolutional neural network find a cat in a photo?",
      key: "It slides small learned filters across the image to detect simple features, like edges, wherever they appear. Later layers combine those into more complex parts (corners, eyes, ears) and finally whole objects. The filters are learned from labeled examples using backpropagation, not written by hand.",
    },
    concepts: ["Convolution", "Filters", "Feature hierarchy"],
  },

  // ───────────────────────── Unit 3: Machines that read ─────────────────────────
  {
    id: "chopping-words",
    unit: 3,
    title: "Chopping Words",
    sub: "Turning text into tokens",
    topic: "Tokenization (byte pair encoding)",
    teacher: "tagore",
    mins: 6,
    scene: "library",
    taleGets: "scissors for snipping words into tokens",
    beats: [
      {
        say: "Namaskar, I'm Tagore! I wrote poems and songs, and I adore words. But Tale has a problem: computers only understand numbers, so before Tale reads a single poem, words must become numbers.",
        art: "📖",
        caption: "Words must become numbers",
      },
      {
        say: "One idea: give every whole word a number. But there are millions of words, plus names, typos, and new slang. Giving every letter a number works, but then sentences get very long.",
        art: "✂️",
        caption: "Too big or too small",
      },
      {
        say: "Byte pair encoding finds the middle path. Start with single characters, really bytes. Find the pair that sits side by side most often, like 't' and 'h', and glue it into one new piece, 'th'.",
        art: "🧩",
        caption: "Glue the commonest pair",
      },
      {
        say: "Repeat that thousands of times, and common words like 'the' become a single piece while rare words split into a few. These pieces are called tokens. Type something and watch it split!",
        art: "🔤",
        caption: "Words into tokens",
        widget: "tokens",
      },
      {
        say: "Each token gets an ID number from Tale's vocabulary list. Now any text, even made-up words, becomes a row of numbers. Tale just got scissors for snipping words into tokens!",
        art: "🔢",
        caption: "Every token gets a number",
      },
    ],
    predict: {
      q: "Why might a rare word like 'unhappiness' get split into smaller pieces, while 'the' stays whole?",
      hint: "Think about which letter combinations show up again and again in lots of text.",
    },
    check: [
      {
        q: "What does byte pair encoding do over and over?",
        options: ["Deletes the rarest letters", "Merges the most frequent neighboring pair into a new token", "Translates words into English"],
        answer: 1,
        why: "BPE repeatedly finds the most common adjacent pair and merges it into a new, bigger token.",
        hint: "Remember 't' and 'h' becoming 'th'.",
      },
      {
        q: "Why not just give every whole word its own number?",
        options: ["There are too many words, and new ones appear all the time", "Computers can't count that high", "Words never repeat"],
        answer: 0,
        why: "A whole-word vocabulary would be enormous and still couldn't handle typos, names, or brand-new words.",
        hint: "Think about slang and typos.",
      },
    ],
    explain: {
      prompt: "Explain how byte pair encoding builds its tokens.",
      key: "It starts with single characters (bytes) and repeatedly finds the most frequent adjacent pair in the training text, merging it into a new token. After many merges, common words become single tokens while rare words split into a few subword pieces. Each token then gets an ID number from the vocabulary.",
    },
    concepts: ["Tokens", "Byte pair encoding", "Vocabulary"],
  },
  {
    id: "meaning-map",
    unit: 3,
    title: "The Meaning Map",
    sub: "Where words live",
    topic: "Embeddings",
    teacher: "mirzakhani",
    mins: 6,
    scene: "space",
    taleGets: "a map where every token has a home",
    beats: [
      {
        say: "Hi, I'm Mirzakhani! I love geometry, the math of shapes and spaces. Today we draw a map, but instead of cities it holds words, and words with similar meanings live close together.",
        art: "🗺️",
        caption: "A map of meanings",
      },
      {
        say: "A token's ID is just a label: token 42 isn't closer in meaning to token 43. So each token also gets a list of numbers, its coordinates on the meaning map. That list is called an embedding.",
        art: "📍",
        caption: "Coordinates for words",
      },
      {
        say: "On this map, 'cat' sits near 'kitten' and 'dog', while 'banana' lives far away near 'mango'. Even directions can carry meaning: the step from 'man' to 'woman' is often roughly like 'king' to 'queen'.",
        art: "👑",
        caption: "Neighbors in meaning",
      },
      {
        say: "A paper map has two directions, north and east. Tale's map has hundreds, far too many to picture, but the math works the same way. Distance still tells you how alike two tokens are.",
        art: "🌌",
        caption: "Hundreds of directions",
      },
      {
        say: "Nobody places the words by hand. Tale starts with random spots, and training slowly pulls words used in similar ways closer together. Tale just got a map where every token has a home!",
        art: "🏠",
        caption: "Learned, not placed",
      },
    ],
    predict: {
      q: "On a meaning map, would you place 'puppy' closer to 'kitten' or to 'spoon'? What makes two words close?",
      hint: "Think about the kinds of sentences each word usually shows up in.",
    },
    check: [
      {
        q: "What is an embedding?",
        options: ["A token's spelling backward", "A list of numbers that places a token on a meaning map", "A dictionary definition"],
        answer: 1,
        why: "An embedding is a vector of numbers, like coordinates, so similar tokens can sit close together.",
        hint: "Think coordinates, not letters.",
      },
      {
        q: "How do embeddings get their positions?",
        options: ["Someone places each word by hand", "They follow alphabetical order", "They are learned during training from how words are used"],
        answer: 2,
        why: "They start random, and training moves tokens that appear in similar contexts closer together.",
        hint: "Where did Tale's tokens start out?",
      },
    ],
    explain: {
      prompt: "What is an embedding, and why is it more useful than a plain ID number?",
      key: "An embedding is a learned list of numbers (a vector) for each token, like coordinates in a space with many dimensions. Tokens used in similar ways end up close together, so distance and direction capture meaning. A plain ID number is just a label and carries no sense of similarity.",
    },
    concepts: ["Embeddings", "Vectors", "Similarity"],
  },
  {
    id: "guess-the-next-word",
    unit: 3,
    title: "Guess the Next Word",
    sub: "Your first language model",
    topic: "Bigram language model",
    teacher: "bohr",
    mins: 6,
    scene: "lab",
    taleGets: "its first voice: a next-word guesser",
    beats: [
      {
        say: "Hello, Bohr here! In my world of atoms, you often can't say exactly what happens next, only how likely each outcome is. Language is a bit like that, so let's teach Tale to guess.",
        art: "🎲",
        caption: "Likely, not certain",
      },
      {
        say: "The game: given one word, guess the next. After 'once' probably comes 'upon', but after 'the' lots of words could follow, like 'dog', 'end', or 'king'. Some guesses are simply more likely.",
        art: "❓",
        caption: "What comes next?",
      },
      {
        say: "Tale reads a big pile of stories and counts every pair of neighbors. If 'once' was followed by 'upon' 90 times out of 100, the chance of 'upon' after 'once' is 90 percent.",
        art: "📊",
        caption: "Counting pairs",
      },
      {
        say: "Using just one word back is called a bigram model. To write, Tale picks each next word like rolling weighted dice, then repeats. Build a sentence yourself!",
        art: "🧱",
        caption: "Rolling weighted dice",
        widget: "nextword",
      },
      {
        say: "The stories come out wobbly, because Tale forgets everything except the last word. Still, it's a real language model. Tale just got its first voice: a next-word guesser!",
        art: "🗣️",
        caption: "A wobbly first voice",
      },
    ],
    predict: {
      q: "A bigram model only looks at the one word right before. What kinds of mistakes do you think its stories will have?",
      hint: "Imagine writing a story while remembering only the last word you wrote.",
    },
    check: [
      {
        q: "How does a bigram model choose the next word?",
        options: ["Using the whole story so far", "Using only the one word just before it", "Using the book's title"],
        answer: 1,
        why: "A bigram model's guess depends only on the current word, using counts of which words followed it.",
        hint: "'Bi' means two: the current word and the next.",
      },
      {
        q: "If 'once' is followed by 'upon' 90 times out of 100, what's the chance of 'upon' after 'once'?",
        options: ["9 percent", "50 percent", "90 percent"],
        answer: 2,
        why: "Probability here is count divided by total: 90 out of 100 is 90 percent.",
        hint: "Divide the count by the total.",
      },
    ],
    explain: {
      prompt: "Explain how a bigram model writes a sentence.",
      key: "It counts, in lots of training text, how often each word (or character) follows each other one, and turns those counts into probabilities. To generate, it repeatedly samples the next token based only on the current one. Because it only looks one step back, its text is locally plausible but quickly loses track of meaning.",
    },
    concepts: ["Language model", "Bigram", "Probability", "Sampling"],
  },
  {
    id: "who-to-listen-to",
    unit: 3,
    title: "Who to Listen To",
    sub: "The magic of attention",
    topic: "Attention",
    teacher: "kahneman",
    mins: 7,
    scene: "city",
    taleGets: "a spotlight for paying attention",
    beats: [
      {
        say: "Hello, I'm Kahneman. I studied how people think, including attention: your mind can't focus on everything, so it chooses what matters. Tale badly needs that skill.",
        art: "🔦",
        caption: "Choosing what matters",
      },
      {
        say: "Read this: 'The dragon guarded the gold because it was greedy.' Who is 'it'? You know it's the dragon. To work that out, Tale must look back across the whole sentence, not just one word.",
        art: "🐉",
        caption: "Who is 'it'?",
      },
      {
        say: "Attention lets every word ask a question. 'It' asks: which earlier word am I about? Every earlier word holds up a label, and the words whose labels best match the question get the most attention.",
        art: "🙋",
        caption: "Questions and labels",
      },
      {
        say: "Then 'it' gathers information from those words, mixed by how much attention each one got: mostly dragon, a little gold. Tap a word and see who it listens to!",
        art: "👂",
        caption: "Mixing what matters",
        widget: "attention",
      },
      {
        say: "In the real math, the question is a query, the label is a key, and the information is a value. Tale learns them all in training. Tale just got a spotlight for paying attention!",
        art: "💡",
        caption: "Query, key, value",
      },
    ],
    predict: {
      q: "In 'The dragon guarded the gold because it was greedy,' which words should 'it' pay the most attention to? Why?",
      hint: "Who in the sentence could be greedy?",
    },
    check: [
      {
        q: "What can attention do that a bigram model can't?",
        options: ["Use information from many earlier words, not just the last one", "Spell words correctly", "Make the computer louder"],
        answer: 0,
        why: "Attention lets each token look back at all earlier tokens and pull in what's relevant.",
        hint: "How far back can a bigram model see?",
      },
      {
        q: "In attention, what decides how much one word listens to another?",
        options: ["Which word is longer", "Alphabetical order", "How well its query matches the other word's key"],
        answer: 2,
        why: "A query that matches a key well gives a high attention weight, so that word's value counts more.",
        hint: "Think about questions and labels.",
      },
    ],
    explain: {
      prompt: "How does attention help Tale figure out what 'it' means in a sentence?",
      key: "Each token makes a query, and earlier tokens offer keys. The better a key matches the query, the bigger that token's attention weight (the weights add up to 1). The token then takes a weighted mix of those tokens' values, so 'it' can pull in information from 'dragon' even when it's far away.",
    },
    concepts: ["Attention", "Query, key, value", "Context"],
  },

  // ───────────────────────── Unit 4: Building the Storyteller ─────────────────────────
  {
    id: "the-transformer",
    unit: 4,
    title: "The Transformer",
    sub: "Snapping the parts together",
    topic: "Transformer",
    teacher: "newell",
    mins: 7,
    scene: "workshop",
    taleGets: "a whole storytelling engine: the transformer",
    beats: [
      {
        say: "Hello, I'm Newell. I love the architecture of thinking, how simple parts fit together into a mind. Today we snap Tale's parts into one machine: the transformer, the design behind modern chatbots.",
        art: "🏗️",
        caption: "Snapping parts together",
      },
      {
        say: "First, tokens become embeddings. But attention alone doesn't know word order, so we add position information too. After all, 'dog bites man' and 'man bites dog' must look different!",
        art: "🔢",
        caption: "Where is each word?",
      },
      {
        say: "Next comes a block with two steps. Attention lets the tokens share information with each other. Then a small multilayer network lets each token think it over on its own.",
        art: "🧱",
        caption: "Share, then think",
      },
      {
        say: "Stack many blocks, like floors of a tower, each one refining the understanding. Shortcut paths called residual connections carry information around every step, which keeps the tall tower easy to train.",
        art: "🗼",
        caption: "A tower of blocks",
      },
      {
        say: "At the top, Tale turns the last token's understanding into a probability for every token in its vocabulary: what comes next? Tale just got a whole storytelling engine: the transformer!",
        art: "⚙️",
        caption: "What comes next?",
      },
    ],
    predict: {
      q: "Why might stacking many blocks of 'share, then think' work better than using just one?",
      hint: "Think about understanding a story: first words, then sentences, then the whole plot.",
    },
    check: [
      {
        q: "What are the two main steps inside a transformer block?",
        options: ["Counting, then sorting", "Tokenizing, then printing", "Attention, then a small neural network"],
        answer: 2,
        why: "Each block lets tokens share information with attention, then processes each token with a feed-forward network.",
        hint: "Share, then think.",
      },
      {
        q: "Why does a transformer add position information to tokens?",
        options: ["To make tokens heavier", "Because attention alone doesn't know word order", "To count the vowels"],
        answer: 1,
        why: "Without positions, attention would treat 'dog bites man' and 'man bites dog' the same.",
        hint: "Remember the dog and the man.",
      },
    ],
    explain: {
      prompt: "Describe the journey of a sentence through a transformer.",
      key: "Tokens become embeddings plus position information. They pass through a stack of blocks; in each, attention lets tokens share information, then a feed-forward network processes each token, with residual connections around both steps. At the top, the result is turned into probabilities for the next token.",
    },
    concepts: ["Transformer", "Transformer block", "Positional encoding", "Residual connections"],
  },
  {
    id: "practice-makes-perfect",
    unit: 4,
    title: "Practice Makes Perfect",
    sub: "Training with the right steps",
    topic: "Training and optimization (learning rate, AdamW)",
    teacher: "curie",
    mins: 7,
    scene: "lab",
    taleGets: "lots and lots of practice",
    beats: [
      {
        say: "Bonjour, I'm Marie Curie. In my lab, discoveries took patience, processing tons of ore again and again. Training Tale takes patience too, because its engine is built but every weight is still random.",
        art: "⚗️",
        caption: "Patience in the lab",
      },
      {
        say: "Training is a loop. Show Tale a chunk of real text, ask it to predict each next token, and score how wrong it was. That score is the loss, and backpropagation tells each weight how to improve.",
        art: "🔁",
        caption: "The training loop",
      },
      {
        say: "How big should each nudge be? That's the learning rate. Too big, and Tale leaps right over the bottom of the valley; too small, and it crawls for ages.",
        art: "👣",
        caption: "Step size matters",
      },
      {
        say: "A clever helper called AdamW steers each nudge. It keeps momentum like a rolling ball, gives every weight its own step size, and gently shrinks weights so none grow too wild.",
        art: "🧭",
        caption: "AdamW at the wheel",
      },
      {
        say: "Big models practice on trillions of tokens, with thousands of chips working together for weeks. Slowly the loss drops and the guesses get better. Tale just got lots and lots of practice!",
        art: "📚",
        caption: "Trillions of practice tokens",
      },
    ],
    predict: {
      q: "Walking down a foggy valley, what could go wrong with giant leaps? What about tiny baby steps?",
      hint: "Picture overshooting the bottom versus barely moving.",
    },
    check: [
      {
        q: "What is the loss during training?",
        options: ["A score of how wrong the predictions were", "The number of weights that fell out", "How long training takes"],
        answer: 0,
        why: "The loss measures how far Tale's predictions are from the real next tokens; training tries to make it smaller.",
        hint: "It's the thing we want to push downhill.",
      },
      {
        q: "What happens if the learning rate is far too big?",
        options: ["Training becomes perfectly smooth", "Updates overshoot, so the loss bounces around or blows up", "The model stops using tokens"],
        answer: 1,
        why: "Giant steps jump past the low point of the valley, so the loss can't settle down.",
        hint: "Think about leaping across the valley.",
      },
    ],
    explain: {
      prompt: "Walk me through one round of Tale's training loop, and tell me what the learning rate controls.",
      key: "Tale predicts the next token for a batch of text, the loss measures how wrong it was, backpropagation computes gradients, and an optimizer like AdamW nudges the weights to lower the loss. The learning rate sets the size of each nudge: too big overshoots, too small learns very slowly.",
    },
    concepts: ["Loss", "Learning rate", "AdamW", "Training loop"],
  },
  {
    id: "teaching-manners",
    unit: 4,
    title: "Teaching Manners",
    sub: "From rambler to helper",
    topic: "Finetuning (SFT and RLHF)",
    teacher: "ostrom",
    mins: 7,
    scene: "forest",
    taleGets: "good manners",
    beats: [
      {
        say: "Hello, I'm Ostrom! I studied how communities agree on shared rules, for things like forests and fisheries. Tale needs some manners too, because right after training it has a strange habit.",
        art: "🌲",
        caption: "Rules we agree on",
      },
      {
        say: "Ask it for a bedtime story and it might just reply with more questions, because it learned to continue text, not to help. This raw version is called a pretrained, or base, model.",
        art: "🤷",
        caption: "It just keeps going",
      },
      {
        say: "Step one is supervised finetuning. People write thousands of example conversations with helpful, polite answers, and Tale trains on them a little more until it learns the shape of a good reply.",
        art: "✍️",
        caption: "Learning from examples",
      },
      {
        say: "Step two is learning from feedback. Tale writes two answers and people pick the better one; those choices train a scorer that Tale practices pleasing. That's reinforcement learning from human feedback.",
        art: "👍",
        caption: "Which answer is better?",
      },
      {
        say: "Finetuning only nudges what Tale already knows, so it's quick compared to the big training. Now Tale answers helpfully instead of rambling. Tale just got good manners!",
        art: "🎩",
        caption: "A helpful Tale",
      },
    ],
    predict: {
      q: "Tale learned from tons of internet text to continue whatever it reads. Why might that not make it a helpful assistant?",
      hint: "Think about what kinds of text come after a question on a random web page.",
    },
    check: [
      {
        q: "What happens in supervised finetuning?",
        options: ["Tale deletes its old weights", "Tale reads its answers aloud", "Tale trains on example conversations written by people"],
        answer: 2,
        why: "Supervised finetuning continues training on good example conversations so the model learns to reply helpfully.",
        hint: "Supervised means learning from worked examples.",
      },
      {
        q: "In learning from human feedback, what do people do?",
        options: ["Rewrite Tale's weights by hand", "Compare answers and choose the better one", "Type every answer for Tale forever"],
        answer: 1,
        why: "People's preferences between answers train a scorer, and Tale learns to produce answers that score higher.",
        hint: "Remember the two answers.",
      },
    ],
    explain: {
      prompt: "How do we turn a model that just continues text into a helpful assistant?",
      key: "First, supervised finetuning: keep training the pretrained model on example conversations with good answers. Then reinforcement learning from human feedback: people compare pairs of answers, a reward model learns their preferences, and the model is trained to produce answers that score higher.",
    },
    concepts: ["Pretrained model", "Supervised finetuning", "RLHF"],
  },
  {
    id: "talking-fast",
    unit: 4,
    title: "Talking Fast",
    sub: "Tale tells its first story",
    topic: "Inference (sampling, temperature, KV cache)",
    teacher: "jobs",
    mins: 7,
    scene: "stage",
    taleGets: "a storyteller's voice",
    beats: [
      {
        say: "Hi, I'm Jobs. I care about things that feel simple and fast to use. Tale is trained and polite, and now it has to talk to real people, live on stage, with no awkward pauses.",
        art: "🎤",
        caption: "It's showtime",
      },
      {
        say: "Tale talks one token at a time. It predicts probabilities for the next token, picks one, adds it to the story, and repeats. Running a trained model like this is called inference.",
        art: "➡️",
        caption: "One token at a time",
      },
      {
        say: "Always picking the top token makes stories repetitive, so Tale samples instead. A dial called temperature sets how adventurous it is: low is safe and predictable, high is surprising and wild. Try picking words yourself!",
        art: "🌡️",
        caption: "The temperature dial",
        widget: "nextword",
      },
      {
        say: "Now a speed trick. Each new token needs the keys and values of every earlier token for attention. Instead of recomputing them each time, Tale saves them in a KV cache and reuses them.",
        art: "🗄️",
        caption: "Remember, don't redo",
      },
      {
        say: "The lights dim, and Tale begins: 'Once upon a time, a little robot learned to dream.' Our Storyteller has spoken! Tale just got a storyteller's voice!",
        art: "📖",
        caption: "Tale's first story",
      },
    ],
    predict: {
      q: "If Tale always picked the single most likely next word, what might its stories sound like?",
      hint: "Imagine a friend who always says the most expected thing.",
    },
    check: [
      {
        q: "What does a low temperature do when Tale picks tokens?",
        options: ["Makes choices wilder", "Makes choices safer and more predictable", "Turns Tale off"],
        answer: 1,
        why: "Low temperature sharpens the probabilities toward the most likely tokens.",
        hint: "Think of a calm, careful storyteller.",
      },
      {
        q: "What does the KV cache save?",
        options: ["Keys and values from earlier tokens, so they aren't recomputed", "The finished story file", "The temperature setting"],
        answer: 0,
        why: "Earlier tokens' attention keys and values don't change, so storing them makes each new step much faster.",
        hint: "What does each new token need from the earlier ones?",
      },
    ],
    explain: {
      prompt: "Explain how Tale writes a story quickly, one token at a time.",
      key: "At each step the model outputs probabilities for the next token, samples one (temperature controls how random the choice is), appends it, and repeats. The KV cache stores the attention keys and values of earlier tokens, so each new step only computes the new token instead of redoing the whole sequence.",
    },
    concepts: ["Inference", "Sampling and temperature", "KV cache"],
  },

  // ───────────────────────── Unit 5: AI and us ─────────────────────────
  {
    id: "learning-by-reward",
    unit: 5,
    title: "Learning by Reward",
    sub: "Trial, error, treasure",
    topic: "Reinforcement learning",
    teacher: "pavlov",
    mins: 6,
    scene: "sea",
    taleGets: "a nose for what earns a reward",
    beats: [
      {
        say: "Zdravstvuyte, I'm Pavlov! I studied how dogs learned that a bell meant food was coming. Rewards are powerful teachers, and today Tale learns a game by trying things out.",
        art: "🔔",
        caption: "A bell means dinner",
      },
      {
        say: "But there's a difference. My dogs learned what a signal predicts. In reinforcement learning, the learner, called an agent, takes actions, and the world answers with rewards or penalties.",
        art: "🎮",
        caption: "Actions and rewards",
      },
      {
        say: "Picture Tale steering a little boat toward treasure islands. Nobody gives it directions. It tries moves, bumps into rocks, sometimes finds gold, and slowly learns which moves pay off.",
        art: "⛵",
        caption: "Trial and error at sea",
      },
      {
        say: "Tale faces a puzzle: keep using the route that worked, or explore a new one that might be better? Good learners balance both, which is called exploring versus exploiting.",
        art: "🧭",
        caption: "Explore or exploit?",
      },
      {
        say: "Rewards often come late, so Tale learns to value moves that lead to treasure later. This idea helped train game champions and helpful chatbots. Tale just got a nose for what earns a reward!",
        art: "🏆",
        caption: "Chasing the treasure",
      },
    ],
    predict: {
      q: "If Tale only ever repeats the first route that found a little treasure, what might it miss?",
      hint: "Could there be a bigger treasure somewhere it never tried?",
    },
    check: [
      {
        q: "In reinforcement learning, how does the agent learn?",
        options: ["By copying a list of correct answers", "By counting word pairs", "By trying actions and getting rewards or penalties"],
        answer: 2,
        why: "The agent learns by trial and error, keeping the actions that lead to more reward over time.",
        hint: "Think of the boat bumping into rocks.",
      },
      {
        q: "What is 'exploring' in reinforcement learning?",
        options: ["Trying new actions that might turn out better", "Repeating the best-known move", "Turning off the rewards"],
        answer: 0,
        why: "Exploring means testing new actions, while exploiting means using the best one you already know.",
        hint: "Explorers go somewhere new.",
      },
    ],
    explain: {
      prompt: "How does an agent learn with reinforcement learning?",
      key: "The agent takes actions in an environment and receives rewards or penalties. Through trial and error it learns a strategy (a policy) that earns the most total reward over time, including rewards that come later, while balancing exploring new actions with exploiting ones that already work.",
    },
    concepts: ["Agent and environment", "Rewards", "Exploration vs exploitation"],
  },
  {
    id: "eyes-and-ears",
    unit: 5,
    title: "Eyes and Ears",
    sub: "Seeing and hearing",
    topic: "Multimodal models",
    teacher: "tesla",
    mins: 6,
    scene: "space",
    taleGets: "eyes and ears",
    beats: [
      {
        say: "Greetings, I'm Tesla! I was fascinated by signals traveling invisibly through the air. Tale can read and write, but it can't yet see a sunset or hear a song.",
        art: "📡",
        caption: "Signals through the air",
      },
      {
        say: "Remember the trick that made words work? Turn everything into tokens. A picture can be chopped into small square patches, and each patch becomes an embedding, just like a word.",
        art: "🖼️",
        caption: "Pictures as patches",
      },
      {
        say: "Sound works too. Audio is chopped into tiny slices of time, and each slice becomes tokens. Now one transformer can pay attention across words, picture patches, and sounds together.",
        art: "🎵",
        caption: "Sounds as slices",
      },
      {
        say: "To connect them, models train on matched pairs, like photos with captions. A dog photo and the words 'a happy dog' learn to land near each other on the meaning map.",
        art: "🐕",
        caption: "Pictures meet words",
      },
      {
        say: "Models that mix kinds of input are called multimodal. Now Tale can describe your drawing or listen to your request. Tale just got eyes and ears!",
        art: "👀",
        caption: "Seeing and hearing",
      },
    ],
    predict: {
      q: "How could a model that only understands tokens learn to understand a photo?",
      hint: "What did we have to do to text before Tale could read it?",
    },
    check: [
      {
        q: "How can a transformer take in a picture?",
        options: ["By splitting it into patches that become embeddings", "By reading the photo's file name", "It never can"],
        answer: 0,
        why: "Image patches are turned into embeddings, so the transformer can treat them like tokens.",
        hint: "Remember the small squares.",
      },
      {
        q: "What does 'multimodal' mean?",
        options: ["A model with many teachers", "A model that runs on many phones", "A model that handles several kinds of input, like text, images, and sound"],
        answer: 2,
        why: "A mode is a kind of input, so multimodal means working with several kinds at once.",
        hint: "Think about eyes and ears.",
      },
    ],
    explain: {
      prompt: "How can one model understand both words and pictures?",
      key: "Each kind of input is turned into tokens or embeddings: text into word tokens, images into patches, audio into short time slices. Training on paired data, like images with captions, places matching meanings close together, so one transformer can attend across all of them.",
    },
    concepts: ["Multimodal models", "Image patches", "Shared embedding space"],
  },
  {
    id: "fair-and-safe",
    unit: 5,
    title: "Fair and Safe AI",
    sub: "A kind and honest heart",
    topic: "AI ethics (bias, honesty, safety)",
    teacher: "mlk",
    mins: 6,
    scene: "city",
    taleGets: "a kind and honest heart",
    beats: [
      {
        say: "Hello, friend, I'm Martin Luther King Jr. I worked my whole life for justice and equal treatment for all people. Now that Tale is powerful, let's make sure it treats everyone fairly.",
        art: "⚖️",
        caption: "Fair for everyone",
      },
      {
        say: "Tale learned from human writing, and human writing contains unfair ideas. If most stories show only boys as scientists, Tale may copy that. This is called bias, and builders must test for it and fix it.",
        art: "🔍",
        caption: "Bias in, bias out",
      },
      {
        say: "Tale predicts likely words, not checked facts, so it can say something false in a very confident voice. That's called a hallucination. An honest AI should say when it isn't sure.",
        art: "🤥",
        caption: "Confident but wrong",
      },
      {
        say: "Safety means more: protecting people's private information, refusing to help cause harm, and keeping humans in charge of big decisions. Good rules come from many voices, not just the builders.",
        art: "🛡️",
        caption: "Keeping people safe",
      },
      {
        say: "Your job is to question what AI tells you and check important facts, so Tale stays a helper, not a boss. Our Storyteller is complete. Tale just got a kind and honest heart!",
        art: "💛",
        caption: "A helper, not a boss",
      },
    ],
    predict: {
      q: "If Tale learned only from old books where doctors were always men, what might it assume? How could we fix that?",
      hint: "Tale copies the patterns in its examples, fair or not.",
    },
    check: [
      {
        q: "Where does bias in an AI usually come from?",
        options: ["The color of the computer", "Unfair patterns in the data it learned from", "Too much electricity"],
        answer: 1,
        why: "AI learns patterns from human-made data, including unfair ones, unless people check and correct for them.",
        hint: "Where did Tale learn everything it knows?",
      },
      {
        q: "What is an AI hallucination?",
        options: ["A confident-sounding answer that is false", "A dream the computer has while charging", "A picture the AI draws"],
        answer: 0,
        why: "Because it predicts likely words rather than checking facts, an AI can state false things confidently.",
        hint: "Tale predicts likely words, not checked facts.",
      },
    ],
    explain: {
      prompt: "Why can an AI be unfair or wrong, and what can people do about it?",
      key: "AI learns patterns from human-made data, so it can copy unfair biases; and because it predicts likely words rather than checking facts, it can hallucinate false answers confidently. People should test for and fix bias, have AI admit uncertainty, protect privacy, keep humans in charge of important decisions, and double-check what AI says.",
    },
    concepts: ["Bias", "Hallucination", "Responsible AI"],
  },
];
