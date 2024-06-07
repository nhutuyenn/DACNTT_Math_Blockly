const mongoose = require('mongoose');

const validationSchema = new mongoose.Schema({
  questionID:{
    type: ObjectID,
    required: true
  },

  answerID:{
    type: ObjectID,
    required: true
  },

  type:{
    type: Boolean,
    required: true
  }
});

const Validation = mongoose.model('validation', validationSchema);

module.exports = Validation;