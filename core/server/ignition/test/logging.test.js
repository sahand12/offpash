const PrettyStream = require('../logging/PrettyStream');
const NahangLogger = require('../logging/NahangLogger');
const {Writable} = require('stream');
const errros = require('../errors');
const sinon = require('sinon');
const should = require('should');
const Bunyan2Loggly = require('bunyan-loggly');

const sandbox = sinon.sandbox.create();

describe('Logging', function() {
  afterEach(function() {
    sandbox.restore();
  });
  
  // in Bunyan 1.8.3 they have changed this behaviour
  // they are trying to find err.message attribute and forward this as msg property
  // Our PrettyStream implementation can't handle this case
  it('ensure stdout write properties', function(done) {
    sandbox.stub(PrettyStream.prototype, 'write', function(data) {
      should.exist(data.req);
      should.exist(data.res);
      should.exist(data.err);
      data.msg.should.eql('message');
      done();
    });
    
    const nahangLogger = new NahangLogger();
    nahangLogger.info({err: new Error('message'), req: {body: {}}, res: {headers: {}}});
  });
});
