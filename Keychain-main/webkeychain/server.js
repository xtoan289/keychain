const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
const port = 3000;

// Middleware để xử lý dữ liệu gửi từ form
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Middleware cho session
app.use(session({
  secret: 'your-secret-key', // Khóa bí mật để mã hóa session ID (thay thế bằng khóa thật của bạn)
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Đặt là true nếu bạn dùng HTTPS
}));

// Mô phỏng cơ sở dữ liệu người dùng (trong thực tế bạn sẽ dùng database thật)
const users = [];

// Hàm kiểm tra đăng nhập
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next(); // Cho phép truy cập nếu đã đăng nhập
  } else {
    res.status(401).json({ message: 'Bạn cần đăng nhập để thực hiện hành động này.' });
    // Hoặc bạn có thể chuyển hướng về trang đăng nhập: res.redirect('/dang-nhap.html');
  }
}

// API kiểm tra trạng thái đăng nhập
app.get('/api/check-login', (req, res) => {
  res.json({ isLoggedIn: !!req.session.userId });
});

// API đăng ký
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
  }
  if (users.find(user => user.username === username)) {
    return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại.' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ id: Date.now(), username, password: hashedPassword });
  res.json({ success: true, message: 'Đăng ký thành công.' });
});

// API đăng nhập
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
  }
  req.session.userId = user.id; // Lưu thông tin người dùng vào session
  res.json({ success: true, message: 'Đăng nhập thành công.' });
});

// Middleware bảo vệ trang giỏ hàng (ví dụ)
app.get('/giohang.html', isLoggedIn, (req, res) => {
  res.sendFile(__dirname + '/giohang.html'); // Giả sử bạn có trang giohang.html
});

// Phục vụ các tệp tĩnh (HTML, CSS, JS)
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});