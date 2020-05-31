TelegramBot = require('node-telegram-bot-api');
GetTimetable = require('../parser/index')
// Menu = require('./menu')

const TOKEN = '1268228842:AAH_s3y4GkYNB_7fjiloJL7dGzoWI-1ppIY';
const bot = new TelegramBot(TOKEN, { polling: true });

// bot.on('message', async msg=>{
//     await bot.sendMessage(msg.chat.id,'здравствуйте, чтобы запустить введите "/start"')
// })


bot.onText(/\/start/,async (msg)=>{

    const ChatId = msg.chat.id;

    await bot.sendMessage(ChatId, 'здравствуйте, чтобы получить рассписание введите "/get_timetable название_факультета"');

})


bot.onText(/\/get_timetable/,(msg)=>{
    const ChatId = msg.chat.id
    bot.sendMessage(ChatId,'вы ввели пустое название')

})

bot.onText(/\/get_timetable (.+)/,async (msg, [source, name_fk])=>{

    const ChatId = msg.chat.id;
    bot.sendMessage(ChatId, 'поиск...')
    let response_pars = await GetTimetable(name_fk)
    console.log(response_pars.timetable)
    if (response_pars.result == 0){
        await bot.sendMessage(ChatId,'такого факультета нет')
    }else{
        for (cell of response_pars.timetable) {
            message = `
            актуальность:${cell.create_date}\n
            ${cell.date}
            ${cell.name}
            ${cell.information}`



            await bot.sendMessage(ChatId, message)
                .then(()=>{
                    console.log('message has been send')
                })
                .catch((err)=>{
                    console.log(err)
                    bot.sendMessage(ChatId, 'нет расписания на данный факультет ')
                })
        }
    }
})

