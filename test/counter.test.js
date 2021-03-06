const { Counter } = require('../src');

const counter = new Counter({
  name: 'counter_name',
  help: 'counter help',
  labels: ['labelA', 'labelB'],
});

test('init', () => {
  expect(counter.get()).toBe(undefined);
  expect(counter.get({ labelA: 'A' })).toBe(undefined);
});

test('inc', () => {
  counter.inc();
  counter.dec({ labelA: 'A' });

  expect(counter.get()).toBe(1);
  expect(counter.get({ labelA: 'A' })).toBe(-1);
});

test('add', () => {
  counter.add(1);
  counter.add(-1, { labelA: 'A' });

  expect(counter.get()).toBe(2);
  expect(counter.get({ labelA: 'A' })).toBe(-2);
});

afterEach(() => {
  console.log(`${counter}`);
});
