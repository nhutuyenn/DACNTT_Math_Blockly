const mongoose = require('mongoose');

const accountDetailSchema = new mongoose.Schema({
  userID: {
    type: ObjectID,
    required: [true, 'Username is required'],
    unique: [ true, 'Username already exists'],
  },

  userName: {
    type: String,
    required: [true, 'Username is required'],
  },

  email:{
    type: String,
  },

  phone:{
    type: String,
  },

  dateBirth:{
    type: Date,
  },

  school:{
    type: String,
  }
});

const accountDetails = mongoose.model('accountDetails', accountDetailSchema);

module.exports = accountDetails;