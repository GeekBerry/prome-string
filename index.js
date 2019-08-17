const lodash = require('lodash');

class Metric {
  static checkValue(value) {
    if (typeof value !== 'number') {
      throw new TypeError(`Value is not a valid number: ${value}`);
    }
    return value;
  }

  constructor({ type, name, help, labels = [] }) {
    this.table = {}; // {labelKey: value}
    this.name = name;
    this.HEAD = `# HELP ${name} ${help}\n# TYPE ${name} ${type}`;

    this.labelSet = new Set(
      labels.map((n) => {
        if (typeof n !== 'string') {
          throw new Error(`label name "${n}" not a string`);
        }
        return n;
      }),
    );
  }

  labelToKey(label = {}) {
    Object.keys(label).forEach((n) => {
      if (!this.labelSet.has(n)) {
        throw new Error(`label name "${n}" not in labels ${this.labelSet}`);
      }
    });

    return Object.keys(label).sort().map(k => `${k}="${label[k]}"`).join(',');
  }

  clear() {
    this.table = {};
  }

  toString({ head = true } = {}) {
    const array = head ? [this.HEAD] : [];
    return array.concat(
      lodash.map(this.table, (v, k) => (k ? `${this.name}{${k}} ${v}` : `${this.name} ${v}`)),
    ).join('\n');
  }
}

class Counter extends Metric {
  constructor(options) {
    super({ ...options, type: 'counter' });
  }

  set(value, label) {
    value = this.constructor.checkValue(value);
    const key = this.labelToKey(label);
    this.table[key] = value;
  }

  inc(label) {
    const key = this.labelToKey(label);
    this.table[key] = (this.table[key] || 0.0) + 1.0;
  }
}

class Gauge extends Counter {
  constructor(options) {
    super({ ...options, type: 'gauge' });
  }

  add(value, label) {
    value = this.constructor.checkValue(value);
    const key = this.labelToKey(label);
    this.table[key] = (this.table[key] || 0.0) + value;
  }
}

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

module.exports = {
  Metric,
  Counter,
  Gauge,
  Histogram,
};
