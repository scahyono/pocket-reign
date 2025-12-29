const assert = require('node:assert');
const test = require('node:test');

const {
    FACTIONS,
    SLEEP_FACTION,
    buildFactionPool,
    buildRandomFactionPool,
    isSleepWindow,
    pickRandomFaction,
    createSequenceRng
} = require('../script.js');

test('sleep faction is always included in the pool', () => {
    const pool = buildFactionPool(FACTIONS, SLEEP_FACTION);
    assert.ok(pool.includes(SLEEP_FACTION), 'Sleep faction should be present');
    assert.strictEqual(pool.length, FACTIONS.length + 1, 'Pool size should include sleep faction');
});

test('sleep faction is only added to random pool at night with a successful roll', () => {
    const date = new Date(2023, 0, 1, 22, 15);
    const rng = () => 0.2;
    const pool = buildRandomFactionPool({ baseFactions: FACTIONS, sleepFaction: SLEEP_FACTION, date, rng });

    assert.deepStrictEqual(pool, [SLEEP_FACTION], 'Successful roll during sleep window should return only the sleep faction');
});

test('sleep faction stays out of the random pool when chance fails', () => {
    const date = new Date(2023, 0, 1, 23, 0);
    const rng = () => 0.9;
    const pool = buildRandomFactionPool({ baseFactions: FACTIONS, sleepFaction: SLEEP_FACTION, date, rng });

    assert.ok(!pool.includes(SLEEP_FACTION), 'Sleep faction should be excluded when roll fails');
    assert.strictEqual(pool.length, FACTIONS.length, 'Failed roll should leave only the base factions');
});

test('sleep faction has a 50% chance during sleep window with deterministic RNG', () => {
    const date = new Date(2023, 0, 1, 23, 0);
    const rng = createSequenceRng([0.1, 0.6, 0.2, 0.7, 0.3, 0.8]);

    let includedCount = 0;
    for (let i = 0; i < 6; i++) {
        const pool = buildRandomFactionPool({ baseFactions: FACTIONS, sleepFaction: SLEEP_FACTION, date, rng });
        if (pool.includes(SLEEP_FACTION)) includedCount += 1;
    }

    assert.strictEqual(includedCount, 3, 'Sleep faction should appear exactly when RNG falls below 0.5');
});

test('sleep faction is not included outside the nighttime window', () => {
    const date = new Date(2023, 0, 1, 12, 0);
    const rng = () => 0.1;
    const pool = buildRandomFactionPool({ baseFactions: FACTIONS, sleepFaction: SLEEP_FACTION, date, rng });

    assert.ok(!pool.includes(SLEEP_FACTION), 'Sleep faction should be excluded outside the nighttime window');
    assert.strictEqual(pool.length, FACTIONS.length, 'Daytime should only surface base factions');
});

test('sleep faction can still roll at 5:50am with a winning chance', () => {
    const date = new Date(2023, 0, 1, 5, 50);
    const rng = () => 0.3;

    const pool = buildRandomFactionPool({ baseFactions: FACTIONS, sleepFaction: SLEEP_FACTION, date, rng });

    assert.deepStrictEqual(pool, [SLEEP_FACTION], 'Early morning sleep window should still allow the sleep faction to roll');
});

test('isSleepWindow flags 10pm-6am as night', () => {
    const inWindow = [
        new Date(2023, 0, 1, 22, 0, 0),
        new Date(2023, 0, 1, 23, 59, 59),
        new Date(2023, 0, 1, 5, 59, 59)
    ];

    const outWindow = [
        new Date(2023, 0, 1, 6, 0, 0),
        new Date(2023, 0, 1, 21, 59, 59)
    ];

    inWindow.forEach(date => assert.ok(isSleepWindow(date), `${date.toISOString()} should be within the sleep window`));
    outWindow.forEach(date => assert.ok(!isSleepWindow(date), `${date.toISOString()} should be outside the sleep window`));
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
