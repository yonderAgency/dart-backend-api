module.exports.email = {
    transporter: {
        host: 'smtp.gmail.com',
        port: 465,
        // ignoreTLS: true,
        secure: true,
        auth: {
            user: 'jerry@jerryondemand.com',
            pass: 'Miracle@#256'
        }
    },
    from: 'jerry@jerryondemand.com',
    testMode: false
};
