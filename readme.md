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
Summary 
```

## Usage


### Counter

* code

```js
const { Counter } = require('prome-string');

const counter = new Counter({
  name: 'counter_name',
  help: 'counter_help',
  labels: ['labelA', 'labelB'],
});

counter.inc();
counter.dec({ labelA: 'A' });
  
console.log(`${counter}`);
```

* result

```text
# HELP counter_name counter_help
# TYPE counter_name gauge
counter_name 1
counter_name{labelA="A"} -1
```

### Gauge

* code

```js
const { Gauge } = require('prome-string');

const gauge = new Gauge({
  name: 'gauge_name',
  help: 'gauge_help',
  labels: ['labelA', 'labelB'],
});

gauge.set(2);
gauge.set(4, { labelA: 'A' });

console.log(`${gauge}`)
```

* result

```text
# HELP gauge_name gauge_help
# TYPE gauge_name gauge
gauge_name 2
gauge_name{labelA="A"} 4
```

### Histogram

* code

```js
const { Histogram } = require('prome-string');

const histogram = new Histogram({
  name: 'histogram_name',
  help: 'histogram_help',
  labels: ['labelA', 'labelB'],
  buckets: [1, 10, 100, 1000],
});

histogram.set(5);
histogram.set(500);
histogram.set(20, { labelA: 'A' });

console.log(`${histogram}`);
```

* result

```text
# HELP histogram_name histogram_help
# TYPE histogram_name histogram
histogram_name_bucket{le="1"} 0
histogram_name_bucket{le="10"} 1
histogram_name_bucket{le="100"} 1
histogram_name_bucket{le="1000"} 2
histogram_name_bucket{le="+Inf"} 2
histogram_name_bucket{labelA="A",le="1"} 0
histogram_name_bucket{labelA="A",le="10"} 0
histogram_name_bucket{labelA="A",le="100"} 1
histogram_name_bucket{labelA="A",le="1000"} 1
histogram_name_bucket{labelA="A",le="+Inf"} 1
histogram_name_sum 505
histogram_name_sum{labelA="A"} 20
histogram_name_count 2
histogram_name_count{labelA="A"} 1
```

### Summary
* code

```js
const summary = new Summary({
  name: 'summary_name',
  help: 'summary_help',
  labels: ['method'],
  // percentiles: [0.01, 0.1, 0.5, 0.9, 0.99], <default>
  // queueLength: 1000, <default>
  // timeout: Infinity, <default>
});

summary.set(10, { method: 'get' });
summary.set(20, { method: 'get' });

summary.set(100, { method: 'post' });
summary.set(200, { method: 'post' });

console.log(`${summary}`);
```

* result

```text
# HELP summary_name summary_help
# TYPE summary_name summary
summary_name{quantile=0.01,method="get"} 10
summary_name{quantile=0.1,method="get"} 10
summary_name{quantile=0.5,method="get"} 15
summary_name{quantile=0.9,method="get"} 20
summary_name{quantile=0.99,method="get"} 20
summary_name{quantile=0.01,method="post"} 100
summary_name{quantile=0.1,method="post"} 100
summary_name{quantile=0.5,method="post"} 150
summary_name{quantile=0.9,method="post"} 200
summary_name{quantile=0.99,method="post"} 200
summary_name_sum{method="get"} 30
summary_name_sum{method="post"} 300
summary_name_count{method="get"} 2
summary_name_count{method="post"} 2
```
