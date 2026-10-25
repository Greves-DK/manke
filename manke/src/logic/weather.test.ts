import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextDate, rainSpan, samplePoints, splitDayNight, stripHours, summarize } from './weather.ts';

const today = '2026-10-25';

test('næste dag virker over månedsskift og nytår', () => {
  assert.equal(nextDate('2026-10-31'), '2026-11-01');
  assert.equal(nextDate('2026-12-31'), '2027-01-01');
});

test('dag er 07–16 og nat er 16–07', () => {
  const { day, night } = splitDayNight(samplePoints(today), today);
  assert.equal(day.length, 9);
  assert.equal(day[0].time, '2026-10-25T07:00');
  assert.equal(night.length, 15);
  assert.equal(night[0].time, '2026-10-25T16:00');
  assert.equal(night[night.length - 1].time, '2026-10-26T06:00');
});

test('opsummering finder laveste temperatur, vind og regn', () => {
  const { night } = splitDayNight(samplePoints(today), today);
  const s = summarize(night);
  assert.equal(s.minTemp, 2);
  assert.equal(s.maxWind, 9);
  assert.ok(s.rainMm > 0);
});

test('regnperiode og timeoversigt', () => {
  const pts = samplePoints(today);
  assert.equal(rainSpan(pts), '14–22');
  assert.equal(rainSpan(pts.map((p) => ({ ...p, rain: 0 }))), null);
  assert.deepEqual(stripHours(pts, today).map((p) => p.time.slice(11, 13)), ['07', '10', '13', '16', '19', '22', '01', '04']);
});
