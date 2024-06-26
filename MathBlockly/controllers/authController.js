const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createToken = (id) => {
  return jwt.sign({ id }, 'secret', {
    expiresIn: '3d',
  });
}

module.exports.register_get = (req, res) => {
    res.render('RegisterPage');
}

// authController.js

const handleErrors = (err) => {
  let errors = { email: '', password: '', username: '', re_password: '' };

  const errorMessages = {
      'incorrect email': 'Email chưa được đăng kí',
      'incorrect password': 'Mật khẩu không chính xác',
      'incorrect username': 'Tên người dùng chưa được đăng kí',
      'incorrect re-password': 'Mật khẩu nhập lại không trùng khớp',
  };

  // duplicate email error
  if (err.code === 11000) {
      if (err.keyValue.email) {
          errors.email = 'Email đã được đăng kí';
      } else if (err.keyValue.username) {
          errors.username = 'Tên người dùng đã tồn tại';
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
    const { username, email, password, re_password } = req.body;

    // Kiểm tra xem tất cả các trường đã được điền đủ hay chưa
    // if (!username || !email || !password) {
    //     return res.status(400).json({ error: 'Vui lòng điền đầy đủ các trường' });
    // }

    try {
        // Kiểm tra xem email đã được sử dụng chưa
        // const existingUser = await User.findOne({ email });
        // if (existingUser) {
        //     return res.status(400).json({ error: 'Email đã được sử dụng' });
        // }

        // Tạo và lưu user mới vào cơ sở dữ liệu
        const user = new User({ username, email, password, re_password });
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