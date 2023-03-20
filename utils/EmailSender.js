const nodemailer = require('nodemailer');

async function sendEmail(verificationLink){
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'spinfy.off@gmail.com',
            pass: 'yenqrufvolryakkt',
        },
    });

    let mailoption = {
        from: 'spinfy.off@gmail.com',
        to: 'artem.amc220@gmail.com',
        subject: 'Test Email',
        text: 'This is a test email from Node.js.',
        text: `Для подтверждения регистрации перейдите по ссылке: ${verificationLink}`,

    };

    let info = await transporter.sendMail(mailoption);

    console.log('Message sent: %s', info.messageId);
}

module.exports = sendEmail;