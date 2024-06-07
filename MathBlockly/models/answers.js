const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  answer:{
    type: String,
    required: true
  },
});

const Answer = mongoose.model('answer', answerSchema);

module.exports = Answer;