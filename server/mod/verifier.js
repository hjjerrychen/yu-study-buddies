const NodeCache = require("node-cache");
const {MailClient} = require("./email");
const fs = require("fs");

class Verifier {

    TTL = 60 * 5;

    #cache;
    #emailClient;
    #template = fs.readFileSync(__dirname + "/template.html");

    constructor() {
        this.#cache = new NodeCache({stdTTL: 60 * 5, checkperiod: 30});
        this.#emailClient = new MailClient();
    }

    hasCode(username) {
        return Boolean(this.getCode(username));
    }

    getCode(username) {
       return this.#cache.get(username);
    }

    createCode(username) {
        let cachedCode = this.getCode(username);

        if (cachedCode != null) {
            return cachedCode;
        }

        const newCode = Math.floor(100000 + Math.random() * 900000);
        this.#cache.set(username, newCode, this.TTL);
        return newCode;
    }

    checkCodeTime(username) {
        let expiresAt = this.#cache.getTtl(username);
        if (!expiresAt) return null;
        let time = Date.now();
        return Math.round(Math.max(0, (expiresAt - time) || 0) / 1000);
    }

    checkCode(username, checkedCode) {
        let cachedCode = this.getCode(username);

        if (cachedCode === parseInt(checkedCode)) {
            this.#cache.del(username);
            return true;
        }

        return false;
    }

    async sendCode(username, code) {
        return await this.#emailClient.sendEmail(
            "Verification Code",
            (this.#template + "").replace("%code%", code),
            `${username}@my.yorku.ca`
        )
    }

}

module.exports = {
    Verifier
}
