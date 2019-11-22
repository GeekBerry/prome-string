const Metric = require('./metric');
const Counter = require('./counter');

class Histogram extends Metric {
  constructor({
    name,
    labels = [],
    buckets = [0.0001, 0.001, 0.01, 0.1, 1, 10, 100, 1000, 10000],
    ...options
  } = {}) {
    super({ ...options, name, labels, type: 'histogram' });
    this._buckets = buckets;
    this.bucket = new Counter({
      name: `${name}_bucket`,
      labels: [...labels, 'le'],
    });
    this.sum = new Counter({ name: `${name}_sum`, labels });
    this.count = new Counter({ name: `${name}_count`, labels });
  }

  set(value, label = {}) {
    value = this.constructor.checkValue(value);

    for (const bound of this._buckets) {
      this.bucket.add(Number(value < bound), { ...label, le: bound });
    }
    this.bucket.inc({ ...label, le: Metric.INF });
    this.sum.add(value, label);
    this.count.inc(label);
  }

  clear() {
    this.bucket.clear();
    this.sum.clear();
    this.count.clear();
  }

  toString({ head = true } = {}) {
    return [
      super.toString({ head }),
      this.bucket.toString({ head: false }),
      this.sum.toString({ head: false }),
      this.count.toString({ head: false }),
    ].join('');
  }
}

module.exports = Histogram;
