const nodemailer = require("nodemailer");

class JekoEmailer {
    transporter = null;

    __init__() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: 'timbrature.semprebonlux@gmail.com',
                pass: 'jjdnnzyaykzoghng'
            }
        });
    }

    sendMailTerminalOffline() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.transporter.sendMail({
                    from: '"Test 👻" <timbrature.semprebonlux@gmail.com>',
                    to: "sciampi.jacopo@gmail.com", // mail, mail2, mail3, ...
                    subject: "Hello ✔",
                    text: "Hello world?",
                    //html: "<b>Hello world?</b>",
                }));
            } catch (e) {
                console.log('error' + e);
                reject();
            }
        });
    }
}

module.exports = JekoEmailer