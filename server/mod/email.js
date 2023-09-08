const Email = require('aws-sdk');
Email.config.update({region: process.env.AWS_REGION});

function buildEmail(sendAddress, verificationCode) {
    return {
        Destination: {
            ToAddresses: [sendAddress]
        },
        Message: {
            Body: {
                Text: {
                    Charset: "UTF-8",
                    Data: `Your verification code is: ${verificationCode}.`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Study Buddies: Verification Code'
            }
        },
        Source: 'Study Buddies <verify@yorku.dev>'
    }
}


async function sendEmail(sendAddress, verificationCode) {
    try {
        await (
            new Email.SES()
                .sendEmail(buildEmail(sendAddress, verificationCode))
                .promise()
        );
        return true;
    } catch (ex) {
        console.log(ex.stack)
        return false;
    }

}

module.exports = {
    sendEmail
}
