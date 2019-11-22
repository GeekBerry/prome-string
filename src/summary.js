const { TDigest } = require('tdigest');
const Metric = require('./metric');
const Counter = require('./counter');

class Queue {
  constructor(length) {
    this._array = Array(length);
    this._head = -1;
    this._tail = -1;
  }

  get length() {
    return this._head - this._tail;
  }

  push(value) {
    this._head += 1;
    if (this.length > this._array.length) {
      this._tail += 1;
      if (this._tail >= this._array.length) {
        this._tail -= this._array.length;
        this._head -= this._array.length;
      }
      delete this._array[this._tail]; // free reference
    }

    this._array[this._head % this._array.length] = { timestamp: Date.now(), value };
  }

  percentile(percentiles, timeout = Infinity) {
    const td = new TDigest();

    for (let i = this._head; i > this._tail; i -= 1) {
      const { timestamp, value } = this._array[i % this._array.length];
      if (Date.now() - timestamp < timeout) {
        td.push(value);
      }
    }

    return td.percentile(percentiles);
  }
}

class Summary extends Metric {
  constructor({
    name,
    labels,
    percentiles = [0.01, 0.1, 0.5, 0.9, 0.99],
    queueLength = 1000,
    timeout = Infinity,
    ...options
  }) {
    super({ ...options, name, labels, type: 'summary' });

    this.sum = new Counter({ name: `${name}_sum`, labels });
    this.count = new Counter({ name: `${name}_count`, labels });

    this._timeout = timeout;
    this._percentiles = percentiles;
    this._queueLength = queueLength;
    this.table = {}; // {labelKey: Queue}
  }

  set(value, label = {}) {
    value = this.constructor.checkValue(value);
    const key = this._labelToKey(label);

    if (!(key in this.table)) {
      this.table[key] = new Queue(this._queueLength);
    }

    this.table[key].push(value);
    this.sum.add(value, label);
    this.count.inc(label);
  }

  percentile(percentile, label = {}, timeout = this._timeout) {
    const key = this._labelToKey(label);
    const queue = this.table[key];
    if (queue) {
      return queue.percentile(percentile, timeout);
    }
    return undefined;
  }

  clear() {
    this.table = {};
    this.sum.clear();
    this.count.clear();
  }

  toString({ head = true } = {}) {
    const lines = [];
    for (const [key, queue] of Object.entries(this.table)) {
      const values = queue.percentile(this._percentiles, this._timeout);

      for (const [i, quantile] of Object.entries(this._percentiles)) {
        const value = values[i];
        if (value !== undefined) {
          const label = key ? `{quantile=${quantile},${key}}` : `{quantile=${quantile}}`;
          lines.push(`${this.name}${label} ${value}\n`);
        }
      }
    }

    return [
      super.toString({ head }),
      ...lines,
      this.sum.toString({ head: false }),
      this.count.toString({ head: false }),
    ].join('');
  }
}

module.exports = Summary;
