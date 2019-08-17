const { Histogram } = require('../index');

const histogram = new Histogram({
  name: 'Histogram Name',
  help: 'Histogram Help',
  labels: ['labelA', 'labelB'],
  buckets: [1, 10, 100, 1000],
});

test('init', () => {
  expect(histogram.bucket.get({ le: 1 })).toBe(undefined);
  expect(histogram.bucket.get({ le: 10 })).toBe(undefined);
  expect(histogram.bucket.get({ le: 100 })).toBe(undefined);
  expect(histogram.bucket.get({ le: 1000 })).toBe(undefined);
  expect(histogram.bucket.get({ le: Histogram.INF })).toBe(undefined);
  expect(histogram.count.get()).toBe(undefined);
  expect(histogram.sum.get()).toBe(undefined);
});

test('observe(5)', () => {
  histogram.observe(5);

  expect(histogram.bucket.get({ le: 1 })).toBe(0);
  expect(histogram.bucket.get({ le: 10 })).toBe(1);
  expect(histogram.bucket.get({ le: 100 })).toBe(1);
  expect(histogram.bucket.get({ le: 1000 })).toBe(1);
  expect(histogram.bucket.get({ le: Histogram.INF })).toBe(1);
  expect(histogram.count.get()).toBe(1);
  expect(histogram.sum.get()).toBe(5);
});

test('observe(500)', () => {
  histogram.observe(500);

  expect(histogram.bucket.get({ le: 1 })).toBe(0);
  expect(histogram.bucket.get({ le: 10 })).toBe(1);
  expect(histogram.bucket.get({ le: 100 })).toBe(1);
  expect(histogram.bucket.get({ le: 1000 })).toBe(2);
  expect(histogram.bucket.get({ le: Histogram.INF })).toBe(2);
  expect(histogram.count.get()).toBe(2);
  expect(histogram.sum.get()).toBe(505);
});

test('clear', () => {
  histogram.clear();

  expect(histogram.bucket.get({ le: 1 })).toBe(undefined);
  expect(histogram.bucket.get({ le: 10 })).toBe(undefined);
  expect(histogram.bucket.get({ le: 100 })).toBe(undefined);
  expect(histogram.bucket.get({ le: 1000 })).toBe(undefined);
  expect(histogram.bucket.get({ le: Histogram.INF })).toBe(undefined);
  expect(histogram.count.get()).toBe(undefined);
  expect(histogram.sum.get()).toBe(undefined);
});

afterEach(() => {
  console.log(`${histogram}`);
});
