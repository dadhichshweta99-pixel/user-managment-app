const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');

const User = require('./models/User');

const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: 'secretKey',
    resave: false,
    saveUninitialized: false
}));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB Connected"))
.catch(err => console.log(err));
mongoose.set('strictQuery', false);

// Routes

// Home
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Signup Page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Signup Logic
const bcrypt = require('bcryptjs'); // add at top of file

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        password: hashedPassword
    });

    await user.save();
    res.redirect('/login');
});

// Login Page
app.get('/login', (req, res) => {
    res.render('login');
});

// Login Logic
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.send("User not found");
    }

    const bcrypt = require('bcryptjs');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.send("Wrong password");
    }

    req.session.userId = user._id;

    res.redirect('/dashboard');

  } catch (err) {
    console.log(err);
    res.send("Login Error: " + err.message);
  }
});

// Dashboard (Protected)
app.get('/dashboard', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.redirect('/login');
    }

    const user = await User.findById(req.session.userId);

    if (!user) {
      return res.send("User not found");
    }

    res.render('dashboard', { user });

  } catch (err) {
    console.log("Dashboard Error:", err);
    res.send("Dashboard Error: " + err.message);
  }
});

// Delete User
app.get('/delete/:id', async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard');
});

// Edit Page
app.get('/edit/:id', async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('edit', { user });
});

// Update User
app.post('/edit/:id', async (req, res) => {
    const { name, email } = req.body;

    await User.findByIdAndUpdate(req.params.id, { name, email });
    res.redirect('/dashboard');
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});