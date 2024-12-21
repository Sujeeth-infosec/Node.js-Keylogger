'use strict';
const LinuxKeyboard = require('./platforms/linux');
const WindowsKeyboard = require('./platforms/windows');
const MacOSKeyboard = require('./platforms/macos');

class Keyboard {
  constructor(dev) {
    const platform = process.platform;
    
    switch (platform) {
      case 'linux':
        return new LinuxKeyboard(dev);
      case 'win32':
        return new WindowsKeyboard();
      case 'darwin':
        return new MacOSKeyboard();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

module.exports = Keyboard;