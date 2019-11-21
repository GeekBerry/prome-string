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

  constructor({ type, name, help = 'help', labels = [] }) {
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

  _labelToKey(label = {}) {
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

module.exports = Metric;
