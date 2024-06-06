const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    otp:String,
    pdfName: String,
});

module.exports = mongoose.model('Submission', submissionSchema);    