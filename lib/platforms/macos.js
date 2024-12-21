'use strict';
const EventEmitter = require('events');
const { spawn } = require('child_process');
const { EVENT_TYPES } = require('../constants');

class MacOSKeyboard extends EventEmitter {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    try {
      // Using Swift script through xcrun to monitor keyboard events
      const script = `
        import Cocoa
        import Carbon

        let eventMask = CGEventMask(1 << CGEventType.keyDown.rawValue | 1 << CGEventType.keyUp.rawValue)
        let eventTap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: eventMask,
            callback: { (proxy, type, event, refcon) -> Unmanaged<CGEvent>? in
                let keycode = event.getIntegerValueField(.keyboardEventKeycode)
                print("\\(type.rawValue),\\(keycode)")
                return Unmanaged.passRetained(event)
            },
            userInfo: nil
        )

        let runLoop = CFRunLoopGetCurrent()
        CFRunLoopAddSource(runLoop, eventTap?.createRunLoopSource(), .commonModes)
        CFRunLoopRun()
      `;

      this.process = spawn('xcrun', ['swift', '-'], { input: script });
      this.attachEventListeners();
    } catch (err) {
      this.emit('error', new Error(`Failed to initialize macOS keyboard: ${err.message}`));
    }
  }

  attachEventListeners() {
    this.process.stdout.on('data', (data) => {
      const [type, keyCode] = data.toString().trim().split(',').map(Number);
      if (!isNaN(type) && !isNaN(keyCode)) {
        const event = {
          timeS: Math.floor(Date.now() / 1000),
          timeMS: Date.now() % 1000,
          keyCode,
          keyId: `KEY_${keyCode}`,
          type: EVENT_TYPES[type === 10 ? 0 : 2], // 10 = keyUp, other = keyDown
          dev: 'macos'
        };
        this.emit(event.type, event);
      }
    });

    this.process.on('error', (err) => {
      this.emit('error', err);
    });
  }

  close() {
    if (this.process) {
      this.process.kill();
    }
  }
}

module.exports = MacOSKeyboard;