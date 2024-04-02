require("dotenv").config();

const{Client,IntentsBitField} = require('discord.js');
const OpenAI = require('openai');
const prefix = '/';
const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
});


const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});


client.on('ready', () => {
    console.log('Eliza est prête à vous aider !');
});




client.on('messageCreate', async (message) => {
    if (message.author.bot || message.channel.id !== process.env.CHANNEL_ID || message.content.startsWith("!")) {return;}

    let conversationLog = [{role:'system', content:'Je suis un Bot'}]
    try{
        await message.channel.sendTyping();
        const prevMessages = await message.channel.messages.fetch({limit: 15});
        prevMessages.reverse().forEach((msg) => {
            if (msg.content.startsWith("!") || msg.author.bot && msg.author.id !== client.user.id) {
                return;
            }
            const role = msg.author.id === client.user.id ? 'assistant' : 'user';
            const name = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/g, "");
            conversationLog.push({role, name, content:msg.content});
               
        });
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: conversationLog,
        });
        if (completion.choices.length > 0 && completion.choices[0].message) {
            await message.reply(completion.choices[0].message);
        }
    }
    catch (error) {
        console.error(error);
        await message.reply('Désolé, je n\'ai pas pu répondre à votre message');
    }

});

client.login(process.env.TOKEN);