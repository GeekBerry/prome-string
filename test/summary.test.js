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

test('observe()', () => {
  summary.observe(1); // pop
  summary.observe(2); // pop
  summary.observe(3); // pop
  summary.observe(4); // pop
  summary.observe(5);
  summary.observe(6);
  summary.observe(7);

  expect(summary.percentile(0.5)).toBe(6);
  expect(summary.count.get()).toEqual(7);
  expect(summary.sum.get()).toEqual(28);
});

test('observe({})', () => {
  summary.observe(10, { label: 'post' });
  summary.observe(20, { label: 'post' });
  summary.observe(30, { label: 'post' });
  summary.observe(40, { label: 'post' });

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
