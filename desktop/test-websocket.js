const WebSocket = require('ws');

// Test WebSocket connection to the API
const ws = new WebSocket('ws://172.19.252.199:3001/streamer-events?token=test123');

ws.on('open', function open() {
  console.log('✅ Connected to API WebSocket');
  
  // Send identification
  ws.send(JSON.stringify({
    type: 'identify',
    clientType: 'desktop',
    version: '1.0.0'
  }));
});

ws.on('message', function message(data) {
  try {
    const msg = JSON.parse(data.toString());
    console.log('📨 Received message:', msg);
    
    if (msg.type === 'ping') {
      // Respond to ping
      ws.send(JSON.stringify({ type: 'pong' }));
      console.log('🏓 Sent pong response');
    } else if (msg.type === 'punishment') {
      console.log('⚡ PUNISHMENT RECEIVED:', msg.data);
      console.log(`   Type: ${msg.data.type}`);
      console.log(`   Duration: ${msg.data.duration}ms`);
      console.log(`   Triggered by: ${msg.data.triggeredBy}`);
    }
  } catch (error) {
    console.error('❌ Failed to parse message:', error);
  }
});

ws.on('close', function close() {
  console.log('🔌 Connection closed');
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err);
});