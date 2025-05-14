module.exports = {
  // the "email" object gets sent to node-mailer. See https://github.com/andris9/Nodemailer#e-mail-message-fields for
  // formatting details and additional fields that can be included (cc, bcc, etc.)
  email: {
    to: 'EMAIL',
    from: 'FROM_NAME <EMAIL>',
    subject: '[APP_NAME] Server error',
  },
  smtpHosts: ['owgusbp1dom03.owex.corp', 'owgusbp1dom01.owex.corp', 'owgusbp1ftp01.owex.corp'],
};
