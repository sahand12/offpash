// Test Requirements
const {expect} = require('chai');
const should = require('should');
const _ = require('lodash');
require('./assertions');

// What we're testing
const errors = require('../errors');
const util = require('util');

describe('Errors Public API', function() {
  it('is instance of Error', function() {
    (new errors.IgnitionError() instanceof Error).should.eql(true);
  });
  
  // @TODO: re-add the missing ones
  it('has custom error classes', function() {
    expect(errors).to.have.ownProperty('InternalServerError');
    expect(errors).to.have.ownProperty('IncorrectUsageError');
    expect(errors).to.have.ownProperty('BadRequestError');
    expect(errors).to.have.ownProperty('MaintenanceError');
    expect(errors).to.have.ownProperty('MethodNotAllowedError');
    expect(errors).to.have.ownProperty('NoPermissionError');
    expect(errors).to.have.ownProperty('NotFoundError');
    expect(errors).to.have.ownProperty('RequestEntityTooLargeError');
    expect(errors).to.have.ownProperty('TokenRevocationError');
    expect(errors).to.have.ownProperty('TooManyRequestsError');
    expect(errors).to.have.ownProperty('UnauthorizedError');
    expect(errors).to.have.ownProperty('ValidationError');
    expect(errors).to.have.ownProperty('VersionMismatchError');
    expect(errors).to.have.ownProperty('UnsupportedMediaTypeError');
  });
  
  it('simulate ignition usage', function() {
    // Imagine this here is an new JS file in Nahang
    class NahangError extends errors.IgnitionError {
      constructor(options) {
        super(options);
        this.property = options.property;
        this.value = options.value;
      }
    }
    
    const nahangErrors = {
      CustomNahangError: class CustomNahangError extends NahangError {
        constructor(options) {
          super(Object.assign({}, {
            statusCode: 500,
            errorType: 'CustomNahangError'
          }, options));
        }
      },
    };
    
    // ### Testing
    let nahangError = new NahangError({property: 'name', value: 'Kate'});
    
    should.exist(nahangError.property);
    should.exist(nahangError.value);
    should.exist(nahangError.statusCode);
    
    const toExport = Object.assign({}, nahangErrors, errors);
    
    (new toExport.CustomNahangError() instanceof Error).should.eql(true);
    (new toExport.CustomNahangError() instanceof NahangError).should.eql(true);
    (new toExport.CustomNahangError() instanceof errors.IgnitionError).should.eql(true);

    (new toExport.NoPermissionError() instanceof Error).should.eql(true);
    (new toExport.NoPermissionError() instanceof NahangError).should.eql(false);
    (new toExport.NoPermissionError() instanceof errors.IgnitionError).should.eql(true);
    
    should.exist(toExport.CustomNahangError);
    should.exist(toExport.IncorrectUsageError);
    should.not.exist(errors.CustomNahangError);
  });
  
  // @TODO: check for correct message for all the errors
  it('test default message', function() {
    let err = new errors.BadRequestError();
    err.message.should.eql('The request could not be understood.');
    
    err = new errors.BadRequestError({message: 'this is custom'});
    err.message.should.eql('this is custom');
  })
  
  it('internal server error', function() {
    let err = new errors.InternalServerError();
    err.level.should.eql('critical');
  });
  
  it('test property', function() {
    let err = new errors.BadRequestError({property: 'email'});
    err.property.should.eql('email')
  });
  
  it('test err as string', function() {
    let err = new errors.BadRequestError({err: 'db error'});
    err.stack.should.containEql('db error');
  });
  
  describe('isIgnitionError', function() {
    it('1', function() {
      let isIgnitionError = errors.utils.isIgnitionError(new Error());
      isIgnitionError.should.eql(false);
    });
    
    it('2', function() {
      let isIgnitionError = errors.utils.isIgnitionError(new errors.NotFoundError());
      isIgnitionError.should.eql(true);
    });
    
    it('3', function() {
      let err = new errors.NotFoundError();
      err.constructor.super_ = {};
      err.constructor.super_.name = 'NahangError';
      err.constructor.super_.super_ = {};
      err.constructor.super_.super_.name = 'IgnitionError';
      
      let isIgnitionError = errors.utils.isIgnitionError(err);
      isIgnitionError.should.eql(true);
    });
    
    it('4', function() {
      let err = new errors.NotFoundError();
      err.constructor.super_ = {};
      err.constructor.super_.name = 'NahangError';
      err.constructor.super_.super_ = {};
      err.constructor.super_.super_.name = 'NoIgnitionError';
      
      let isIgnitionError = errors.utils.isIgnitionError(err);
      isIgnitionError.should.eql(true);
    });
  });
  
});
