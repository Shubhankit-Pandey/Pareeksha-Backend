const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path'); 
require('dotenv').config();

const Exam = require('./models/Exams');
const User = require('./models/User');
const Submission = require('./models/Submissions');

const app = express();
const port = 3000;

const url = process.env.MONGO_URL;
console.log(url);

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

app.post('/api/submissions', async (req, res) => {
  try {
      const { otp, pdfName } = req.body;

      const newSubmission = new Submission({
          otp,
          pdfName,
      });

      await newSubmission.save();
      console.log('Submission saved successfully');
      res.status(200).json({ success: true, message: 'Submission saved successfully' });
  } catch (error) {
      console.error('Error saving submission:', error);
      res.status(500).json({ success: false, message: 'Failed to save submission' });
  }
});


app.get('/api/exams/:otp', async (req, res) => {
    try {
        const { otp } = req.params;
        const exam = await Exam.findOne({ otp });
        if (exam) {
            res.json({ success: true, questions: exam.questions });
        } else {
            res.status(404).json({ success: false, message: 'Exam not found' });
        }
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.get('/api/submissions/:otp', async (req, res) => {
    try {
        const { otp } = req.params;
        const submissions = await Submission.find({ otp });
        res.status(200).json({ success: true, submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch submissions' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && bcrypt.compareSync(password, user.password)) {
            res.json({ success: true, user });
        } else {
            res.json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        res.json({ success: true, user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/exams', async (req, res) => {
    const { otp, questions } = req.body;
    try {
        const newExam = new Exam({ otp, questions });
        await newExam.save();

        res.json({ success: true, exam: newExam });
    } catch (error) {
        console.error('Error creating exam:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        const exam = await Exam.findOne({ otp });
        console.log(exam);
        if (exam) {
            console.log(exam);
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    } catch (error) {
        console.error('Error verifying OTP: backend', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
