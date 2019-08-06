const Metric = require('./metric');
const Gauge = require('./gauge');
const Counter = require('./counter');

class Histogram extends Metric {
  constructor({
    name,
    labels = [],
    buckets = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000],
    ...options
  } = {}) {
    super({ ...options, name, labels, type: 'histogram' });
    this.bucketValues = buckets;
    this.bucket = new Gauge({
      name: `${name}_bucket`,
      labels: [...labels, 'le'],
    });
    this.sum = new Gauge({ name: `${name}_sum`, labels });
    this.count = new Counter({ name: `${name}_count`, labels });
  }

  observe(value, label = {}) {
    value = this.constructor.checkValue(value);

    for (const bound of this.bucketValues) {
      if (value < bound) {
        this.bucket.add(1, { ...label, le: bound });
      } else {
        this.bucket.add(0, { ...label, le: bound });
      }
    }
    this.bucket.add(1, { ...label, le: '+Inf' });
    this.sum.add(value, label);
    this.count.inc(label);
  }

  toString({ head = true } = {}) {
    const array = head ? [this.HEAD] : [];
    return array.concat(
      this.bucket.toString({ head: false }),
      this.sum.toString({ head: false }),
      this.count.toString({ head: false }),
    ).join('\n');
  }
}

module.exports = Histogram;
