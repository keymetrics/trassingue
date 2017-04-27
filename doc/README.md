# Trace Driver

## Prerequisites

1. Your application will need to be using Node.js version 0.12 or greater.

## Usage

```javascript
var agent = require('vxx').start();

agent.getBus().on('transaction', function(transaction) {
  console.log(transaction);
});
```

## Test

```bash
$ npm test
```

## Configuration

See [the default configuration](config.js) for a list of possible configuration options. These options can be passed to the agent through the object argument to the start command shown above:

```
require('vxx').start({
    ignoreFilter: {
      'url': [],
      'method': []
    },

    // 'express', 'hapi', 'http', 'restify'
    excludedHooks: []
});
```

## What gets traced

The trace agent can do automatic tracing of HTTP requests when using these frameworks:
* [express](https://www.npmjs.com/package/express) version 4
* [hapi](https://www.npmjs.com/package/hapi) versions 8 - 13
* [restify](https://www.npmjs.com/package/restify) versions 3 - 4 (experimental)

The agent will also automatic trace of the following kinds of RPCs:
* Outbound HTTP requests
* [MongoDB-core](https://www.npmjs.com/package/mongodb-core) version 1
* [Mongoose](https://www.npmjs.com/package/mongoose) version 4
* [Redis](https://www.npmjs.com/package/redis) versions 0.12 - 2
* [MySQL](https://www.npmjs.com/package/mysql) version ^2.9

You can use the [Custom Tracing API](#custom-tracing-api) to trace other processes in your application.

## Advanced trace configuration

The trace agent can be configured by passing a configurations object to the agent `start` method. This configuration option accepts all values in the [default configuration](config.js).

One configuration option of note is `enhancedDatabaseReporting`. Setting this option to `true` will cause database operations for redis and MongoDB to record query summaries and results as labels on reported trace spans.

## Disabling the trace agent

The trace agent can be turned off by specifying `enabled: false` in your configuration file.

## Custom Tracing API

See [trace-api.md](https://github.com/keymetrics/vxx/blob/master/doc/trace-api.md)

## Create plugins

See [plugin-guide.md](https://github.com/keymetrics/vxx/blob/master/doc/plugin-guide.md)

## Licensing

* See [LICENSE](LICENSE)
