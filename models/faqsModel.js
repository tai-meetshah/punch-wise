const mongoose = require('mongoose');

const faqsSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, 'Question is required.'],
        trim: true,
    },
    answer: {
        type: String,
        required: [true, 'Answer is required.'],
        trim: true,
    },
});

module.exports.SalesmanFAQ = mongoose.model('SalesmanFAQ', faqsSchema);

module.exports.ManagerFAQ = mongoose.model('ManagerFAQ', faqsSchema);

module.exports.CompanyFAQ = mongoose.model('CompanyFAQ', faqsSchema);
