const transport = require('../configs/mail-config');
const mailTemplate = require('../templates/mail-template');
const smtpAuthUser = process.env.SMTP_AUTH_USER || 'socialcodia@gmail.com';

class MailService {


    sendForgotPasswordMail = async (name, email, otp) => {
        const { subject, text } = mailTemplate.forgotPassword(name, otp);
        return await this.sendMail(email, subject, text);
    }

    sendInvitationMail = async (email, type, link) => {
        const { subject, text } = mailTemplate.invitationMail(type, link);
        return await this.sendMail(email, subject, text);
    }


    sendMail = async (to, subject, text) => {
        const mailOption = {
            from: smtpAuthUser,
            to,
            subject,
            text
        }

        return await transport.sendMail(mailOption);
    }

}

module.exports = new MailService();
