const { Counter } = require('../index');

const counter = new Counter({
  name: 'Counter Name',
  help: 'Counter Help',
  labels: ['labelA', 'labelB'],
});

test('init', () => {
  expect(counter.table[counter.labelToKey()]).toBe(undefined);
  expect(counter.table[counter.labelToKey({ labelA: 'A' })]).toBe(undefined);

});

test('inc', () => {
  counter.inc();
  counter.inc({ labelA: 'A' });

  expect(counter.table[counter.labelToKey()]).toBe(1);
  expect(counter.table[counter.labelToKey({ labelA: 'A' })]).toBe(1);
});

afterEach(() => {
  console.log(`${counter}`);
});
