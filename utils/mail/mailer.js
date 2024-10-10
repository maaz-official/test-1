const nodemailer = require('nodemailer');
const ApiError = require('../api/apiError');

/**
 * Sends an email using Nodemailer.
 * @param {string} to - Recipient's email address.
 * @param {string} subject - Email subject.
 * @param {string} text - Email content.
 * @throws {ApiError} - Throws an error if email sending fails.
 */
const sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_FROM,
        to,
        subject,
        text,
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new ApiError(500, 'Email sending failed.');
    }
};

module.exports = { sendEmail };
