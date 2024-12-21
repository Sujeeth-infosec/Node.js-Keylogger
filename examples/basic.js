'use strict';
const Keyboard = require('../lib');

// Create a new keyboard instance
const keyboard = new Keyboard('event0');

// Listen for key events
keyboard.on('keydown', (event) => {
  console.log('Key Down:', event);
});

keyboard.on('keyup', (event) => {
  console.log('Key Up:', event);
});

keyboard.on('keypress', (event) => {
  console.log('Key Press:', event);
});

keyboard.on('error', (error) => {
  console.error('Error:', error);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nClosing keyboard listener...');
  keyboard.close();
  process.exit();
});