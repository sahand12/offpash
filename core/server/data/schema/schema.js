'use strict';
const mongoose = require('mongoose');

const ObjectId = mongoose.Schema.Types.ObjectId;
let schema;

const users = {
  fnm: {$type: String, alias: 'firstName', maxLength: 50, minLength: 2, lowercase: true, trim: true},
  lnm: {$type: String, alias: 'lastName', maxLength: 50, minLength: 2, lowercase: true, trim: true},
  pw: {$type: String, alias: 'password', minLength: 6},
  em: {$type: String, alias: 'email', validate() {/* @TODO: validate email*/}, lowercase: true, trim: true, unique: true},
  mbn: [{ // @TODO: build a virtual for this
    alias: 'mobile',
    pr: {$type: Boolean, alias: 'isPrimary', default: false},
    nm: {$type: String, alias: 'rawNumber', trim: true},
    ccd: {$type: String, alias: 'countryCode', default: '+98'},
    opd: {$type: String, alias: 'operatorCode'}
  }],
  ph: [{
    alias: 'phone',
    pr: {$type: Boolean, alias: 'isPrimary', default: false},
    tp: {$type: String, alias: 'type', enum: ['work', 'home'], lowercase: true, trim: true},
    nm: {$type: String, alias: 'rawNumber', trim: true},
    ccd: {$type: String, alias: 'countryCode', default: '+98'},
    ctd: {$type: String, alias: 'cityCode'}
  }],
  img: {
    alias: 'images',
    // profile images
    pr: [{$type: String, maxLength: 2000, alias: 'profile'}],
    // cover images
    cv: [{$type: String, alias: 'cover', maxLength: 2000}],
  },
  sl: {$type: String, alias: 'slug', maxLength: 200},
  bio: {$type: String, maxLength: 2000},
  wst: {$type: String, alias: 'website'}, // @TODO: more fine-grained description
  lct: {}, // @TODO: more fine-grained description
  scl: {
    alias: 'socials',
    fb: {$type: Object, $alias: 'facebook'},
    go: {$type: Object, alias: 'google'},
    in: {$type: Object, alias: 'instagram'},
    tw: {$type: Object, alias: 'twitter'},
  },
  sts: {$type: String, alias: 'status', enum: ['active', 'inactive', 'locked', 'warn-1', 'warn-2', 'warn-3', 'warn-4'], default: 'active'},
  lcl: {$type: String, alias: 'locale', default: 'fa-IR'},
  vsb: {$type: String, enum: ['private', 'public'], trim: true, lowercase: true},
  lsn: {$type: Date, alias: 'lastSeen', default: Date.now},
  cat: {$type: Date, alias: 'createdAt', default: Date.now},
  cby: {$type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  uat: {$type: Date, default: Date.now},
  uby: {$type: mongoose.Schema.Types.ObjectId, ref: 'User'},
};

const roles = {
  nm: {
    type: String,
    alias: 'name',
    validators: {
      maxLength: 50,
    },
    setters: {
      lowercase: true,
      trim: true,
    },
    index: {
      unique: true,
    }
  },
  dsc: {
    type: String,
    alias: 'description',
    validators: {
      maxLength: 2000,
    },
    setters: {
      trim: true,
    }
  },
  cat: {
    type: Date,
    alias: 'createdAt',
    default: Date.now,
  },
  cby: {
    type: ObjectId,
    alias: 'createdBy',
  },
  uat: {
    type: Date,
    alias: 'updatedAt',
    default: Date.now,
  },
  uby: {
    type: ObjectId,
    alias: 'updatedBy',
  },
};

const permissions = {
  nm: {
    type: 'String',
    alias: 'name',
    validators: {
      maxLength: 50,
    },
    setters: {
      trim: true,
    },
  },
  obt: { // Object type
    type: String,
    alias: 'objectType',
    validators: {
      maxLength: 50,
    },
    setters: {
      trim: true,
      lowercase: true,
    }
  },
  act: { // Action type
    type: String,
    alias: 'actionType',
    validators: {
      maxLength: 50,
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  oid: {
    type: String,
    alias: 'objectId',
    validators: {
      maxLength: 24,
      minLength: 24,
    }
  },
  cat: {
    type: Date,
    alias: 'createdAt',
    default: Date.now,
  },
  cby: {
    type: ObjectId,
    alias: 'createdBy',
  },
  uat: {
    type: Date,
    alias: 'updatedAt',
    default: Date.now,
  },
  uby: {
    type: ObjectId,
    alias: 'updatedBy',
  },
};

const settings = {
  k: {$type: String, alias: 'key', maxLength: 50, trim: true, unique: true},
  v: {$type: String, alias: 'value', maxLength: 65535, trim: true},
  tp: {$type: String, alias: 'type', default: 'core', enum: ['core', 'frontend', 'app', 'plugin', 'private', 'theme']},
  cat: {$type: Date, alias: 'createdAt', default: Date.now},
  cby: {$type: ObjectId, alias: 'createdBy', ref: 'User'}, // @TODO: what should ref be?
  uat: {$type: Date, alias: 'updatedAt', default: Date.now},
  uby: {$type: ObjectId, alias: 'updatedBy', ref: 'User'} // @TODO: What should ref be?
};

const apps = {
  nm: {
    type: String,
    alias: 'name',
    index: {
      unique: true,
    },
    validators: {
      maxLength: 191,
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  sl: {
    type: String,
    alias: 'slug',
    index: {
      unique: true,
    },
    validators: {
      maxLength: 191,
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  vs: {
    type: String,
    alias: 'version',
    validators: {
      maxLength: 50,
    },
    setters: {
      trim: true,
    },
  },
  st: {
    type: String,
    alias: 'status',
    default: 'inactive',
    validators: {
      enum: ['active', 'inactive']
    }
  },
  cat: {
    type: Date,
    alias: 'createdAt',
    default: Date.now,
  },
  cby: {
    type: ObjectId,
    alias: 'createdBy',
  },
  uat: {
    type: Date,
    alias: 'updatedAt',
    default: Date.now,
  },
  uby: {
    type: ObjectId,
    alias: 'updatedBy',
  },
};

// OAuth 2.0 clients
const clients = { // clients must have a list trusted domains so only request from those domains will be answered to @TODO: add them here
  ui: {$type: String, alias: 'uuid', maxLength: 36, required: true, unique: true},
  nm: {$type: String, alias: 'name', maxLength: 50, required: true},
  scr: {$type: String, alias: 'secret', maxLength: 191, required: true},
  rdu: {$type: String, alias: 'redirectionUri', maxLength: 2000, lowercase: true, trim: true},
  clu: {$type: String, alias: 'clientUri', maxLength: 2000, lowercase: true, trim: true},
  auu: {$type: String, alias: 'authUri', maxLength: 2000, lowercase: true, trim: true},
  lg: {$type: String, alias: 'logo', maxLength: 2000},
  st: {$type: String, alias: 'status', default: 'development', enum: ['development', 'enabled'], required: true},
  tp: {$type: String, alias: 'type', default: 'ua', enum: ['ua', 'web', 'native']},
  dsc: {$type: String, alias: 'description', maxLength: 2000, trim: true},
  ctd: [{$type: String, alias: 'trustedDomains', maxLength: 2000}],
  cat: {$type: Date, alias: 'createdAt', default: Date.now, required: true},
  cby: {$type: ObjectId, alias: 'createdBy'},
  uat: {$type: Date, alias: 'updatedAt', default: Date.now, required: true},
  uby: {$type: ObjectId, alias: 'updatedBy'},
};

const accessTokens = {
  tk: {$type: String, alias: 'token', maxLength: 191, unique: true},
  tp: {$type: String, alias: 'tokenType', enum: ['refresh', 'access']},
  uid: {$type: ObjectId, alias: 'userId', ref: 'User'},
  cid: {$type: ObjectId, alias: 'clientId', ref: 'Client'},
  iby: {$type: ObjectId, alias: 'IssuedBy', ref: 'User' /*@TODO: User or refreshToken*/},
  exp: {$type: Date, alias: 'expires'},
};

const refreshTokens = {
  tk: {
    type: String,
    alias: 'token',
    validators: {
      maxLength: 191,
    },
    index: {
      unique: true,
    },
  },
  uid: {
    type: ObjectId,
    alias: 'userId',
    ref: 'User',
  },
  cid: {
    type: ObjectId,
    alias: 'clientId',
    ref: 'Client',
  },
  exp: {
    type: Date,
    alias: 'expires',
  },
};

const brute = {
  k: {$type: String, alias: 'key', maxLength: 191},
  frq: {$type: Number, alias: 'firstRequest'},
  lrq: {$type: Number, alias: 'lastRequest'},
  c: {$type: Number, alias: 'count'},
  ex: {$type: Date, alias: 'expires'}
};

schema = {
  accessTokens,
  apps,
  brute,
  clients,
  permissions,
  refreshTokens,
  roles,
  settings,
  users,
};

/**
 * Expose Schema
 */
module.exports = schema;
