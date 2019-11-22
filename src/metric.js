class Metric {
  static get INF() {
    return '+Inf';
  }

  static checkName(name) {
    if (!/^[a-zA-Z_:][a-zA-Z0-9_:]*$/.test(name)) {
      throw new Error('Name must match `^[a-zA-Z_:][a-zA-Z0-9_:]*$`');
    }
    return name;
  }

  static checkLabel(label) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(label)) {
      throw new Error('Label must match `^[a-zA-Z_][a-zA-Z0-9_]*$`');
    }
    return label;
  }

  static checkValue(value) {
    if (typeof value !== 'number') {
      throw new Error(`Value is not a valid number: ${value}`);
    }
    return value;
  }

  constructor({ type, name, help = 'help', labels = [] }) {
    this.name = this.constructor.checkName(name);
    this.HEAD = `# HELP ${name} ${help}\n# TYPE ${name} ${type}\n`;
    this.labelSet = new Set(labels.map(this.constructor.checkLabel));
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
