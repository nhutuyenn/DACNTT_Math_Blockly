const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: [true, 'Username already exists'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email already exists'],
    validate: {
      validator: validator.isEmail,
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String
  },

  phone: {
    type: String,
  },

  dateBirth: {
    type: String,
  },

  school: {
    type: String,
  },

  active: {
    type: Boolean
  },

  classroomID: [{
    type: Schema.Types.ObjectId,
  }],

  role: {
    type: String,
    default: 'student'
  }
});

// Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.static('login', async function (username, password) {
  const user = await this.findOne({ username });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw new Error('incorrect password'); // Không để lộ chi tiết
  }
  throw new Error('incorrect username');
});

const User = mongoose.model('User', userSchema);

module.exports = User;