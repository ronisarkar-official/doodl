
function getWordHint(word, revealedCount, existingRevealedIndices = []) {
	const letters = word.split('');
	const revealIndices = new Set(existingRevealedIndices);

	// Always reveal spaces
	letters.forEach((char, i) => {
		if (char === ' ') revealIndices.add(i);
	});

	// Get indices that are not spaces and not already revealed
	const availableIndices = letters
		.map((c, i) => (c !== ' ' && !revealIndices.has(i) ? i : -1))
		.filter((i) => i !== -1);

	// Calculate how many new letters to reveal
	const currentlyRevealed = existingRevealedIndices.length;
	const newToReveal = revealedCount - currentlyRevealed;

	console.log(`Available indices: ${availableIndices}, Need to reveal: ${newToReveal}`);

	// Reveal additional random letters
	for (let i = 0; i < newToReveal && availableIndices.length > 0; i++) {
		const randomIdx = Math.floor(Math.random() * availableIndices.length);
		const pickedIndex = availableIndices[randomIdx];
		revealIndices.add(pickedIndex);
		availableIndices.splice(randomIdx, 1);
		console.log(`Picked index: ${pickedIndex} (Random slot: ${randomIdx})`);
	}

	// Get the array of revealed letter indices (excluding spaces)
	const revealedLetterIndices = [...revealIndices].filter(i => letters[i] !== ' ');

	const hint = letters
		.map((char, i) => (revealIndices.has(i) ? char : '_'))
		.join(' ');

	return { hint, revealedIndices: revealedLetterIndices };
}

// Test Case
const word = "salt";
let revealedIndices = [1]; // 'a' is revealed. Index 1.
const revealedCount = 2; // Want to reveal 1 more (total 2).

console.log("Initial state: _ a _ _");
const result = getWordHint(word, revealedCount, revealedIndices);
console.log("Result:", result.hint);

// Run multiple times to see distribution
console.log("\nDistribution Test (100 runs):");
const distribution = {};
for(let i=0; i<100; i++) {
    const res = getWordHint(word, revealedCount, [1]);
    const hint = res.hint;
    distribution[hint] = (distribution[hint] || 0) + 1;
}
console.log(distribution);
