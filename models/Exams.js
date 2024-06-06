const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    otp: { type: String, required: true, unique: true },
    questions: { type: [String], required: true },
});

module.exports = mongoose.model('Exam', examSchema);