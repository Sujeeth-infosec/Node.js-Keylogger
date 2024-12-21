'use strict';
const fs = require('fs');
const EventEmitter = require('events');
const { parseKeyEvent } = require('../parser');
const { validateDevice } = require('../utils');

class LinuxKeyboard extends EventEmitter {
  constructor(dev) {
    super();
    this.dev = validateDevice(dev);
    this.bufferSize = 24;
    this.buffer = Buffer.alloc(this.bufferSize);
    this.initialize();
  }

  initialize() {
    try {
      this.stream = fs.createReadStream(`/dev/input/${this.dev}`);
      this.attachEventListeners();
    } catch (err) {
      this.emit('error', new Error(`Failed to open keyboard device: ${err.message}`));
    }
  }

  attachEventListeners() {
    this.stream.on('data', (data) => {
      this.buffer = data.slice(24);
      const event = parseKeyEvent(this.buffer, this.dev);
      if (event) {
        this.emit(event.type, event);
      }
    });

    this.stream.on('error', (err) => {
      this.emit('error', err);
    });
  }

  close() {
    if (this.stream) {
      this.stream.destroy();
    }
  }
}

module.exports = LinuxKeyboard;