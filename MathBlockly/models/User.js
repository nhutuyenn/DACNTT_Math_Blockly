const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: [true, 'Người dùng đã tồn tại'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'Email đã tồn tại'],
    validate: {
      validator: validator.isEmail,
      message: 'Vui lòng nhập email hợp lệ'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Mật khẩu phải có tối thiểu 6 kí tự']
  },
  re_password: {
    type: String
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
  },

  otp: {
    type: String
  },

  optExpires: {
    type: Date
  },
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