'use strict';
const mongoose = require('mongoose');

const schema = require('../data/schema');
const bruteSchema = new mongoose.Schema(schema.brute, {typeKey: '$type'});

const BruteProxy = class BruteProxy {};

bruteSchema.loadClass(BruteProxy);
const Brute = mongoose.model('Brute', bruteSchema);

exports = module.exports = Brute;
