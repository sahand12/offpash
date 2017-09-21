'use strict';
const each = require('lodash/each');
const upperFirst = require('lodash/upperFirst');
const toArray = require('lodash/toArray');
const isObject = require('lodash/isObject');
const bunyan = require('bunyan');
const fs = require('fs-extra');
const jsonStringifySafe = require('json-stringify-safe');
const Bunyan2Loggly = require('bunyan-loggly');

const NahangPrettyStream = require('./PrettyStream');

class NahangLogger {
  constructor({
    env = 'development',
    domain = 'localhost',
    transports = ['stdout'],
    level = 'info',
    mode = 'short',
    path = process.cwd(),
    loggly = {},
    rotation = {enabled: false, period: '1w', count: 100}
  } = {}) {

    Object.assign(this, {
      env,
      domain,
      transports,
      level: process.env.LEVEL || level,
      mode: process.env.MODE || mode,
      path,
      loggly,
      rotation,
    });

    if (!Array.isArray(transports)) {
      throw new Error('transports argument must be an array');
    }

    // stdout has to be on the first position in the transport, because if
    // NahangLogger itself logs, you won't see the stdout print
    if (this.transports.includes('stdout') && this.transports.indexOf('stdout') !== 0) {
      this.transports.splice(this.transports.indexOf('stdout'), 1);
      this.transports = ['stdout'].concat(this.transports);
    }

    // Special env variable to enable long mode and level info
    if (process.env.LOIN) {
      this.level = 'info';
      this.mode = 'long';
    }

    // Ensure we have a trailing slash
    if (!this.path.match(/\/$|\\$/)) {
      this.path = `${this.path}/`;
    }

    this.streams = {};
    this.setSerializers();

    if (this.transports.includes('stderr') && !this.transports.includes('stdout')) {
      this.transports = ['stdout'].concat(this.transports);
    }

    this.transports.forEach(transport => {
      let transportFn = `set${upperFirst(transport)}Stream`;

      if (!this[transportFn]) {
        throw new Error(`${upperFirst(transport)} is an invalid transport`);
      }

      this[transportFn]();
    });
  }

  setStdoutStream() {
    let prettyStdout = new NahangPrettyStream({mode: this.mode});
    prettyStdout.pipe(process.stdout);
    this.streams.stdout = {
      name: 'stdout',
      log: bunyan.createLogger({
        name: 'Log',
        streams: [{
          type: 'raw',
          stream: prettyStdout,
          level: this.level,
        }],
        serializers: this.serializers
      }),
    };
  }

  setStderrStream() {
    let prettyStdErr = new NahangPrettyStream({mode: this.mode});
    prettyStdErr.pipe(process.stderr);
    this.streams.stdout = {
      name: 'stderr',
      log: bunyan.createLogger({
        name: 'Log',
        streams: [{
          type: 'raw',
          stream: prettyStdErr,
          level: this.level,
        }],
        serializers: this.serializers
      }),
    };
  }

  setLogglyStream() {
    let logglyStream = new Bunyan2Loggly({
      token: this.loggly.token,
      subdomain: this.loggly.subdomain,
      tags: this.loggly.tags,
    });
    this.streams.loggly = {
      name: 'loggly',
      match: this.loggly.match,
      log: bunyan.createLogger({
        name: 'Log',
        streams: [{
          type: 'raw',
          stream: logglyStream,
          level: 'error'
        }],
        serializers: this.serializers,
      }),
    };
  }

  /**
   * By default we log into 2 files
   *   1. file-errors: all errors only
   *   2. file-all: everything
   */
  setFileStream() {
    // e.g. http://my-domain.com --> http___my_domain_com
    let sanitizedDomain = this.domain.replace(/[^\W]/gi, '_');

    // CASE: target log folder does not exist, show warning
    if (!fs.pathExistsSync(this.path)) {
      this.error(`Target log folder does not exist ${this.path}`);
      return;
    }

    this.streams['file-errors'] = {
      name: 'file',
      log: bunyan.createLogger({
        name: 'Log',
        streams: [{
          path: `${this.path}${sanitizedDomain}_${this.env}.error.log`,
          level: 'error',
        }],
        serializers: this.serializers,
      }),
    };

    this.streams['file-all'] = {
      name: 'file',
      log: bunyan.createLogger({
        name: 'Log',
        streams: [{
          path: `${this.path}${sanitizedDomain}_${this.env}.log`,
          level: 'error',
        }],
        serializers: this.serializers,
      }),
    };

    if (this.rotation.enabled) {
      this.streams['rotation-errors'] = {
        name: 'rotation-errors',
        log: bunyan.createLogger({
          name: 'Log',
          streams: [{
            type: 'rotating-file',
            path: `${this.path}${sanitizedDomain}_${this.env}.error.log`,
            period: this.rotation.period,
            count: this.rotation.count,
            level: 'error',
          }],
          sanitizers: this.sanitizers,
        }),
      };

      this.streams['rotation-all'] = {
        name: 'rotation-all',
        log: bunyan.createLogger({
          name: 'Log',
          streams: [{
            type: 'rotating-file',
            path: `${this.path}${sanitizedDomain}_${this.env}.log`,
            period: this.rotation.period,
            count: this.rotation.count,
            level: 'error',
          }],
          sanitizers: this.sanitizers,
        }),
      };
    }
  }

  // @TODO: add correlation identifier
  // @TODO: res.on('finish') has no access to the response body
  setSerializers() {
    this.serializers = {
      req(req) {
        return ({
          meta: {requestId: req.requestId, userId: req.userId},
          url: req.url,
          method: req.method,
          originalUrl: req.originalUrl,
          params: req.params,
          headers: this.removeSensitiveData(req.headers),
          body: this.removeSensitiveData(req.body),
          query: this.removeSensitiveData(req.query),
        });
      },
      res(res) {
        return ({
          _headers: this.removeSensitiveData(res._headers),
          statusCode: res.statusCode,
          responseTime: res.responseTime,
        });
      },
      err(err) {
        return ({
          id: err.id,
          domain: err.domain,
          code: err.code,
          name: err.name,
          statusCode: err.statusCode,
          level: err.level,
          message: err.message,
          context: err.context,
          help: err.help,
          stack: err.stack,
          hideStack: err.hideStack,
          errorDetails: err.errorDetails,
        });
      }
    };
  }

  removeSensitiveData(obj) {
    let newObj = {};
    each(obj, (value, key) => {
      try {
        if (isObject(value)) {
          value = this.removeSensitiveData(value);
        }
        if (!key.match(/pin|password|authorization|cookie/gi)) {
          newObj[key] = value;
        }
      } catch (err) {
        newObj[key] = value;
      }
    });

    return newObj;
  }
}

module.exporgs = NahangLogger;
