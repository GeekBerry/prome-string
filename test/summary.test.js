const { Summary } = require('../src');

const summary = new Summary({
  name: 'Summary Name',
  help: 'Summary Help',
  labels: ['label'],
  queueLength: 3,
});

test('init', () => {
  expect(summary._percentiles).toEqual([0.01, 0.1, 0.5, 0.9, 0.99]);
  expect(summary._queueLength).toEqual(3);

  expect(summary.count.get()).toEqual(undefined);
  expect(summary.sum.get()).toEqual(undefined);
});

test('set()', () => {
  summary.set(1); // pop
  summary.set(2); // pop
  summary.set(3); // pop
  summary.set(4); // pop
  summary.set(5);
  summary.set(6);
  summary.set(7);

  expect(summary.percentile(0.5)).toBe(6);
  expect(summary.count.get()).toEqual(7);
  expect(summary.sum.get()).toEqual(28);
});

test('set({})', () => {
  summary.set(10, { label: 'post' });
  summary.set(20, { label: 'post' });
  summary.set(30, { label: 'post' });
  summary.set(40, { label: 'post' });

  expect(summary.percentile(0.5, { label: 'post' })).toBe(30);
  expect(summary.count.get({ label: 'post' })).toEqual(4);
  expect(summary.sum.get({ label: 'post' })).toEqual(100);
});

test('clear', () => {
  summary.clear();

  expect(summary.percentile(0.5)).toBe(undefined);
  expect(summary.count.get()).toEqual(undefined);
  expect(summary.sum.get()).toEqual(undefined);
});

afterEach(() => {
  console.log(`${summary}`);
});
