const { Summary } = require('../src');

const summary = new Summary({
  name: 'summary_name',
  help: 'summary help',
  labels: ['label'],
  queueLength: 3,
});

test('init', () => {
  expect(summary._percentiles).toEqual([0.01, 0.1, 0.5, 0.9, 0.99]);
  expect(summary._queueLength).toEqual(3);
});

test('set()', () => {
  summary.set(1); // pop
  summary.set(2); // pop
  summary.set(3); // pop
  summary.set(4); // pop
  summary.set(5);
  summary.set(6);
  summary.set(7);

  expect(`${summary}`).toEqual([
    '# HELP summary_name summary help\n',
    '# TYPE summary_name summary\n',
    'summary_name{quantile="0.01"} 5\n',
    'summary_name{quantile="0.1"} 5\n',
    'summary_name{quantile="0.5"} 6\n',
    'summary_name{quantile="0.9"} 7\n',
    'summary_name{quantile="0.99"} 7\n',
    'summary_name_sum 18\n',
    'summary_name_count 3\n',
  ].join(''));
});

test('clear', () => {
  summary.clear();
});

test('set({})', () => {
  summary.set(10, { label: 'post' });
  summary.set(20, { label: 'post' });
  summary.set(30, { label: 'post' });
  summary.set(40, { label: 'post' });

  expect(`${summary}`).toEqual([
    '# HELP summary_name summary help\n',
    '# TYPE summary_name summary\n',
    'summary_name{quantile="0.01",label="post"} 20\n',
    'summary_name{quantile="0.1",label="post"} 20\n',
    'summary_name{quantile="0.5",label="post"} 30\n',
    'summary_name{quantile="0.9",label="post"} 40\n',
    'summary_name{quantile="0.99",label="post"} 40\n',
    'summary_name_sum{label="post"} 90\n',
    'summary_name_count{label="post"} 3\n',
  ].join(''));
});

afterEach(() => {
  console.log(`${summary}`);
});
