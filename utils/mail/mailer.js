const nodemailer = require('nodemailer');
const { getAllConfig } = require('./path/to/config'); // Adjust the path accordingly
const ApiError = require('../api/apiError');

/**
 * Sends an email using Nodemailer.
 * @param {Object} options - Email options.
 * @param {string} options.to - Recipient's email address.
 * @param {string} options.subject - Email subject.
 * @param {string} options.text - Plain text email content.
 * @param {string} [options.html] - HTML email content (optional).
 * @param {Array<string>} [options.cc] - CC email addresses (optional).
 * @param {Array<string>} [options.bcc] - BCC email addresses (optional).
 * @param {Array<Object>} [options.attachments] - Email attachments (optional).
 * @throws {ApiError} - Throws an error if email sending fails.
 */
const sendEmail = async ({
    to,
    subject,
    text,
    html = null,
    cc = [],
    bcc = [],
    attachments = [],
}) => {
    const config = getAllConfig(); // Get the configuration object
    const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465, // true for 465, false for other ports
        auth: {
            user: config.smtp.user,
            pass: config.smtp.pass,
        },
    });

    const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        text,
        html, // HTML content
        cc: cc.join(', '), // Convert array to comma-separated string
        bcc: bcc.join(', '), // Convert array to comma-separated string
        attachments, // Attachments array
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId); // Log message ID for reference
    } catch (error) {
        throw new ApiError(500, 'Email sending failed: ' + error.message);
    }
};

module.exports = { sendEmail };

// (async () => {
//     try {
//         await sendEmail({
//             to: 'recipient@example.com',
//             subject: 'Welcome to Our Service!',
//             text: 'Thank you for signing up. We are glad to have you!',
//             html: '<strong>Thank you for signing up.</strong> We are glad to have you!',
//             cc: ['cc@example.com'],
//             bcc: ['bcc@example.com'],
//             attachments: [
//                 {
//                     filename: 'invoice.pdf',
//                     path: '/path/to/invoice.pdf', // Path to the attachment file
//                 },
//             ],
//         });
//         console.log('Email sent successfully!');
//     } catch (error) {
//         console.error('Failed to send email:', error.message);
//     }
// })();