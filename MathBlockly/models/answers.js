const mongoose = require('mongoose');
const { Schema } = mongoose;


const answerSchema = new mongoose.Schema({
  answer:{
    type: String,
    required: true
  },

  lessonID: {
    type: Schema.Types.ObjectId,
  },

  connection:{
    type: String
  }

});

const Answer = mongoose.model('answer', answerSchema);

module.exports = Answer;