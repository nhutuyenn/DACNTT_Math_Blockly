const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (id) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '3d',
  });
}

const getUserIdFromToken = (token) => {
    try {
      const decoded = jwt.verify(token, 'secret');
      return decoded.id;
    } catch (err) {
      console.log(err);
      return null;
    }
};

module.exports.register_get = (req, res) => {
    res.render('RegisterPage');
}

// authController.js

const handleErrors = (err) => {
  let errors = { email: '', password: '', username: '' };

  const errorMessages = {
      'incorrect email': 'That email is not registered',
      'incorrect password': 'That password is incorrect',
      'incorrect username': 'That username is not registered'
  };

  // duplicate email error
  if (err.code === 11000) {
      if (err.keyValue.email) {
          errors.email = 'Email is already registered';
      } else if (err.keyValue.username) {
          errors.username = 'Username is already taken';
      }
      return errors;
  }

  // validation errors
  if (err.message.includes('User validation failed')) {
      Object.values(err.errors).forEach(({ properties }) => {
          errors[properties.path] = properties.message;
      });
  }

  // check for other errors
  if (errorMessages[err.message]) {
      const errorType = err.message.split(' ')[1]; // get the error type (email, password, username)
      errors[errorType] = errorMessages[err.message];
  }

  return errors;
};
  

module.exports.register_post = async (req, res) => {
    const { username, email, password } = req.body;

    // Kiểm tra xem tất cả các trường đã được điền đủ hay chưa
    // if (!username || !email || !password) {
    //     return res.status(400).json({ error: 'Vui lòng điền đầy đủ các trường' });
    // }

    try {
        // Kiểm tra xem email đã được sử dụng chưa
        const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({ error: 'Email đã được sử dụng' });
        // }

        // Tạo và lưu user mới vào cơ sở dữ liệu
        const user = new User({ username, email, password });
        await user.save();

        const token = createToken(user._id); // Tạo token cho user
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 }); // Luu token với 3 ngày

        // Gửi phản hồi thành công cho client
        res.status(201).json({ user: user._id });

    } catch (error) {
        // Xử lý lỗi và gửi phản hồi lỗi cho client
        console.error(error);
        const errors = handleErrors(error);
        res.status(500).json({ errors });
    }

    console.log(username, email, password);
};

module.exports.login_get = (req, res) => {
    res.render('LoginPage');
}

module.exports.login_post = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.login(username, password);
        const token = createToken(user._id); // Tạo token cho user
        res.cookie('jwt', token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 * 1000 }); // Luu token với 3 ngày
        res.status(200).json({ user: user._id });
    } catch (error) {
        const errors = handleErrors(error);
        res.status(500).json({ errors });
        console.log(error);
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/login');
}