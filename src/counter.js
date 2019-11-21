const Gauge = require('./gauge');

class Counter extends Gauge {
  constructor(options) {
    super({ ...options, type: 'counter' });
  }

  add(value, label) {
    value = this.constructor.checkValue(value);
    const key = this._labelToKey(label);
    this.table[key] = (this.table[key] || 0.0) + value;
  }

  inc(label) {
    return this.add(1, label);
  }

  dec(label) {
    return this.add(-1, label);
  }
}

module.exports = Counter;
