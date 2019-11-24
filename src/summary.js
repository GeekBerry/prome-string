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
    let sum = 0;
    let count = 0;

    for (let i = this._head; i > this._tail; i -= 1) {
      const { timestamp, value } = this._array[i % this._array.length];
      if (Date.now() - timestamp < timeout) {
        td.push(value);
        sum += value;
        count += 1;
      }
    }

    const object = {};
    for (const value of percentiles) {
      object[value] = td.percentile(value);
    }
    return { object, sum, count };
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
  }

  clear() {
    this.table = {};
  }

  toString({ head = true } = {}) {
    const lines = [];

    for (const [key, queue] of Object.entries(this.table)) {
      const { object, sum, count } = queue.percentile(this._percentiles, this._timeout);

      if (count) {
        for (const [quantile, percentile] of Object.entries(object)) {
          const _label = key ? `{quantile="${quantile}",${key}}` : `{quantile="${quantile}"}`;
          lines.push(`${this.name}${_label} ${percentile}\n`);
        }
      }

      const label = key ? `{${key}}` : '';
      lines.push(`${this.name}_sum${label} ${sum}\n`);
      lines.push(`${this.name}_count${label} ${count}\n`);
    }

    return [
      super.toString({ head }),
      ...lines,
    ].join('');
  }
}

module.exports = Summary;
