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


bot.onText(/\/start(?!.+)/,async (msg)=>{

    const ChatId = msg.chat.id;

    await bot.sendMessage(ChatId, 'здравствуйте, чтобы получить рассписание введите "/get_timetable название_факультета"');

})

bot.onText(/\/start (.+)/,async (msg, [source, GroupName]) =>{

    const ChatId = msg.chat.id
    const UserId = msg.from.id
    const GroupId = await db.GetGroupID(GroupName)
    const UserExist = await db.userExists(UserId)


    if(UserExist){
        await bot.sendMessage(ChatId, 'вы уже отслеживаете рассписание')
        return 0
    }

    if (!UserExist){
        if (GroupId != 0) {
            const result = await db.AddTelegramUser(UserId, GroupId)
            console.log(result)
            if (result) {
                await bot.sendMessage(ChatId, `вы успешно отслеживаете группу ${GroupName}`)
            }

        if (!result) {
            await bot.sendMessage(ChatId, 'что-то не так')
            }
        }else{
            await bot.sendMessage(ChatId, 'такой группы нет')
        }
    }

});



bot.onText(/\/get_timetable(?!.+)/,async (msg)=>{

    const ChatId = msg.chat.id
    const UserId = msg.from.id
    const UserExist = await db.userExists(UserId)

    if (!UserExist){
        await bot.sendMessage(ChatId,'вы не зарегистрировались!!\n ' +
            'введите команду \'/start\' и введите через пробел название группы \n Пример: /strat БЦИ181')
    }
    if(UserExist){
        const time_table = await db.GetTimetableForUser(UserId)
        await bot.sendMessage(ChatId, time_table)
    }
})


bot.onText(/\/get_timetable (.+)/,async (msg, [source, GroupName])=>{

    const ChatId = msg.chat.id;

    bot.sendMessage(ChatId, 'поиск...')
    let response_pars = await GetTimetable(GroupName)
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

