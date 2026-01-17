// Discord Channel Relay Self-Bot - Railway Version
const Discord = require('discord.js-selfbot-v13');
const express = require('express');
const client = new Discord.Client();

// Configuration from environment variables
const CONFIG = {
  token: process.env.TOKEN,
  targetChannelId: process.env.TARGET_CHANNEL,
  sourceChannels: process.env.SOURCE_CHANNELS 
    ? process.env.SOURCE_CHANNELS.split(',')
    : [],
  relayEmbeds: true,
  relayAttachments: true,
  includeAuthorInfo: true,
  includeServerInfo: true
};

// Express server for health checks
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const status = client.user ? `✅ Logged in as ${client.user.tag}` : '⏳ Connecting...';
  res.send(`
    <html>
      <head>
        <title>Discord Relay Bot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: Arial, sans-serif; padding: 40px; background: #36393f; color: #fff; text-align: center;">
        <h1>⭐ Discord Relay Bot</h1>
        <p style="font-size: 18px;">${status}</p>
        <p>Monitoring <strong>${CONFIG.sourceChannels.length}</strong> source channels</p>
        <p>Target Channel: <code>${CONFIG.targetChannelId}</code></p>
        <hr style="margin: 30px 0; border-color: #4f545c;">
        <p style="color: #b9bbbe;">✅ Running on Railway</p>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'online',
    loggedIn: !!client.user,
    username: client.user?.tag || 'Not connected',
    monitoring: CONFIG.sourceChannels.length,
    uptime: process.uptime()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Health check server running on port ${PORT}`);
});

// Discord client setup
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Monitoring ${CONFIG.sourceChannels.length} source channels`);
  console.log(`Relaying to channel: ${CONFIG.targetChannelId}`);
});

client.on('messageCreate', async (message) => {
  if (!CONFIG.sourceChannels.includes(message.channel.id)) return;
  if (message.author.id === client.user.id) return;
  
  try {
    const targetChannel = await client.channels.fetch(CONFIG.targetChannelId);
    
    if (!targetChannel) {
      console.error('Target channel not found');
      return;
    }
    
    let content = '';
    
    if (CONFIG.includeServerInfo && message.guild) {
      content = `**[${message.guild.name}]** `;
    }
    
    if (CONFIG.includeAuthorInfo) {
      content += `**${message.author.tag}** in #${message.channel.name}:\n`;
    }
    
    content += message.content || '';
    
    const options = { content };
    
    if (CONFIG.relayEmbeds && message.embeds.length > 0) {
      options.embeds = message.embeds;
    }
    
    if (CONFIG.relayAttachments && message.attachments.size > 0) {
      options.files = Array.from(message.attachments.values()).map(a => a.url);
    }
    
    await targetChannel.send(options);
    
    console.log(`Relayed message from ${message.guild?.name || 'DM'} - ${message.author.tag}`);
    
  } catch (error) {
    console.error('Error relaying message:', error.message);
  }
});

// Login
client.login(CONFIG.token).catch(err => {
  console.error('Failed to login:', err);
  process.exit(1);
});
