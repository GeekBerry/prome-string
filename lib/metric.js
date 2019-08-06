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

  reset() {
    this.table = {};
  }

  toString({ head = true } = {}) {
    const array = head ? [this.HEAD] : [];
    return array.concat(
      lodash.map(this.table, (v, k) => (k ? `${this.name}{${k}} ${v}` : `${this.name} ${v}`)),
    ).join('\n');
  }
}

module.exports = Metric;
