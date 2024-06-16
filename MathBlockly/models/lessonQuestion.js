const mongoose = require('mongoose');
const { Schema } = mongoose;


const lessonQuestionSchema = new mongoose.Schema({
  lessonID:{
    type: Schema.Types.ObjectId
  },

  questionID:{
    type: Schema.Types.ObjectId
  }

});

const LessonQuestion = mongoose.model('LessonQuestion', lessonQuestionSchema);

module.exports = LessonQuestion;