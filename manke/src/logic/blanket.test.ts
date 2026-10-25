import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advise, baseStep, pickBlanket, type Blanket, type HorseProfile } from './blanket.ts';

const skab: Blanket[] = [
  { id: 'r0', kind: 'regn', grams: 0 },
  { id: 'r50', kind: 'regn', grams: 50 },
  { id: 'r150', kind: 'regn', grams: 150 },
  { id: 's200', kind: 'stald', grams: 200 },
  { id: 'r300', kind: 'regn', grams: 300, neck: true },
];

const bella: HorseProfile = { name: 'Bella', type: 'varmblod', age: 12, clip: 'helt', cold: 'normal', day: 'ude', night: 'inde' };
const smilla: HorseProfile = { name: 'Smilla', type: 'nordisk', age: 18, clip: 'uklippet', cold: 'normal', day: 'ude', night: 'ude' };
const kasper: HorseProfile = { name: 'Kasper', type: 'pony', age: 7, clip: 'uklippet', cold: 'sveder', day: 'ude', night: 'ude' };

const regnfuldDag = { minTemp: 6, minFeelsLike: 5, maxWind: 9, rainMm: 3 };
const koldNat = { minTemp: 2, minFeelsLike: -1, maxWind: 6, rainMm: 1 };

test('grundtabel for uklippet og klippet', () => {
  assert.equal(baseStep(12, 'uklippet'), 0);
  assert.equal(baseStep(3, 'uklippet'), 2);
  assert.equal(baseStep(-2, 'uklippet'), 3);
  assert.equal(baseStep(-8, 'uklippet'), 5);
  assert.equal(baseStep(16, 'helt'), 0);
  assert.equal(baseStep(12, 'helt'), 2);
  assert.equal(baseStep(7, 'helt'), 3);
  assert.equal(baseStep(2, 'helt'), 5);
  assert.equal(baseStep(-2, 'helt'), 6);
  assert.equal(baseStep(-8, 'helt'), 7);
  assert.equal(baseStep(7, 'delvist'), 2);
});

test('Bella om dagen: klippet og regn giver 150 g regndækken', () => {
  const a = advise(bella, regnfuldDag, 'ude', skab);
  assert.equal(a.step, 4);
  assert.equal(a.label, '150 g regndækken');
  assert.equal(a.blanket?.id, 'r150');
  assert.equal(a.missing, undefined);
  assert.deepEqual(a.reasons.map((r) => r.delta), ['grundlag', 1]);
});

test('Bella om natten inde: stalddækken 200 g, regn tæller ikke', () => {
  const a = advise(bella, koldNat, 'inde', skab);
  assert.equal(a.step, 5);
  assert.equal(a.label, '200 g stalddækken');
  assert.equal(a.kind, 'stald');
  assert.ok(!a.reasons.some((r) => r.title === 'Regn'));
});

test('Smilla om dagen: islænder med vinterpels får intet', () => {
  const a = advise(smilla, regnfuldDag, 'ude', skab);
  assert.equal(a.step, 0);
  assert.equal(a.label, 'Intet dækken');
  assert.equal(a.kind, null);
});

test('Kasper om natten: pony der sveder let får 50 g', () => {
  const a = advise(kasper, koldNat, 'ude', skab);
  assert.equal(a.step, 2);
  assert.equal(a.label, '50 g regndækken');
});

test('over 20 år giver et trin mere', () => {
  const gammel = { ...bella, age: 23 };
  assert.equal(advise(gammel, regnfuldDag, 'ude', skab).step, 5);
});

test('feedback flytter rådet, men højst to trin', () => {
  assert.equal(advise({ ...bella, offset: 1 }, regnfuldDag, 'ude').step, 5);
  assert.equal(advise({ ...bella, offset: -5 }, regnfuldDag, 'ude').step, 2);
});

test('mangler skabet den rigtige vægt, vælges det nærmeste med en note', () => {
  const p = pickBlanket(skab, 'regn', 100, false);
  assert.equal(p.blanket?.grams, 150);
  assert.match(p.missing ?? '', /100 g/);
});

test('ingen stalddækken: et regndækken bruges inde', () => {
  const kunRegn = skab.filter((b) => b.kind === 'regn');
  const a = advise(bella, koldNat, 'inde', kunRegn);
  assert.equal(a.kind, 'regn');
});

test('stærk frost på klippet hest giver 300 g med hals', () => {
  const a = advise(bella, { minTemp: -6, minFeelsLike: -10, maxWind: 8, rainMm: 0 }, 'ude', skab);
  assert.equal(a.step, 7);
  assert.equal(a.label, '300 g regndækken med hals');
});

test('uden skab gives rådet stadig', () => {
  const a = advise(bella, regnfuldDag, 'ude');
  assert.equal(a.label, '150 g regndækken');
  assert.equal(a.blanket, undefined);
});
