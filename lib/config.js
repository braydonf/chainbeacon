'use strict';

const {merge, isObject} = require('./utils');

function config(appname) {
  return (env = {}, config = {}) => {
    const keys = Object.keys(env);

    const mapped = keys.map((key) => {
      return { key: key, value: env[key] }
    });

    const filtered = mapped.filter((e) => new RegExp(`^${appname}`).test(e.key));

    const split = filtered.map((e) => {
      return { key: e.key.split('__'), value: e.value };
    })

    const reduced = split.reduce((root, e) => {
      let r = root;
      let v = undefined;
      try {
        v = JSON.parse(e.value);
      } catch(err) {
        v = e.value;
      }
      for (let i = 0; i < e.key.length; i++) {
        const k = e.key[i];
        const last = (i === e.key.length - 1);
        if (r[k] && typeof r[k] !== 'object') {
          throw new TypeError('Unexpected env variable.');
        } else if (!r[k]) {
          r[k] = last ? v : {};
        } else if (last){
          throw new TypeError('Unexpected env variable.');
        }
        r = r[k];
      }
      return root;
    }, {})[appname];

    return merge(reduced, config);
  };
}

module.exports = {
  config
};
