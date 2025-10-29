import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The ngrok host is: bd5c810a6147.ngrok-free.app

export default defineConfig({
  plugins: [react()],
  server: {
    // 1. Force listening on all interfaces (0.0.0.0), required for ngrok forwarding
    host: true, 
    // 2. CRITICAL FIX: Allow the ngrok public host domain
    allowedHosts: [
      'localhost', 
      '127.0.0.1', 
      'bd5c810a6147.ngrok-free.app' // <--- YOUR NGROK HOST
    ],
    port: 5173, // Ensures it runs on the expected port
  }
});
