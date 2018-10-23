'use strict';

const nodemailer = require('nodemailer');

const {type, immutable} = require('./utils');

class Emailer {
  constructor(options) {
    immutable(this, 'config', new EmailerConfig(options));
  }

  async send(options) {
    type(options, ['email', 'subject', 'text'], 'string');

    const mail = {
      to: options.email,
      subject: options.subject,
      text: options.text
    };

    return new Promise((resolve, reject) => {
      let result = {
        email: options.email
      };

      this.config.transporter.sendMail(mail, function(err, response) {
        if (err)
          return reject(err);

        result.message = response;
        resolve(result);
      });
    });
  }
}

class EmailerConfig {
  constructor(options) {
    type(options, ['host', 'from'], 'string');
    type(options, ['port'], 'number');
    type(options, ['secure'], 'boolean');
    type(options, ['auth'], 'object');
    type(options.auth, ['user', 'pass'], 'string');

    const transporter = nodemailer.createTransport({
      host: options.host,
      port: options.port,
      secure: options.secure,
      auth: {
        user: options.auth.user,
        pass: options.auth.pass
      }
    }, {
      from: options.from
    });

    immutable(this, 'transporter', transporter);
  }
}

module.exports = {
  Emailer,
  EmailerConfig
};
