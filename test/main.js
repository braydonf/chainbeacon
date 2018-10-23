'use strict';

const path = require('path');
const {discover, run, count, print, printEnd} = require('./bootstrap');

(async function() {
  const files = await discover(path.resolve(__dirname, './'));
  let endTotal = 0;
  let endPass = 0;

  for (const type in files) {
    for (const file of files[type]) {
      const result = await run(file);

      const {total, pass} = count(result);

      endTotal += total;
      endPass += pass;

      print(file, result);
    }
  }

  printEnd(endTotal, endPass);

})().catch((err) => {
  console.error(err);
});
