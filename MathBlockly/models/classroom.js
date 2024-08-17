const mongoose = require('mongoose');
const { Schema } = mongoose;

const classroomSchema = new mongoose.Schema({
  teacherID: {
    type: Schema.Types.ObjectId
  },

  teacherName: {
    type: String,
    required: [true, 'Username is required'],
  },

  name:{
    type: String,
    required: [true, 'Name is required'],
  },

  year:{
    type: String,
    required: [true, 'Year is required'],
  },
});

const classroom = mongoose.model('classroom', classroomSchema);

module.exports = classroom;