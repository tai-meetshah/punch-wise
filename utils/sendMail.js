const Mailjet = require('node-mailjet');
// const generateInvoicePdf = require('../utils/generateInvoicePdf');

const mailjet = new Mailjet({
    apiKey: process.env.MJ_APIKEY_PUBLIC,
    apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

//! Add CLIENT_URL in env file

const logoLink = `${process.env.RENDER_URL}/uploads/logo.jpg`;

const sendOtp = function (to, otp) {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MJ_FROM,
                    Name: process.env.MJ_NAME,
                },
                To: [{ Email: to }],
                Subject: 'Reset Password',
                HTMLPart: `
            <div style="font-family: Helvetica, Arial, sans-serif; min-width: 900px; overflow: auto; line-height: 2; font-size: 1.1em;">
                <div style="margin: 50px auto; width:70%; padding: 20px 0;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL}" style="font-size:1.4em; color: #004D7F; text-decoration:none; font-weight:600;">
                    <img src="${logoLink}" alt="Raffle Rush" width="100">
                    </a>
                </div>
                <p style="font-size: 1.1em;">Hello,</p>
                <p>We received a request to reset the password for your account associated with this email address. If you made this request, please use OTP given below to reset your password:</p>
                <h2 style="background: #004D7F; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
                <p>For security reasons, this OTP will expire in 5 minutes from the time this email was sent.</p>
                <p>If you didn't request a password reset, please ignore this email. Your account will remain safe as long as you don't share this OTP with anyone.</p>
                <p style="font-size: 0.9em;">Regards,<br />Raffle Rush</p>
                </div>
            </div>`,
            },
        ],
    });

    request.catch(error => {
        console.error('Error sending email', error);
    });
};

const sendVerificationEmail = function (to, otp) {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MJ_FROM,
                    Name: process.env.MJ_NAME,
                },
                To: [{ Email: to }],
                Subject: 'Welcome to Raffle Rush',
                HTMLPart: `
                <div style="font-family: Helvetica, Arial, sans-serif; min-width: 900px; overflow: auto; line-height: 2; font-size: 1.1em;">
                    <div style="margin: 50px auto; width:70%; padding: 20px 0;">
                        <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
                            <a href="${process.env.CLIENT_URL}" style="font-size:1.4em; color: #004D7F; text-decoration:none; font-weight:600;">
                                <img src="${logoLink}" alt="Raffle Rush" width="100">
                            </a>
                        </div>
                        <p style="font-size: 1.1em;">Welcome to Raffle Rush!</p>
                        <p>Get ready for an amazing experience with our platform.</p>
                        <h2 style="background: #004D7F; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
                        <p>Please use the above OTP for email verification. For security reasons, this OTP will expire in 5 minutes from the time this email was sent.</p>
                        <p>If you didn't sign up for Raffle Rush, please ignore this email.</p>
                        <p style="font-size: 0.9em;">Regards,<br />Raffle Rush</p>
                    </div>
                </div>`,
            },
        ],
    });

    request.catch(error => {
        console.error('Error sending email', error);
    });
};

const sendEmail = function (to, subject, content) {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MJ_FROM,
                    Name: process.env.MJ_NAME,
                },
                To: [{ Email: to }],
                Subject: subject,
                HTMLPart: content,
            },
        ],
    });

    request.catch(error => {
        console.error('Error sending email', error);
    });
};

const sendCongratulationsEmail = function (to, offer) {
    const subject = 'Congratulations! You are the winner!';
    const content = `
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 900px; overflow: auto; line-height: 2; font-size: 1.1em;">
            <div style="margin: 50px auto; width:70%; padding: 20px 0;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL}" style="font-size:1.4em; color: #004D7F; text-decoration:none; font-weight:600;">
                        <img src="${logoLink}" alt="Logo" width="100">
                    </a>
                </div>
                <p style="font-size: 1.1em;">Hello,</p>
                <p>Congratulations! You are the winner of the offer - <strong>${offer.title}</strong>.</p>
                <p>Your Claim No is <strong>${offer.claimNo}</strong>.</p>

                <p style="font-size: 0.9em;">Regards,<br />Raffle Rush</p>
            </div>
        </div>`;

    sendEmail(to, subject, content);
};

const sendClaimEmail = function (vendorEmail, userName, offerName) {
    const subject = 'Claim Number Entered';
    const content = `
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 900px; overflow: auto; line-height: 2; font-size: 1.1em;">
            <div style="margin: 50px auto; width:70%; padding: 20px 0;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL}" style="font-size:1.4em; color: #004D7F; text-decoration:none; font-weight:600;">
                        <img src="${logoLink}" alt="Logo" width="100">
                    </a>
                </div>
                <p style="font-size: 1.1em;">Hello,</p>
                <p><strong>${userName}</strong> has entered a valid claim number for the offer - <strong>${offerName}</strong>.</p>

                <p style="font-size: 0.9em;">Regards,<br />Raffle Rush</p>
            </div>
        </div>`;

    sendEmail(vendorEmail, subject, content);
};

const sendEmailWithAttachments = function (to, subject, content, attachments) {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
            {
                From: {
                    Email: process.env.MJ_FROM,
                    Name: process.env.MJ_NAME,
                },
                To: [{ Email: to }],
                Subject: subject,
                HTMLPart: content,
                Attachments: attachments,
            },
        ],
    });

    request
        .then(response => {
            console.log('Email sent successfully:', response.body);
        })
        .catch(error => {
            console.error('Error sending email', error);
        });

    // request.catch(error => {
    //     console.error('Error sending email', error);
    // });
};

const sendAcceptanceEmail = async function (to, vendorData) {
    // const pdfBuffer = await generateInvoicePdf(vendorData);

    const pdfBase64 = pdfBuffer.toString('base64');

    const subject = 'Vendor Application Accepted';
    const content = `
         <div style="font-family: Helvetica, Arial, sans-serif; min-width: 900px; overflow: auto; line-height: 2; font-size: 1.1em;">
            <div style="margin: 50px auto; width:70%; padding: 20px 0;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL}" style="font-size:1.4em; color: #004D7F; text-decoration:none; font-weight:600;">
                        <img src="${logoLink}" alt="Logo" width="100">
                    </a>
                </div>
                <p style="font-size: 1.1em;">Hello,</p>
                <p>We are pleased to inform you that your vendor application request has been accepted.</p>
                <p>You can now access the application with your credentials and add offers.</p>
                <p>Please find the following resources to get started.</p>
                <ul>
                    <li><strong>QR Code Image</strong></li>
                    <li><strong>PDF Guide: All your details are in PDF.</strong></li>
                </ul>
                <p>If you have any questions or need further assistance, please feel free to reach out.</p>
                <p style="font-size: 0.9em;">Regards,<br />Raffle Rush</p>
            </div>
        </div>`;

    const attachments = [
        {
            ContentType: 'application/pdf',
            Filename: 'Vendor_Guide.pdf',
            Base64Content: pdfBase64,
        },
    ];

    sendEmailWithAttachments(to, subject, content, attachments);
};

const sendRejectionEmail = function (to) {
    const subject = 'Vendor Application Rejected';
    const content = `
        <div style="font-family: Helvetica, Arial, sans-serif; min-width: 900px; overflow: auto; line-height: 2; font-size: 1.1em;">
            <div style="margin: 50px auto; width:70%; padding: 20px 0;">
                <div style="border-bottom: 1px solid #eee; padding-bottom: 20px;">
                    <a href="${process.env.CLIENT_URL}" style="font-size:1.4em; color: #004D7F; text-decoration:none; font-weight:600;">
                        <img src="${logoLink}" alt="Logo" width="100">
                    </a>
                </div>
                <p style="font-size: 1.1em;">Hello,</p>
                <p>We regret to inform you that your vendor application request has been rejected.</p>

                <p style="font-size: 0.9em;">Regards,<br />Raffle Rush</p>
            </div>
        </div>`;

    sendEmail(to, subject, content);
};

const sendEmailWithCSV = async (to, content) => {
    try {
        const request = mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: process.env.MJ_FROM,
                        Name: process.env.MJ_NAME,
                    },
                    To: to,
                    Subject: 'Vendor Data',
                    TextPart: 'Please find attached vendor data CSV file.',
                    Attachments: [
                        {
                            ContentType: 'text/csv',
                            Filename: 'vendors.csv',
                            Base64Content:
                                Buffer.from(content).toString('base64'),
                        },
                    ],
                },
            ],
        });

        const result = await request;
        console.log('result.body: ', result.body);

        return result.body;
    } catch (error) {
        console.log('error: ', error);
        throw new Error('Error sending email: ' + error.message);
    }
};

module.exports = {
    sendOtp,
    sendVerificationEmail,
    sendAcceptanceEmail,
    sendRejectionEmail,
    sendEmailWithCSV,
    sendCongratulationsEmail,
    sendClaimEmail,
};
