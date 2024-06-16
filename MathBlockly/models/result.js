const mongoose = require('mongoose');

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const resultSchema = new Schema({
  lessonID: {
    type: ObjectId,
    required: true
  },
  accountID: {
    type: ObjectId,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  dateBirth: {
    type: Date
  },
  school: {
    type: String
  }
});

const Result = model('Result', resultSchema);

module.exports = Result;
