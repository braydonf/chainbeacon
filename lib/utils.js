'use strict';

function immutable(x, key, value) {
  Object.defineProperty(x, key, {
    configurable: false,
    enumerable: true,
    value: value
  });
}

function type(options, properties, type) {
  if (!options)
    throw new TypeError('Options is expected.');

  if (type === 'array') {
    for (let key of properties) {
      if (!Array.isArray(options[key]))
        throw new TypeError(`${key} is expected to be an array.`);
    }
  } else {
    for (let key of properties) {
      if (typeof options[key] !== type)
        throw new TypeError(`${key} is expected to be a ${type}.`);
    }
  }
}

function isObject(a) {
  return (!Array.isArray(a) && typeof a === 'object');
}

function merge(left, right) {
  if (Array.isArray(left) && Array.isArray(right)) {
    left = left.concat(right);
  } else if (isObject(left) && isObject(right)) {
    for (let key in right) {
      left[key] = merge(left[key], right[key]);
    }
  } else {
    left = right;
  }
  return left;
}

module.exports = {
  immutable,
  type,
  merge,
  isObject
}
