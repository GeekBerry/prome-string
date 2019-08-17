const lodash = require('lodash');

class Metric {
  static get INF() {
    return '+Inf';
  }

  static checkValue(value) {
    if (typeof value !== 'number') {
      throw new TypeError(`Value is not a valid number: ${value}`);
    }
    return value;
  }

  constructor({ type, name, help, labels = [] }) {
    this.name = name;
    this.HEAD = `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n`;

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

  toString({ head = true } = {}) {
    return head ? this.HEAD : '';
  }
}

class Gauge extends Metric {
  constructor({ name, help, labels = [] }) {
    super({ type: 'gauge', name, help, labels });
    this.table = {}; // {labelKey: value}
  }

  set(value, label) {
    value = this.constructor.checkValue(value);
    const key = this.labelToKey(label);
    this.table[key] = value;
  }

  get(label = {}) {
    const key = this.labelToKey(label);
    return this.table[key];
  }

  clear() {
    this.table = {};
  }

  toString({ head = true } = {}) {
    return [super.toString({ head })].concat(
      lodash.map(this.table, (v, k) => (k ? `${this.name}{${k}} ${v}\n` : `${this.name} ${v}\n`)),
    ).join('');
  }
}

class Counter extends Gauge {
  constructor(options) {
    super({ ...options, type: 'counter' });
  }

  add(value, label) {
    value = this.constructor.checkValue(value);
    const key = this.labelToKey(label);
    this.table[key] = (this.table[key] || 0.0) + value;
  }

  inc(label) {
    return this.add(1, label);
  }

  dec(label) {
    return this.add(-1, label);
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
    this.bucket = new Counter({
      name: `${name}_bucket`,
      labels: [...labels, 'le'],
    });
    this.sum = new Counter({ name: `${name}_sum`, labels });
    this.count = new Counter({ name: `${name}_count`, labels });
  }

  observe(value, label = {}) {
    value = this.constructor.checkValue(value);

    for (const bound of this.bucketValues) {
      this.bucket.add(Number(value < bound), { ...label, le: bound });
    }
    this.bucket.inc({ ...label, le: Metric.INF });
    this.sum.add(value, label);
    this.count.inc(label);
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

module.exports = {
  Metric,
  Counter,
  Gauge,
  Histogram,
};
