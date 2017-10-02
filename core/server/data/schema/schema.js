'use strict';

const users = {
  attributes: {
    id: {type: String},
    name: {
      first: {type: String}, // first name
      last: {type: String}, // last name
    },
    slug: {type: String},
    password: {type: String}, // password
    email: {type: String},
    phone: {
      mobile: {type: String},
      home: {type: String},
      work: {type: String}
    },
    profImg: {type: String}, // profile image
    covImg: {type: String}, // cover image
    bio: {type: String},
    website: {type: String},
    location: {type: Location},
    
    facebook: {type: Object},
    twitter: {type: Object},
    instagram: {type: Object},
    google: {type: Object},
    
    status: {type: String},
    locale: {type: String},
    visibility: {type: String},
    lastSeen: {type: Date},
    createdAt: {type: Date},
    createdBy: {type: ObjectId},
    updatedAt: {type: Date},
    updatedBy: {type: ObjectId},
  },
  validations: {}
};
