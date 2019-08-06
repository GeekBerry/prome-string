const Metric = require('./metric');

class Counter extends Metric {
  constructor(options) {
    super({ ...options, type: 'counter' });
  }

  inc(label) {
    const key = this.labelToKey(label);
    this.table[key] = (this.table[key] || 0.0) + 1.0;
  }
}

module.exports = Counter;
