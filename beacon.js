'use strict';

const {type, immutable} = require('./utils');
const {Client} = require('./client');
const {Emailer} = require('./emailer');
const name = require('./package.json').name;
const {createHash} = require('crypto');

class Beacon {
  constructor(options) {
    immutable(this, 'config', new BeaconConfig(options));
    this.results = {};
    this.lastSend = null;
    this.bestHeight = 0;
    this.bestBlock = null;
  }

  async sendID(subject, text) {
    const hasher = createHash('sha256')
    hasher.update(subject);
    hasher.update(text);
    return hasher.digest('hex');
  }

  async send(subject) {
    const text = JSON.stringify(this.results, null, 2)

    const id = this.sendID(subject, text);

    if (id === this.lastSend) {
      return;
    } else {
      this.lastSend = id;
    }

    for (const subscriber of this.config.subscribers) {
      await this.config.emailer.send({
        email: subscriber,
        subject: `[${name}] ${subject}`,
        text: text
      });
    }

    console.log(`${subject} height=${this.bestHeight} hash=${this.bestBlock}`);
  }

  async sendHeightAlert() {
    this.send('Alert: Chain height out-of-sync.');
  }

  async sendForkAlert() {
    this.send('Alert: Chain fork detected.');
  }

  async sendHeightNotice() {
    this.send('Notice: Chain has new block.');
  }

  async sync() {
    for (const node of this.config.nodes) {
      let info = null;
      try {
        info = await node.execute('getblockchaininfo');
      } catch(err) {
        console.warn(err);
        continue;
      }
      this.results[node.name] = info.result;
    }
  }

  async detect() {
    await this.sync();

    const [low, high] = await this.checkHeights();

    if (high - low > 1)
      this.sendHeightAlert();

    const [fork, bestHeight, bestBlock] = await this.checkFork();

    if (fork)
      this.sendForkAlert();

    if (bestHeight > this.bestHeight) {
      this.bestHeight = bestHeight;
      this.bestBlock = bestBlock;
      this.sendHeightNotice();
    }
  }

  async checkHeights() {
    let heights = [];

    for (const key in this.results) {
      const result = this.results[key];

      type(result, ['blocks'], 'number');

      heights.push(result.blocks);
    }

    heights.sort((a, b) => a > b);

    const high = heights[heights.length - 1];
    const low = heights[0];

    return [low, high];
  }

  async checkFork() {
    let heights = {};
    let bestHeight = 0;
    let fork = false;
    let bestBlocks = {};
    let bestBlock = null;
    let best = 0;

    for (const key in this.results) {
      const result = this.results[key];

      type(result, ['blocks'], 'number');
      type(result, ['bestblockhash'], 'string');

      if (!heights[result.blocks])
        heights[result.blocks] = [];

      heights[result.blocks].push({
        name: key,
        hash: result.bestblockhash
      });

      if (result.blocks > bestHeight)
        bestHeight = result.blocks;
    }

    for (const height in heights) {
      let hash = null;

      for (const chain of heights[height]) {
        if (!hash)
          hash = chain.hash;
        else if (hash !== chain.hash)
          fork = true;
      }
    }

    for (const chain of heights[bestHeight]) {
      if (!bestBlocks[chain.hash])
        bestBlocks[chain.hash] = 1;
      else
        bestBlocks[chain.hash] += 1;

      if (bestBlocks[chain.hash] > best)
        bestBlock = chain.hash;
    }

    return [fork, bestHeight, bestBlock];
  }

  run() {
    setInterval(this.detect.bind(this), this.config.interval);
  }
}

class BeaconConfig {
  constructor(options) {
    type(options, ['nodes', 'subscribers'], 'array');
    type(options, ['emailer'], 'object');
    type(options, ['interval'], 'number');

    let nodes = [];
    for (const node of options.nodes)
      nodes.push(new Client(node));

    immutable(this, 'nodes', nodes);
    immutable(this, 'subscribers', options.subscribers);
    immutable(this, 'emailer', new Emailer(options.emailer));
    immutable(this, 'interval', options.interval);
  }
}

module.exports = {
  Beacon,
  BeaconConfig
}
