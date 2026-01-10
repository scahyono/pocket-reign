const assert = require('node:assert');
const test = require('node:test');

const { computeEffectiveLastGameAt, shouldDeferProtectionCheck } = require('../script.js');

const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

test('assumes abstinence is satisfied after noon when last play is unknown', () => {
    const now = new Date(2024, 0, 2, 13, 0).getTime();
    const effective = computeEffectiveLastGameAt(null, now);

    assert.strictEqual(effective, now - THREE_HOURS_MS);
});

test('assumes abstinence is satisfied after noon when last play was yesterday', () => {
    const now = new Date(2024, 0, 3, 12, 30).getTime();
    const yesterdaySession = new Date(2024, 0, 2, 22, 0).getTime();

    const effective = computeEffectiveLastGameAt(yesterdaySession, now);

    assert.strictEqual(effective, now - THREE_HOURS_MS);
});

test('uses same-day session times without adjustment', () => {
    const now = new Date(2024, 0, 2, 13, 0).getTime();
    const morningSession = new Date(2024, 0, 2, 10, 15).getTime();

    const effective = computeEffectiveLastGameAt(morningSession, now);

    assert.strictEqual(effective, morningSession);
});

test('before noon with no session returns original value', () => {
    const now = new Date(2024, 0, 2, 11, 0).getTime();

    const effective = computeEffectiveLastGameAt(null, now);

    assert.strictEqual(effective, null);
});

test('defers protection checks when welcome has not shown today', () => {
    assert.strictEqual(shouldDeferProtectionCheck(null, 'Wed Jan 03 2024'), true);
    assert.strictEqual(shouldDeferProtectionCheck('Tue Jan 02 2024', 'Wed Jan 03 2024'), true);
});

test('does not defer protection checks when welcome already shown today', () => {
    assert.strictEqual(shouldDeferProtectionCheck('Wed Jan 03 2024', 'Wed Jan 03 2024'), false);
});
