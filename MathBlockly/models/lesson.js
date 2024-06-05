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
});

const Lesson = mongoose.model('lesson', lessonSchema);

module.exports = Lesson;