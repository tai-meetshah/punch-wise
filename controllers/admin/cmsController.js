const deleteFile = require('../../utils/deleteFile');
const Page = require('../../models/pageModel');
const Contact = require('../../models/contactModel');
const { UserFAQ, VendorFAQ } = require('../../models/faqsModel');

exports.getTerms = async (req, res) => {
    try {
        const page = await Page.findOne({ key: 'termsConditions' });
        res.render('terms', { page });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.postTerms = async (req, res) => {
    try {
        const page = await Page.findOne({ key: 'termsConditions' });
        console.log('page: ', page);
        if (!page) {
            // Page.create({
            //     key: 'termsConditions',
            //     title: 'termsConditions',
            //     content: 'tests',
            // });
            req.flash('red', 'Page not found');
            return res.redirect('/admin');
        }
        page.title = req.body.title;
        page.content = req.body.EnContent;

        if (req.file) {
            deleteFile(page.image);
            page.image = `/uploads/${req.file.filename}`;
        }

        await page.save();

        req.flash('green', 'Terms & conditions updated successfully.');
        res.redirect('/cms/terms');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.getPrivacy = async (req, res) => {
    try {
        const page = await Page.findOne({ key: 'privacy' });
        res.render('privacy', { page });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.postPrivacy = async (req, res) => {
    try {
        const page = await Page.findOne({ key: 'privacy' });
        if (!page) {
            req.flash('red', 'Page not found');
            return res.redirect('/admin');
        }
        page.title = req.body.title;
        page.content = req.body.EnContent;

        if (req.file) {
            deleteFile(page.image);
            page.image = `/uploads/${req.file.filename}`;
        }

        await page.save();

        req.flash('green', 'Privacy notice updated successfully.');
        res.redirect('/cms/privacy');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.getContact = async (req, res) => {
    try {
        let contact = await Contact.findOne();
        if (!contact) contact = await Contact.create({});

        res.render('contact', { contact });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.postContact = async (req, res) => {
    try {
        const contact = await Contact.findOne();

        contact.address = req.body.address;
        contact.phone = req.body.phone;
        contact.email = req.body.email;

        await contact.save();

        req.flash('green', 'Contact us updated successfully.');
        res.redirect('/cms/contact');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

// Vendor FAQs
exports.getVendorFAQs = async (req, res) => {
    try {
        const faqs = await VendorFAQ.find().sort('-_id');
        res.render('vendor_faqs', { faqs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.getAddVendorFAQ = (req, res) => res.render('vendor_faqs_add');

exports.postAddVendorFAQ = async (req, res) => {
    try {
        await VendorFAQ.create({
            question: req.body.question,
            answer: req.body.answer,
        });

        req.flash('green', 'FAQ added successfully.');
        res.redirect('/cms/vendor/faqs');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.getEditVendorFAQ = async (req, res) => {
    try {
        const faq = await VendorFAQ.findById(req.params.id);
        if (faq == null) {
            req.flash('red', 'FAQ not found!');
            return res.redirect('/cms/vendor/faqs');
        }

        res.render('vendor_faqs_edit', { faq });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'FAQ not found!');
            res.redirect('/cms/vendor/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect('/cms/vendor/faqs');
        }
    }
};

exports.postEditVendorFAQ = async (req, res) => {
    try {
        const faq = await VendorFAQ.findById(req.params.id);

        if (faq == null) {
            req.flash('red', 'FAQ not found!');
            return res.redirect('/cms/vendor/faqs');
        }

        faq.question = req.body.question;
        faq.answer = req.body.answer;

        await faq.save();

        req.flash('green', 'FAQ edited successfully.');
        res.redirect('/cms/vendor/faqs');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'FAQ not found!');
            res.redirect('/cms/vendor/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect(req.originalUrl);
        }
    }
};

exports.getdeleteVendorFAQ = async (req, res) => {
    try {
        await VendorFAQ.findByIdAndDelete(req.params.id);

        req.flash('green', 'FAQ deleted successfully.');
        res.redirect('/cms/vendor/faqs');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', 'FAQ not found!');
            res.redirect('/cms/vendor/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect('/cms/vendor/faqs');
        }
    }
};

// User FAQs
exports.getUserFAQs = async (req, res) => {
    try {
        const faqs = await UserFAQ.find().sort('-_id');
        res.render('user_faqs', { faqs });
    } catch (error) {
        req.flash('red', error.message);
        res.redirect('/');
    }
};

exports.getAddUserFAQ = (req, res) => res.render('user_faqs_add');

exports.postAddUserFAQ = async (req, res) => {
    try {
        await UserFAQ.create({
            question: req.body.question,
            answer: req.body.answer,
        });

        req.flash('green', 'FAQ added successfully.');
        res.redirect('/cms/user/faqs');
    } catch (error) {
        req.flash('red', error.message);
        res.redirect(req.originalUrl);
    }
};

exports.getEditUserFAQ = async (req, res) => {
    try {
        const faq = await UserFAQ.findById(req.params.id);
        if (faq == null) {
            req.flash('red', 'FAQ not found!');
            return res.redirect('/cms/user/faqs');
        }

        res.render('user_faqs_edit', { faq });
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'FAQ not found!');
            res.redirect('/cms/user/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect('/cms/user/faqs');
        }
    }
};

exports.postEditUserFAQ = async (req, res) => {
    try {
        const faq = await UserFAQ.findById(req.params.id);

        if (faq == null) {
            req.flash('red', 'FAQ not found!');
            return res.redirect('/cms/user/faqs');
        }

        faq.question = req.body.question;
        faq.answer = req.body.answer;

        await faq.save();

        req.flash('green', 'FAQ edited successfully.');
        res.redirect('/cms/user/faqs');
    } catch (error) {
        if (error.name === 'CastError') {
            req.flash('red', 'FAQ not found!');
            res.redirect('/cms/user/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect(req.originalUrl);
        }
    }
};

exports.getdeleteUserFAQ = async (req, res) => {
    try {
        await UserFAQ.findByIdAndDelete(req.params.id);

        req.flash('green', 'FAQ deleted successfully.');
        res.redirect('/cms/user/faqs');
    } catch (error) {
        if (error.name === 'CastError' || error.name === 'TypeError') {
            req.flash('red', 'FAQ not found!');
            res.redirect('/cms/user/faqs');
        } else {
            req.flash('red', error.message);
            res.redirect('/cms/user/faqs');
        }
    }
};
