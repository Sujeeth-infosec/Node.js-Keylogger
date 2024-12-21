'use strict';
const EventEmitter = require('events');
const { spawn } = require('child_process');
const { EVENT_TYPES } = require('../constants');

class WindowsKeyboard extends EventEmitter {
  constructor() {
    super();
    this.initialize();
  }

  initialize() {
    try {
      const script = `
        Add-Type @"
          using System;
          using System.Runtime.InteropServices;
          using System.Windows.Forms;
          
          public class KeyLogger {
            private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
            
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);
            
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            private static extern bool UnhookWindowsHookEx(IntPtr hhk);
            
            [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
            private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);
            
            private const int WH_KEYBOARD_LL = 13;
            private const int WM_KEYDOWN = 0x0100;
            private const int WM_KEYUP = 0x0101;
            
            private static LowLevelKeyboardProc _proc = HookCallback;
            private static IntPtr _hookID = IntPtr.Zero;
            
            public static void Main() {
              _hookID = SetHook(_proc);
              Application.Run();
            }
            
            private static IntPtr SetHook(LowLevelKeyboardProc proc) {
              return SetWindowsHookEx(WH_KEYBOARD_LL, proc, IntPtr.Zero, 0);
            }
            
            private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
              if (nCode >= 0) {
                int vkCode = Marshal.ReadInt32(lParam);
                if (wParam == (IntPtr)WM_KEYDOWN) {
                  Console.WriteLine($"down,{vkCode}");
                }
                else if (wParam == (IntPtr)WM_KEYUP) {
                  Console.WriteLine($"up,{vkCode}");
                }
              }
              return CallNextHookEx(_hookID, nCode, wParam, lParam);
            }
          }
"@

        [KeyLogger]::Main()
      `;

      this.process = spawn('powershell', ['-Command', script]);
      this.attachEventListeners();
    } catch (err) {
      this.emit('error', new Error(`Failed to initialize Windows keyboard: ${err.message}`));
    }
  }

  attachEventListeners() {
    this.process.stdout.on('data', (data) => {
      const [eventType, keyCode] = data.toString().trim().split(',');
      const code = parseInt(keyCode);
      
      if (!isNaN(code)) {
        const event = {
          timeS: Math.floor(Date.now() / 1000),
          timeMS: Date.now() % 1000,
          keyCode: code,
          keyId: `KEY_${code}`,
          type: eventType === 'down' ? 'keydown' : 'keyup',
          dev: 'windows'
        };
        this.emit(event.type, event);
        
        // Emit keypress for keydown events
        if (eventType === 'down') {
          event.type = 'keypress';
          this.emit('keypress', event);
        }
      }
    });

    this.process.stderr.on('data', (data) => {
      this.emit('error', new Error(data.toString()));
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

module.exports = WindowsKeyboard;