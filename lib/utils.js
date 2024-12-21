'use strict';
const { DEFAULT_DEVICE } = require('./constants');

function validateDevice(dev) {
  if (!dev || typeof dev !== 'string') {
    return DEFAULT_DEVICE;
  }
  return dev;
}

module.exports = {
  validateDevice
};