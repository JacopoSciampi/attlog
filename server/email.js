const nodemailer = require("nodemailer");

class JekoEmailer {
    config = {};
    transporter = null;

    __init__(data) {
        this.config = data;
        this.transporter = null;

        this.transporter = nodemailer.createTransport({
            host: this.config.set_mail_smtp,
            port: this.config.set_mail_port,
            secure: this.config.set_mail_ssl === "true" ? true : false,
            auth: {
                user: this.config.set_mail_user,
                pass: this.config.set_mail_pass,
            }
        });
    }

    _formatDate(dateString) {
        const timestamp = parseInt(dateString);
        const date = new Date(timestamp);

        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
    }

    sendMailTerminalOffline(terminal) {
        console.log(this.config)
        return new Promise((resolve, reject) => {
            try {
                resolve(this.transporter.sendMail({
                    from: `"Rilevazione presenze" <${this.config.set_mail_sender}>`,
                    to: this.config.set_mail_receiver_list, // mail, mail2, mail3, ...
                    subject: `Report terminale: ${terminal.c_sn} offline`,
                    html: `
                    <html>
                        <body>
                            <div>
                            <strong>Informazioni terminale</strong>
                            </div>

                            <table style="border-collapse: collapse; width: 100%;">
                            <thead>
                                <tr>
                                <th style="border: 1px solid #ccc; padding: 8px;">Terminale</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Nome</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Modello</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Descrizione</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Ubicazione</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Cliente</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">IP Locale</th>
                                <th style="border: 1px solid #ccc; padding: 8px;">Stato</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.c_sn}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.c_name}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.c_model}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.c_desc}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.c_location}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.customer_name}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">${terminal.c_local_ip}</td>
                                <td style="border: 1px solid #ccc; padding: 8px;">Ultimo check: ${this._formatDate(terminal.c_last_timestamp)}</td>
                                </tr>
                            </tbody>
                            </table>
                        </body>
                    </html>
                    `
                }));
            } catch (e) {
                console.log('error' + e);
                reject();
            }
        });
    }
}

module.exports = JekoEmailer