
function getWordHint(word, revealedCount, existingRevealedIndices = []) {
	const letters = word.split('');
	const revealIndices = new Set(existingRevealedIndices);

	// Always reveal spaces (and hyphens/special chars if we wanted, but sticking to spaces for now)
	letters.forEach((char, i) => {
		if (char === ' ') revealIndices.add(i);
	});

	// Get potential indices to reveal (not spaces, not already revealed)
	let availableIndices = letters
		.map((c, i) => (c !== ' ' && !revealIndices.has(i) ? i : -1))
		.filter((i) => i !== -1);

	// Calculate how many new letters to reveal
	const currentlyRevealed = existingRevealedIndices.length;
	// Ensure we don't reveal more than available (though availableIndices check handles this loop)
	let newToReveal = revealedCount - currentlyRevealed;

	// Helper to calculate minimum distance from candidate to any revealed index
	const getMinDistance = (candidateIdx, currentRevealedSet) => {
		// If nothing revealed yet, distance is infinity (or effectively max)
		// We treat the "edges" as revealed points -1 and letters.length to push initialization to center?
		// Actually, standard practice for "scattered" is just max min distance to existing.
		// If set is empty, we can return a default high value.
		if (currentRevealedSet.size === 0) return 100;

		let minSrc = Infinity;
		for (const idx of currentRevealedSet) {
			const dist = Math.abs(candidateIdx - idx);
			if (dist < minSrc) minSrc = dist;
		}
		return minSrc;
	};

	// Iteratively pick the best next candidate
	for (let i = 0; i < newToReveal && availableIndices.length > 0; i++) {
		// Calculate score (min distance) for each available index
		const candidatesWithScores = availableIndices.map((idx) => {
			// We only care about distance to *revealed non-space letters* ideally,
			// or maybe spaces count as spacers? Let's say spaces count as revealed for spacing purposes
			// to avoid clustering next to a space. Yes, revealIndices includes spaces.
			return { idx, score: getMinDistance(idx, revealIndices) };
		});

		// Find max score
		let maxScore = -1;
		candidatesWithScores.forEach((c) => {
			if (c.score > maxScore) maxScore = c.score;
		});

		// Filter best candidates (ties are possible)
		const bestCandidates = candidatesWithScores.filter(
			(c) => c.score === maxScore,
		);

		// Pick one random best candidate
		const winner =
			bestCandidates[Math.floor(Math.random() * bestCandidates.length)];

		// Add to revealed
		revealIndices.add(winner.idx);
        console.log(`Revealing index ${winner.idx} with score ${maxScore}`);

		// Remove from available
		availableIndices = availableIndices.filter((idx) => idx !== winner.idx);
	}

	// Get the array of revealed letter indices (excluding spaces)
	const revealedLetterIndices = [...revealIndices].filter(
		(i) => letters[i] !== ' ',
	);

	const hint = letters
		.map((char, i) => (revealIndices.has(i) ? char : '_'))
		.join(' ');

	return { hint, revealedIndices: revealedLetterIndices };
}

console.log("--- Test 1: 'salt', reveal 'a' (idx 1), then reveal one more ---");
// Expectation: 't' (idx 3) is distance 2 from 'a'. 'l' (idx 2) is distance 1 from 'a'. 's' (idx 0) is distance 1 from 'a'.
// Winner should be 't'.
const res1 = getWordHint("salt", 2, [1]);
console.log(`Hint: ${res1.hint}`); 

console.log("\n--- Test 2: 'banana', reveal nothing, reveal 2 chars total ---");
// Word: b a n a n a (6 chars)
// First pick: random (max score 100). Say 'n' at 2.
// Second pick: furthest from 2. 'a' at 5 (dist 3) or 'b' at 0 (dist 2). Ideally edges or far away.
const res2 = getWordHint("banana", 2, []);
console.log(`Hint: ${res2.hint}`);

console.log("\n--- Test 3: 'supercalifragilistic', reveal 5 chars ---");
const res3 = getWordHint("supercalifragilistic", 5, []);
console.log(`Hint: ${res3.hint}`);
