'use strict';
const { EVENT_TYPES, EV_KEY } = require('./constants');
const keyCodes = require('./keycodes');

function parseKeyEvent(buffer, dev) {
  if (buffer.readUInt16LE(16) === EV_KEY) {
    return {
      timeS: buffer.readUInt16LE(0),
      timeMS: buffer.readUInt16LE(8),
      keyCode: buffer.readUInt16LE(18),
      keyId: keyCodes[buffer.readUInt16LE(18)],
      type: EVENT_TYPES[buffer.readUInt32LE(20)],
      dev
    };
  }
  return null;
}

module.exports = {
  parseKeyEvent
};