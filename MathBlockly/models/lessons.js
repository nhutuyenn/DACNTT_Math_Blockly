const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  },

  type:{
    type: String,
    required: true
  },

  time:{
    time: String}
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;