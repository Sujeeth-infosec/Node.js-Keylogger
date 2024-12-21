# node-keylogger

Cross-platform Node.js keylogger using events.

## Features

- Cross-platform support (Linux, Windows, macOS)
- No external dependencies
- Event-based API
- TypeScript-friendly
- Clean and modular codebase

## Installation

```bash
npm install node-keylogger
```

## Usage

```javascript
const Keyboard = require('node-keylogger');

// Create a new keyboard instance
const keyboard = new Keyboard(); // Device parameter only needed for Linux

// Listen for key events
keyboard.on('keydown', console.log);
keyboard.on('keyup', console.log);
keyboard.on('keypress', console.log);
keyboard.on('error', console.error);
```

### Event Object Structure

```javascript
{ 
  timeS: 1347572085,    // Timestamp (Seconds part)
  timeMS: 741381,       // Timestamp (Microseconds part)
  keyCode: 17,          // Keyboard code
  keyId: 'KEY_W',       // Key ID
  type: 'keypress',     // Event type
  dev: 'event0'         // Device (Linux) or platform name
}
```

## Platform-Specific Notes

### Linux
- Requires read access to `/dev/input/` devices
- Specify the keyboard device (e.g., 'event0')

### Windows
- Uses PowerShell and Windows Forms for key monitoring
- Requires PowerShell

### macOS
- Uses Swift and Cocoa for key monitoring
- Requires XCode Command Line Tools

## Security Note

This module requires system-level access to monitor keyboard events. Make sure you have the necessary permissions and understand the security implications of keyboard logging.

## License

MIT