const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");


class EmailClient {

    #apiKey = process.env.MAILER_SEND_TOKEN;

    #mailerSend;
    #sentFrom;

    constructor() {

        this.#mailerSend = new MailerSend({apiKey: this.#apiKey});
        this.#sentFrom = new Sender("verify@yorku.dev", "Study Buddies");

    }

    #getRecipients(...emailAddresses) {
        const recipients = [];

        for (let address of emailAddresses) {
            recipients.push(
                new Recipient(address, address)
            )
        }

        return recipients;
    }

    async sendEmail(subject, html, ...emailAddresses) {

        const params = new EmailParams()
            .setFrom(this.#sentFrom)
            .setTo(this.#getRecipients(...emailAddresses))
            .setSubject(subject)
            .setHtml(html);

        try {
            return await this.#mailerSend.email.send(params);
        } catch (ex) {
            return ex;
        }
    }

}

module.exports = {
    MailClient: EmailClient
}
