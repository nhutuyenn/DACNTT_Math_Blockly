const mongoose = require('mongoose');
const { Schema } = mongoose;
//type: Schema.Types.ObjectId,


const lessonAnswerSchema = new mongoose.Schema({
  lessonID:{
    type: Schema.Types.ObjectId
  },

  answerID:{
    type: Schema.Types.ObjectId
  }

});

const LessonAnswer = mongoose.model('lessonAnswer', lessonAnswerSchema);

module.exports = LessonAnswer;