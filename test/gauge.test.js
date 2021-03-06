const { Gauge } = require('../src');

const gauge = new Gauge({
  name: 'gauge_name',
  help: 'gauge help',
  labels: ['labelA', 'labelB'],
});

test('init', () => {
  expect(gauge.get()).toBe(undefined);
  expect(gauge.get({ labelA: 'A' })).toBe(undefined);
});

test('set', () => {
  gauge.set(2);
  gauge.set(4, { labelA: 'A' });

  expect(gauge.get()).toBe(2);
  expect(gauge.get({ labelA: 'A' })).toBe(4);
});

test('clear', () => {
  gauge.clear();

  expect(gauge.get()).toBe(undefined);
  expect(gauge.get({ labelA: 'A' })).toBe(undefined);
});

afterEach(() => {
  console.log(`${gauge}`);
});
