const websiteName = 'RACO AI';

class MailTemplate {
    forgotPassword = (name, otp) => {
        const subject = `Recover your ${websiteName} password`;
        const text = `Hey ${name}😎\nHow is your day? It will be fantastic I guess!😁\nDid you forgot your password! Don't worry we are here to help you.\nUse this OTP (One Time Password) to choose a new one. \n\n ${otp} \n\n If you didn't make this request, you can safely ignore this email :)`;
        return { subject, text };
    }

    invitationMail = (type, link) => {
        const subject = `Invitation to join ${websiteName} as ${type}`;
        const text = `Welcome to ${websiteName}!😎\n\nYou have been invited to join our team as a ${type}.\n\nPlease click the link below to complete your registration and set up your profile:\n\n${link}\n\nNote: This link is valid for 24 hours and can only be used once.\n\nBest regards,\nTeam ${websiteName}`;
        return { subject, text };
    }

}

module.exports = new MailTemplate();
