'use strict';

const {randomBytes} = require('crypto');

const {type, immutable} = require('./utils');

class Client {
  constructor(options) {
    type(options, ['name'], 'string');

    immutable(this, 'config', new ClientConfig(options));
    immutable(this, 'name', options.name);
  }

  async execute(method, params) {
    const body = JSON.stringify({
      jsonrpc: this.config.version,
      method: method,
      params: params || undefined,
      id: randomBytes(12).toString('hex')
    });

    return new Promise((resolve, reject) => {
      const req = this.config.http.request(this.config.httpOpts, (res) => {
        let buf = '';

        res.on('data', (data) => {
          buf += data;
        });

        res.on('end', () => {
          if (res.statusCode === 401)
            return reject(new Error('401 Unauthorized'));

          if (res.statusCode === 403)
            return reject(new Error('403 Forbidden'));

          if (res.statusCode === 500)
            return reject(new Error('500 Interal Server Error'));

          let parsed = null;

          try {
            parsed = JSON.parse(buf);
          } catch(err) {
            return reject(err)
          }

          resolve(parsed);
        });
      });

      req.on('error', reject);

      req.setHeader('Authorization', `Basic ${this.config.httpAuth}`);
      req.setHeader('Content-Length', body.length);
      req.setHeader('Content-Type', 'application/json');

      req.write(body);

      req.end();
    });
  }
}

class ClientConfig {
  constructor(options) {
    type(options, ['host', 'user', 'pass'], 'string');
    type(options, ['port'], 'number');
    type(options, ['https'], 'boolean');

    immutable(this, 'version', 2);

    if (options.https) {
      immutable(this, 'http', require('https'));
    } else {
      immutable(this, 'http', require('http'));
    }

    immutable(this, 'host', options.host);
    immutable(this, 'port', options.port);
    immutable(this, 'user', options.user);
    immutable(this, 'pass', options.pass);

    const auth = Buffer.from(`${this.user}:${this.pass}`, 'utf8');

    immutable(this, 'httpAuth', auth.toString('base64'));

    const httpOpts = {
      host: this.host,
      path: '/',
      method: 'POST',
      port: this.port
    }

    immutable(this, 'httpOpts', httpOpts);
  }
}

module.exports = {
  Client,
  ClientConfig
}
