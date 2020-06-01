TelegramBot = require('node-telegram-bot-api')
GetTimetable = require('../../parser')
config = require('../config.json')
Database = require('./Database')
// Menu = require('./menu')


const bot = new TelegramBot(config.token, { polling: true });
const db = new Database(config.databaseURL);

// bot.on('message', async msg=>{
//     await bot.sendMessage(msg.chat.id,'здравствуйте, чтобы запустить введите "/start"')
// })


bot.onText(/\/start/,async (msg)=>{

    const ChatId = msg.chat.id;

    await bot.sendMessage(ChatId, 'здравствуйте, чтобы получить рассписание введите "/get_timetable название_факультета"');

})

bot.onText(/\/start (.+)/,async (msg, [source, name_fk]) =>{



})



// bot.onText(/\/get_timetable/,(msg)=>{
//     const ChatId = msg.chat.id
//     bot.sendMessage(ChatId,text, {parse_mode: 'HTML'})
//         .then(()=>{
//             console.log('done')
//         })
//         .catch((e)=>{
//             console.log(e)
//         })
//
// })


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
            актуальность:${cell.create_date}\n${cell.date}${cell.name}${cell.information}`



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

