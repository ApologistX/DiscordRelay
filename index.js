// Discord Channel Relay Self-Bot
// Relays messages from multiple source channels to a target channel
// Railway version with live uptime timer

const Discord = require('discord.js-selfbot-v13');
const express = require('express');
const client = new Discord.Client();

// ===== CONFIGURATION =====
const CONFIG = {
  token: process.env.TOKEN || 'YOUR_USER_TOKEN_HERE',
  targetChannelId: process.env.TARGET_CHANNEL || 'YOUR_TARGET_CHANNEL_ID',
  
  // List of source channels to monitor (comma-separated in .env)
  sourceChannels: process.env.SOURCE_CHANNELS 
    ? process.env.SOURCE_CHANNELS.split(',')
    : [
        'SOURCE_CHANNEL_ID_1',
        'SOURCE_CHANNEL_ID_2',
        'SOURCE_CHANNEL_ID_3',
      ],
  
  relayEmbeds: true,
  relayAttachments: true,
  includeAuthorInfo: true,
  includeServerInfo: true
};
// =========================

// Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const status = client.user ? `✅🟢 Logged in as ${client.user.tag} 😎👤🔥` : '⏳ Connecting...';
  
  // Calculate uptime
  const uptimeSeconds = Math.floor(process.uptime());
  
  res.send(`
    <html>
  <head>
    <title>Discord Relay Bot</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>
  <body style="font-family: Arial, sans-serif; padding: 40px; background: #36393f; color: #fff; text-align: center;">
    <h1>⭐🤖 Discord Relay Bot 🤖⭐</h1>

    <p style="font-size: 18px;">
      ${status} 🟢🧠🔥⚡
    </p>

    <p>
      👀📡🧠 Monitoring <strong>${CONFIG.sourceChannels.length}</strong> source channels 🧠📺📺📺🔥💀
    </p>

    <p>
      🎯📤💀Target Channel: <code>${CONFIG.targetChannelId}</code> 🔢✨💀🧾🔒
    </p>

    <hr style="margin: 30px 0; border-color: #4f545c;">

    <!-- UPTIME COUNTER -->
    <div style="background: #2f3136; padding: 20px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
      <p style="margin: 0; color: #b9bbbe; font-size: 14px;">⏱️ UPTIME ⏱️</p>
      <p id="uptime" style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #43b581;">Loading...</p>
    </div>

    <hr style="margin: 30px 0; border-color: #4f545c;">

    <!-- ULTRAROT ADDITIONS BELOW (DO NOT QUESTION) -->

    <p>👁️👁️👁️ Third Eye Online 🔮🌀 JS Event Loop Observed 👀⚙️</p>
    <p>🧠📉 RAM Leak Detected (Ignored) 🚫💧 GC Currently AFK 🏝️🗑️</p>
    <p>📡🧾 Messages Relayed Via Pure Vibes ✨😎 No Error Handling Found ❌</p>
    <p>♾️🌀 Awaiting Promise Resolution 🫠 then Awaiting Another Promise 🫠🫠</p>
    <p>⚠️ This page consumes 4GB RAM emotionally 💸🧠</p>
    <p>🚔 Illegal in 17 States | 🏴‍☠️ Approved by Discordia | 🙏 Angel-Certified</p>
    <p style="color: #b9bbbe; margin-top: 30px;">✅ Running on Railway • Live updates • Pure Chaos Energy 🌀💀</p>

    <script>
      let startTime = ${uptimeSeconds};
      
      function formatUptime(seconds) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let str = '';
        if (days > 0) str += days + 'd ';
        if (hours > 0 || days > 0) str += hours + 'h ';
        if (minutes > 0 || hours > 0 || days > 0) str += minutes + 'm ';
        str += secs + 's';
        return str;
      }
      
      function updateUptime() {
        startTime++;
        document.getElementById('uptime').textContent = formatUptime(startTime);
      }
      
      // Update immediately
      updateUptime();
      
      // Update every second
      setInterval(updateUptime, 1000);
    </script>

  </body>
</html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  const uptimeSeconds = Math.floor(process.uptime());
  res.json({ 
    status: 'online',
    loggedIn: !!client.user,
    username: client.user?.tag || 'Not connected',
    monitoring: CONFIG.sourceChannels.length,
    uptimeSeconds: uptimeSeconds
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Keep-alive server running on port ${PORT}`);
  console.log(`Visit your Railway URL to see status`);
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Monitoring ${CONFIG.sourceChannels.length} source channels`);
  console.log(`Relaying to channel: ${CONFIG.targetChannelId}`);
});

client.on('messageCreate', async (message) => {
  // Only relay from specified source channels
  if (!CONFIG.sourceChannels.includes(message.channel.id)) return;
  
  // Don't relay our own relayed messages
  if (message.author.id === client.user.id) return;
  
  try {
    const targetChannel = await client.channels.fetch(CONFIG.targetChannelId);
    
    if (!targetChannel) {
      console.error('Target channel not found');
      return;
    }
    
    // Build the relay message
    let content = '';
    
    if (CONFIG.includeServerInfo && message.guild) {
      content = `**[${message.guild.name}]** `;
    }
    
    if (CONFIG.includeAuthorInfo) {
      content += `**${message.author.tag}** in #${message.channel.name}:\n`;
    }
    
    content += message.content || '';
    
    // Prepare message options
    const options = { content };
    
    // Handle embeds
    if (CONFIG.relayEmbeds && message.embeds.length > 0) {
      options.embeds = message.embeds;
    }
    
    // Handle attachments
    if (CONFIG.relayAttachments && message.attachments.size > 0) {
      options.files = Array.from(message.attachments.values()).map(a => a.url);
    }
    
    // Send to target channel
    await targetChannel.send(options);
    
    console.log(`Relayed message from ${message.guild?.name || 'DM'} - ${message.author.tag}`);
    
  } catch (error) {
    console.error('Error relaying message:', error.message);
  }
});

client.login(CONFIG.token);
