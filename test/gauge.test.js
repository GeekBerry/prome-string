const { Gauge } = require('../index');

const gauge = new Gauge({
  name: 'Gauge Name',
  help: 'Gauge Help',
  labels: ['labelA', 'labelB'],
});

test('init', () => {
  expect(gauge.table[gauge.labelToKey()]).toBe(undefined);
  expect(gauge.table[gauge.labelToKey({ labelA: 'A' })]).toBe(undefined);
});

test('add', () => {
  gauge.add(2);
  gauge.add(4, { labelA: 'A' });

  expect(gauge.table[gauge.labelToKey()]).toBe(2);
  expect(gauge.table[gauge.labelToKey({ labelA: 'A' })]).toBe(4);
});

test('add again', () => {
  gauge.add(6);
  gauge.add(6, { labelA: 'A' });
  gauge.add(10, { labelA: 'A', labelB: 'B' });

  expect(gauge.table[gauge.labelToKey()]).toBe(8);
  expect(gauge.table[gauge.labelToKey({ labelA: 'A' })]).toBe(10);
  expect(gauge.table[gauge.labelToKey({ labelA: 'B' })]).toBe(undefined);
  expect(gauge.table[gauge.labelToKey({ labelA: 'A', labelB: 'B' })]).toBe(10);
});

test('set', () => {
  gauge.set(100, { labelB: 'B' });

  expect(gauge.table[gauge.labelToKey({ labelB: 'B' })]).toBe(100);
});

afterEach(() => {
  console.log(`${gauge}`);
});
