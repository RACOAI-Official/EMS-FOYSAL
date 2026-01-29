const nodeMailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST;
const smtpPort = parseInt(process.env.SMTP_PORT);
const smtpSecure = process.env.SMTP_SECURE === 'true';
const smtpRequireTLS = process.env.SMTP_REQUIRE_TLS === 'true';
const smtpAuthUser = process.env.SMTP_AUTH_USER;
const smtpAuthPass = process.env.SMTP_AUTH_PASS;

const config = {
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    requireTLS: smtpRequireTLS,
    auth: {
        user: smtpAuthUser,
        pass: smtpAuthPass
    },
    tls: {
        // Do not fail on invalid certs (common with antivirus/firewalls)
        rejectUnauthorized: false
    }
};

// If it's Gmail, sometimes the service shorthand works better
if (smtpHost === 'smtp.gmail.com') {
    delete config.host;
    delete config.port;
    delete config.secure;
    config.service = 'gmail';
}

const transport = nodeMailer.createTransport(config);

module.exports = transport;
