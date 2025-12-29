const assert = require('node:assert');
const test = require('node:test');

const {
    FACTIONS,
    SLEEP_FACTION,
    buildFactionPool,
    pickRandomFaction
} = require('../script.js');

test('sleep faction is always included in the pool', () => {
    const pool = buildFactionPool(FACTIONS, SLEEP_FACTION);
    assert.ok(pool.includes(SLEEP_FACTION), 'Sleep faction should be present');
    assert.strictEqual(pool.length, FACTIONS.length + 1, 'Pool size should include sleep faction');
});

test('random faction selection respects injected RNG', () => {
    const pool = buildFactionPool(FACTIONS, SLEEP_FACTION);
    const rng = () => 0.5; // deterministic
    const picked = pickRandomFaction(pool, rng);
    const expectedIndex = Math.floor(0.5 * pool.length);
    assert.strictEqual(picked, pool[expectedIndex]);
});

test('pickRandomFaction returns null for empty input', () => {
    const picked = pickRandomFaction([], () => 0.1);
    assert.strictEqual(picked, null);
});
