const Metric = require('./metric');

class Gauge extends Metric {
  constructor({ name, help, labels = [] }) {
    super({ type: 'gauge', name, help, labels });
    this.table = {}; // {labelKey: value}
  }

  set(value, label) {
    value = this.constructor.checkValue(value);
    const key = this._labelToKey(label);
    this.table[key] = value;
  }

  get(label = {}) {
    const key = this._labelToKey(label);
    return this.table[key];
  }

  clear() {
    this.table = {};
  }

  toString({ head = true } = {}) {
    const lines = [];
    for (const [key, value] of Object.entries(this.table)) {
      const label = key ? `{${key}}` : '';
      lines.push(`${this.name}${label} ${value}\n`);
    }

    return [
      super.toString({ head }),
      ...lines,
    ].join('');
  }
}

module.exports = Gauge;
