'use strict';

const path = require('path');
const fs = require('fs');
const {fork} = require('child_process');

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const PASS = `${GREEN}PASS${RESET}`;
const FAIL = `${RED}FAIL${RESET}`;

/**
 * There are three groups of tests defined: unit, integration
 * and e2e. Here are the definitions, for purposes here:
 *
 * Unit (*.unit.js):
 * Tests an individual unit in which external methods are stubbed
 * or mocked to reproduce behavior under a thorough number of
 * circumstances and edge cases. Will usually represent the most
 * signifigant number of tests. Debugging the tests is also generally
 * speedy, as it's the most granular of the tests.
 *
 * Integration (*.intg.js):
 * Tests the integration and interaction of functions and methods
 * when run together to verify that the units are working together
 * as expected. There are a fewer number of stubs or mocked methods.
 * However, resources such as network, database, disk and others are
 * mocked to be able to simulate difficult to reproduce behaviors.
 *
 * End-to-End (*.e2e.js):
 * Tests the behavior of the program with very few stubs or mocks.
 * Resources such as network, database, disk and external APIs are
 * tested end-to-end. There are typically far fewer end-to-end tests
 * as they will run slower and may depend on external state that
 * may change from time-to-time. The tests are typically more
 * difficult to debug as there is a lot of code being run.
 */

async function discover(dirpath) {
  const files = {
    unit: [],
    intg: [],
    e2e: []
  };

  function pushall(data) {
    for (const type in files) {
      const exp = new RegExp(`(.*)\.${type}\.js$`);

      for (const file of data) {
        if (exp.test(file))
          files[type].push(path.resolve(dirpath, file));
      }
    }
  }

  return new Promise((resolve, reject) => {
    fs.readdir(dirpath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        pushall(data);
        resolve(files);
      }
    });
  });
}

async function run(filepath) {
  return new Promise((resolve, reject) => {
    const test = fork(filepath);

    let results = [];

    test.on('message', (data) => results.push(data));
    test.on('error', reject);
    test.on('exit', (code) => {
      if (code === 0)
        resolve(results);
      else
        reject(new Error(`Test exited with code ${code}`));
    });
  });
}

async function test(slug, fn) {
  const result = {
    slug: slug,
    success: false,
    stack: null
  };

  async function subtest(_slug, _fn) {
    await test(`${slug}::${_slug}`, _fn);
  };

  try {
    await fn(subtest);
    result.success = true;
  } catch(e) {
    result.stack = e.stack;
  }

  process.send(result);
}

async function print(file, results) {
  process.stdout.write(`${file}\n`);

  for (let r of results) {
    process.stdout.write(`${r.success ? PASS : FAIL} ${r.slug}\n`);

    if (!r.success)
      process.stdout.write(`${r.stack}\n`);
  }

  process.stdout.write(`\n`);
}

async function printEnd(total, pass) {
  const t = `${BOLD}TOTAL: ${total}${RESET}`;
  const p = `${GREEN}PASS: ${pass}${RESET}`;
  const f = `${RED}FAIL: ${total - pass}${RESET}`;
  process.stdout.write(`${t} ${p} ${f}\n`);
}

function count(results) {
  let total = 0;
  let pass = 0;

  for (let r of results) {
    total++;

    if (r.success)
      pass++;
  }

  return {
    total,
    pass
  };
}

module.exports = {
  discover,
  run,
  test,
  print,
  printEnd,
  count
}
