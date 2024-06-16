const { Schema, model } = require('mongoose');
const { ObjectId } = Schema.Types;

const questionSchema = new Schema({
  lessonID: {
    type: ObjectId,
    required: true
  },
  question: {
    type: String,
  },
  direction: {
    type: String,
    required: true
  }
});

const Question = model('Question', questionSchema);

module.exports = Question;
