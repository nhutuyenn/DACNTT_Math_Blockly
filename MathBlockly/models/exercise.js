const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  lessonID:{
    type: ObjectID,
    required: true
  },

  question:{
    type: String,
    required: true
  },

  answer:{
    type: String,
    required: true
  },
});

const Exercise = mongoose.model('exercise', exerciseSchema);

module.exports = Exercise;