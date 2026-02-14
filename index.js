const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
const express = require('express');

const app = express();

// Mở port cho Render
app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Web server running');
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

const createdChannels = new Set();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});

client.on('voiceStateUpdate', async (oldState, newState) => {

    // Khi vào kênh Create Room
    if (newState.channel && newState.channel.name === '➕ Create Room') {

        const guild = newState.guild;
        const category = newState.channel.parent;

        const newChannel = await guild.channels.create({
            name: `${newState.member.user.username}'s Room`,
            type: ChannelType.GuildVoice,
            parent: category
        });

        createdChannels.add(newChannel.id);

        await newState.member.voice.setChannel(newChannel);
    }

    // Khi rời khỏi 1 kênh
    if (oldState.channel && createdChannels.has(oldState.channel.id)) {

        // Nếu kênh không còn ai
        if (oldState.channel.members.size === 0) {
            createdChannels.delete(oldState.channel.id);
            await oldState.channel.delete();
        }
    }

});

client.login(process.env.TOKEN);
