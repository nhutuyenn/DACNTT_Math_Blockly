const mongoose = require('mongoose');
const { Schema } = mongoose;

const validationSchema = new mongoose.Schema({
  questionID:{
    type: Schema.Types.ObjectId,
    required: true
  },

  answerID: [{
    type: String,
    required: true
  }],

  type:{
    type: Boolean  }
});

const Validation = mongoose.model('validation', validationSchema);

module.exports = Validation;