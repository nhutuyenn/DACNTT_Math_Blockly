const mongoose = require('mongoose');
const { Schema } = mongoose;

const resultSchema = new mongoose.Schema({
  lessonID: {
    type: Schema.Types.ObjectId,
    required: true
  },
  lessonName: {
    type: String,
    required: true
  },
  accountID: {
    type: Schema.Types.ObjectId,
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

  createAt: {
    type: Date,
    default: Date.now
  }
});

const Result = mongoose.model('Result', resultSchema);


module.exports = Result;
