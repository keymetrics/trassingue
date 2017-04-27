
var vxx = require('../..').start();

var EventEmitter = require('events');
var mongoose = require('../plugins/fixtures/mongoose4');
var express = require('../plugins/fixtures/express4');

var Schema = mongoose.Schema;
var assert = require('assert');

var simpleSchema = new Schema({
  f1: String,
  f2: Boolean,
  f3: Number
});

var Simple = mongoose.model('Simple', simpleSchema);


var http = require('http');
var PORT = 8080;

function doRequest(method, path, cb) {
  http.get({port: PORT, method: method, path: path || '/'}, function(res) {
    var result = '';
    res.on('data', function(data) { result += data; });
    res.on('end', function() {
      cb();
    });
  });
}

describe('API', function() {
  beforeEach(function(done) {
    var sim = new Simple({
      f1: 'sim',
      f2: true,
      f3: 42
    });
    mongoose.connect('mongodb://localhost:27017/testdb4', function(err) {
      sim.save(function(err) {
        assert(!err);
        done();
      });
    });
  });

  afterEach(function(done) {
    mongoose.connection.db.dropDatabase(function(err) {
      assert(!err);
      mongoose.connection.close(function(err) {
        assert(!err);
        done();
      });
    });
  });

  it('should bus count 3 transactions', function(done) {
    var data = new Simple({
      f1: 'val',
      f2: false,
      f3: 1729
    });

    var data2 = new Simple({
      f1: 'asdval',
      f2: true,
      f3: 1729
    });

    vxx.getBus().once('transaction', function(transactions) {
      //console.log(JSON.stringify(transactions, null, 2));
      //@ 5?
      assert(transactions.spans.length == 5);
      done();
    });

    vxx.runInRootSpan({name : 'test'}, function(endTransaction) {
      data.save(function(err) {
        assert(!err);
        setTimeout(function() {
          setTimeout(function() {
            data2.save(function(err) {
              endTransaction.endSpan();
            });
          }, 3);
        }, 2);
      });
    });
  });

  it('should trace across EE', function(done) {
    const myEmitter = new EventEmitter();

    vxx.getBus().once('transaction', function(transactions) {
      assert(transactions.spans.length == 3);
      done();
    });

    vxx.runInRootSpan({name:'lazer'}, function(end) {
      var span = vxx.createChildSpan({name : 'timeout'});
      span.addLabel('time', '1000');

      // If we drop that line context inside the 'done' events are lost
      vxx.getCls().getNamespace().bindEmitter(myEmitter);

      myEmitter.on('done', function() {
        span.endSpan();

        var span2 = vxx.createChildSpan({ name :'tvm' });
        span2.addLabel('time', '1000');

        setTimeout(function() {
          span2.endSpan();
          end.endSpan();
        }, 1000);
      });
    });

    // Here we emit event out of scope
    setTimeout(function() {
      myEmitter.emit('done');
    }, 400);

  });

  describe('Express server', function() {
    it('should accurately measure get time, get', function(done) {
      var server;
      var data = new Simple({
        f1: 'val',
        f2: false,
        f3: 1729
      });

      vxx.getBus().once('transaction', function(transactions) {
        assert(transactions.spans.length == 5);
        server.close();
        done();
      });

      var app = express();

      app.get('/', function (req, res, next) {
        setTimeout(function() {
          data.save(function(err, dt) {
            dt.remove(function() {
              res.send(200);
            });
          });
        }, 100);
      });

      server = app.listen(8080, function() {
        doRequest('GET', '/', function() {

        });
      });
    });
  });
});
