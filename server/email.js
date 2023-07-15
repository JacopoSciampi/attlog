const nodemailer = require("nodemailer");

class JekoEmailer {
    transporter = null;

    __init__() {
        this.transporter = nodemailer.createTransport({
            host: "smtp",
            port: 111,
            secure: false,
            auth: {
                user: 'asdasdas.dasdasd@ddasdsa.com',
                pass: '1234ff1ff13f133f1'
            }
        });
    }

    sendMailTerminalOffline() {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.transporter.sendMail({
                    from: '"Test 👻" <asfasg.asgddsag@gsagasd.com>',
                    to: "gsagsda.gsdag@gasdgasd.com", // mail, mail2, mail3, ...
                    subject: "gasdgasd ✔",
                    text: "Hegllo world?",
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