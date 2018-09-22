'use strict';

const path = require('path');
const {config} = require('./config');
const {Beacon} = require('./beacon');
const name = require('./package.json').name;

function main() {
  const filepath = path.resolve(process.env.HOME, `./.${name}/config.json`)
  let file = {};

  try {
    file = require(filepath);
  } catch (err) {
    console.warn('Unknown config file, using env only.')
  }

  const options = config(name)(process.env, file);
  const beacon = new Beacon(options);

  beacon.run();
}

(async function() {
  main();
})().catch((err) => {
  console.error(err);
});;
