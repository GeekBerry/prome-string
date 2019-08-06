const Counter = require('./counter');

class Gauge extends Counter {
  constructor(options) {
    super({ ...options, type: 'gauge' });
  }

  add(value, label) {
    value = this.constructor.checkValue(value);
    const key = this.labelToKey(label);
    this.table[key] = (this.table[key] || 0.0) + value;
  }

  set(value, label) {
    value = this.constructor.checkValue(value);
    const key = this.labelToKey(label);
    this.table[key] = value;
  }
}

module.exports = Gauge;
