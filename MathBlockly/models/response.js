const mongoose = require('mongoose');
const { Schema } = mongoose;

const responseSchema = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
    required: true
  },

  resultID: {
    type: Schema.Types.ObjectId,
    required: true
  },

  questionID: {
    type: Schema.Types.ObjectId,
    required: true
  },

  answerID: [{
    type: Schema.Types.ObjectId,
    required: true
  }]
});

const Response = mongoose.model('response', responseSchema);

module.exports = Response;
