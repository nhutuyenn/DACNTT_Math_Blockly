const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  lessonID: {
    type: ObjectID,
    required: true
},

  accountID: {
    type: ObjectID,
    required: true
  },

  score:{
    type: Number,
    required: true
  },

  time:{
    type: String,
    required: true
  },

  dateBirth:{
    type: Date,
  },

  school:{
    type: String,
  }
});

const Result = mongoose.model('result', resultSchema);

module.exports = Result;