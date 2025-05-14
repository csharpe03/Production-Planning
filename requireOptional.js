'use strict';

// Returns a required module, or null if it can't be found.
module.exports = function requireOptional(name) {
  try {
    return require(name); // eslint-disable-line global-require, import/no-dynamic-require
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return null;
    } else {
      throw e;
    }
  }
};
