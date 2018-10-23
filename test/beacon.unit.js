'use strict';

const assert = require('assert');
const {Beacon} = require('../lib/beacon');
const {test} = require('./bootstrap');

test('sync', async (test) => {
  test('will update chain states', async () => {
    const config = {
      nodes: [
        {
          name: 'bcoin-v1.0.2',
          host: 'localhost',
          port: 8333,
          user: 'user',
          pass: 'pass',
          https: false
        }
      ],
      subscribers: [],
      interval: 1000,
      emailer: {
        host: 'localhost',
        port: 10000,
        secure: true,
        auth: {
          user: 'user',
          pass: 'pass'
        },
        from: 'user@email.com'
      }
    };

    const beacon = new Beacon(config);

    const result = {
      blocks: 510015
    };

    beacon.config.nodes[0].execute = async () => {
      return {result};
    }

    await beacon.sync();

    assert.equal(beacon.results['bcoin-v1.0.2'], result);
  });
});
