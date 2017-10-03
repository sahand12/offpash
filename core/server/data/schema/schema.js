'use strict';
let schema = {tables: {}};
const users = {
  fnm: {
    type: String,
    alias: 'firstName',
    validators: {
      maxLength: 40,
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  lnm: {
    type: String,
    alias: 'lastName',
    validators: {
      maxLength: 40,
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  pwd: {
    type: String,
    alias: 'password',
    validators: {
      minLength: 6,
      maxLength: 40,
    }
  }, // password
  eml: {
    type: String,
    validators: {
      validate() {}
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  phn: {
    mb: {
      type: String,
      alias: 'mobileNumber',
      validators: {
        match: /\.+/g
      },
      setters: {
        trim: true,
      }
    },
    hm: {
      type: String,
      alias: 'homeNumber',
      validators: {
        match: /\.+/g
      },
      setters: {
        trim: true,
      }
    },
    wk: {
      type: String,
      alias: 'workNumber',
      validators: {
        match: /\.+g/
      },
      setters: {
        trim: true,
      }
    }
  },
  img: { // images
    prf: [{ // profile images
      type: String,
      alias: 'profile'
    }],
    cvr: [{ // cover images
      type: String,
      alias: 'cover'
    }],
    alias: 'images',
  },
  slg: {
    type: String,
    alias: 'slug',
  },
  bio: {type: String},
  wst: {type: String}, // @TODO: more fine-grained description
  lct: {type: Location}, // @TODO: more fine-grained description
  scl: { // socials
    fb: {
      type: Object,
      alias: 'facebook',
    },
    go: {
      type: Object,
      alias: 'google',
    },
    in: {
      type: Object,
      alias: 'instagram',
    },
    tw: {
      type: Object,
      alias: 'twitter',
    },
    alias: 'socials',
  },
  sts: { // user status
    type: String,
    alias: 'status',
    validators: {
      enum: ['active', 'inactive', 'banned']
    },
  },
  lcl: {type: String},
  vsb: {type: String},
  lsn: { // last seen
    type: Date,
    default: Date.now,
  },
  cat: {type: Date},
  cby: {type: ObjectId},
  uat: {type: Date},
  uby: {type: ObjectId},
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
  key: {
    type: String,
    validators: {
      maxLength: 50,
    },
    setters: {
      trim: true,
    },
    index: {
      unique: true,
    },
  },
  val: {
    type: String,
    validators: {
      maxLength: 65535,
    },
    setters: {
      trim: true,
    },
  },
  typ: { // type
    type: String,
    alias: 'type',
    default: 'core',
    validators: {
      enum: ['core', 'frontend', 'app', 'plugin', 'private', 'theme'],
    },
    
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
const clients = {
  uid: {
    type: String,
    alias: 'uuid',
    validators: {
      maxLength: 36,
    },
  },
  nm: {
    type: String,
    alias: 'name',
    validators: {
      maxLength: 50,
    },
    index: {
      unique: true,
    }
  },
  scr: { // client secret
    type: String,
    alias: 'secret',
    validators: {
      maxLength: 256,
    },
  },
  rdu: { // redirection uri
    type: String,
    alias: 'redirectionUri',
    validators: {
      maxLength: 2000,
    },
    setters: {
      lowercase: true,
      trim: true,
    }
  },
  clu: { // client uri
    type: String,
    alias: 'clientUri',
    validators: {
      maxLength: 200,
    },
    setters: {
      lowercase: true,
      trim: true,
    },
  },
  auu: { // auth uri
    type: String,
    alias: 'authUri',
    validators: {
      maxLength: 200,
    },
    setters: {
      lowercase: true,
      trim: true,
    },
  },
  lg: { // logo
    type: String,
    alias: 'logo',
    validators: {
      maxLength: 2000,
    },
  },
  st: {
    type: String,
    alias: 'status',
    default: 'development',
    validators: {
      enum: ['development']
    },
  },
  tp: { // type
    type: String,
    alias: 'type',
    default: 'ua',
    validators: {
      enum: ['ua', 'web', 'native']
    },
  },
  dsc: {
    type: String,
    alias: 'description',
    validators: {
      maxLength: 2000,
    },
    setters: {
      trim: true,
    },
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

const accessTokens = {
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
  iby: { // issued by
    type: ObjectId,
    alias: 'IssuedBy',
    ref: 'User' // @TODO: who can issue these?
  },
  exp: {
    type: Date,
    alias: 'expires',
  },
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
  k: {
    type: String,
    alias: 'key',
    validators: {
      maxLength: 191,
    }
  },
  frq: {
    type: Number,
    alias: 'firstRequest',
  },
  lrq: {
    type: Number,
    alias: 'lastRequest',
  },
  ltm: {
    type: Number,
    alias: 'lifeTime'
  },
  cnt: {
    type: Number,
    alias: 'count',
  }
};

schema.tables = {
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
 * @type {{tables: {}}}
 */
module.exports = schema;
