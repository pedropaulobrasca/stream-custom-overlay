const WebSocket = require('ws');

console.log('🚀 Testing desktop WebSocket connection...\n');

// Connect to the API WebSocket
const ws = new WebSocket('ws://172.19.252.199:3001/streamer-events?token=test123');

ws.on('open', function open() {
  console.log('✅ Connected to API WebSocket');
  
  // Send identification
  ws.send(JSON.stringify({
    type: 'identify',
    clientType: 'desktop',
    version: '1.0.0'
  }));
  
  console.log('📤 Sent identification message');
});

ws.on('message', function message(data) {
  try {
    const msg = JSON.parse(data.toString());
    console.log('📨 Received message:', msg.type);
    
    if (msg.type === 'ping') {
      // Respond to ping
      ws.send(JSON.stringify({ type: 'pong' }));
      console.log('🏓 Sent pong response');
    } else if (msg.type === 'punishment') {
      console.log('\n⚡ PUNISHMENT RECEIVED:');
      console.log(`   🎯 Type: ${msg.data.type}`);
      console.log(`   ⏱️  Duration: ${msg.data.duration}ms (${msg.data.duration/1000}s)`);
      console.log(`   👤 Triggered by: ${msg.data.triggeredBy}`);
      console.log(`   🆔 ID: ${msg.data.id}`);
      
      // Simulate key blocking
      const keyToBlock = msg.data.type.replace('block_key_', '').toUpperCase();
      console.log(`   🚫 Would block key: ${keyToBlock}`);
      console.log(`   ⌛ Blocking for ${msg.data.duration/1000} seconds...\n`);
      
    } else if (msg.type === 'punishment_end') {
      console.log(`✅ Punishment ended: ${msg.data.id}\n`);
    } else if (msg.type === 'auth_success') {
      console.log('🔐 Authentication successful');
    }
  } catch (error) {
    console.error('❌ Failed to parse message:', error);
  }
});

ws.on('close', function close() {
  console.log('🔌 Connection closed');
  process.exit(0);
});

ws.on('error', function error(err) {
  console.error('❌ WebSocket error:', err.message);
  process.exit(1);
});

// Keep the script running
console.log('🔄 Waiting for punishments... (Press Ctrl+C to exit)');
console.log('💡 Now go to the web app and execute an action!\n');