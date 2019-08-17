# prome-string

prometheus string generator

## Install
`npm install prome-string`

## Modules

```
Metric
Gauge
Counter
Histogram
# TODO Summary 
```

## Usage

### Gauge

* code

```js
const { Gauge } = require('prome-string');

const gauge = new Gauge({
  name: 'Gauge Name',
  help: 'Gauge Help',
  labels: ['labelA', 'labelB'],
});

gauge.set(2);
gauge.set(4, { labelA: 'A' });

console.log(`${gauge}`)
```

* result

```text
# HELP Gauge Name Gauge Help
# TYPE Gauge Name gauge
Gauge Name 2
Gauge Name{labelA="A"} 4
```

### Counter

* code

```js
const { Counter } = require('prome-string');

const counter = new Counter({
  name: 'Counter Name',
  help: 'Counter Help',
  labels: ['labelA', 'labelB'],
});

counter.inc();
counter.dec({ labelA: 'A' });
  
console.log(`${counter}`);
```

* result

```text
# HELP Counter Name Counter Help
# TYPE Counter Name gauge
Counter Name 1
Counter Name{labelA="A"} -1
```

### Histogram

* code

```js
const { Histogram } = require('prome-string');

const histogram = new Histogram({
  name: 'Histogram Name',
  help: 'Histogram Help',
  labels: ['labelA', 'labelB'],
  buckets: [1, 10, 100, 1000],
});

histogram.observe(5);
histogram.observe(500);
histogram.observe(20, { labelA: 'A' });

console.log(`${histogram}`);
```

* result

```text
# HELP Histogram Name Histogram Help
# TYPE Histogram Name histogram
Histogram Name_bucket{le="1"} 0
Histogram Name_bucket{le="10"} 1
Histogram Name_bucket{le="100"} 1
Histogram Name_bucket{le="1000"} 2
Histogram Name_bucket{le="+Inf"} 2
Histogram Name_bucket{labelA="A",le="1"} 0
Histogram Name_bucket{labelA="A",le="10"} 0
Histogram Name_bucket{labelA="A",le="100"} 1
Histogram Name_bucket{labelA="A",le="1000"} 1
Histogram Name_bucket{labelA="A",le="+Inf"} 1
Histogram Name_sum 505
Histogram Name_sum{labelA="A"} 20
Histogram Name_count 2
Histogram Name_count{labelA="A"} 1
```

