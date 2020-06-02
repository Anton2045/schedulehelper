TelegramBot = require('node-telegram-bot-api')
Scraper = require('../../parser/scr/index')
config = require('../config.json')
Database = require('./Database')
// Menu = require('./menu')


const bot = new TelegramBot(config.token, { polling: true });
const db = new Database(config.databaseURL);
const today = new Date()


bot.onText(/\/start(?!.+)/,async (msg)=>{
    const ChatId = msg.chat.id;

    await bot.sendMessage(ChatId, 'здравствуйте, чтобы получить рассписание введите "/get_timetable название_факультета"');

}
)


bot.onText(/\/start (.+)/,async (msg, [source, GroupName]) =>{

    const ChatId = msg.chat.id
    const UserId = msg.from.id
    const GroupId = await db.GetGroupID(GroupName)
    const UserExist = await db.userExists(UserId)
    console.log(GroupName,GroupId)


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
            await bot.sendMessage(ChatId, 'такой группы нет у нас в базе данных, но мы проверим есть ли она ' +
                'на самом деле и добавим ее примерно через 20 сек')

            response = await Scraper.ParseTimetable(GroupName)
            if(response.result == 0){
                bot.sendMessage(ChatId,'такой группы нет ')
            }else{
                let group_id = await db.GetGroupID(response.group_name)

                if (group_id == 0){
                    const data = response.timetable
                    let json_st = JSON.stringify(data)
                    await db.AddGroup(response.group_name, json_st)
                    let group_id = await db.GetGroupID(response.group_name)
                    await db.AddTelegramUser(UserId, group_id)
                    message = `мы добавили в список вашу группу, теперь вы супешно подключены к группе ${response.group_name}`
                    bot.sendMessage(ChatId, message)
                }else{
                    await db.AddTelegramUser(UserId, group_id)
                    message = `вы супешно подключены к группе ${response.group_name}`
                    bot.sendMessage(ChatId, message)
                }

            }




        }
    }

});


bot.onText(/\/get_timetable(?!.+)/,async (msg)=>{

    const ChatId = msg.chat.id
    const UserId = msg.from.id
    const UserExist = await db.userExists(UserId)

    if (!UserExist){
        await bot.sendMessage(ChatId,'вы не зарегистрировались!!\n ' +
            'введите команду \'/start\' и введите через пробел название группы \n Пример: /start бци181')
    }
    if(UserExist){
        const timetable_str = await db.GetTimetableForUser(UserId)
        const timetable = JSON.parse(timetable_str)
        let message = ``
        for(cell of timetable){
            message = message + `актуальность: ${cell.create_date}
${cell.date}\n${cell.name}${cell.information}
--------------------------------------------
`
        }
        await bot.sendMessage(ChatId, message)
    }
})


bot.onText(/\/get_timetable (.+)/,async (msg, [source, GroupName])=>{

    const ChatId = msg.chat.id;

    bot.sendMessage(ChatId, 'поиск...')
    let response_pars = await Scraper.ParseTimetable(GroupName)
    console.log(response_pars.timetable)
    if (response_pars.result == 0){
        await bot.sendMessage(ChatId,'такого факультета нет')
    }else{
        for (cell of response_pars.timetable) {
            message = `
            актуальность:${cell.create_date}\n${cell.date}\n${cell.name}${cell.information}`



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


bot.onText(/\/delete/,async (msg)=>{
    const ChatId = msg.chat.id
    const UserId = msg.from.id
    console.log('sadad')
    const result = await db.DeleteTelegramUser(UserId)
    if(result == true){
        bot.sendMessage(ChatId,'вы успешно отключились от рассылки ')
    }else{
        bot.sendMessage(ChatId,'вы и так не зарег')
    }
})

// функция обнавляет базу данных
const f = async ()=>{await Scraper.UpdateDB()}
f()
setInterval(async() => {
    await Scraper.UpdateDB()
}, (4*3600*1000))

// функция отправки сообщения в восемь утра
function sendNotif() {
    const today = new Date()
    h = today.getHours()
    m = today.getMinutes()
    now = h * 60 + m
    time_for_send = 12 * 60 + 51
    time_before_sending = time_for_send - now
    if (time_before_sending <= 0){
        time_before_sending = 24*60 + time_before_sending
    }
    console.log(time_before_sending)
    setTimeout(async ()=>{
        const UsersID = await db.GetUsersID()

        for (user of UsersID) {
            const timetable_str = await db.GetTimetableForUser(user.t_id)
            const timetable = JSON.parse(timetable_str)
            let message = ``
            for(cell of timetable){
                message = message + `актуальность: ${cell.create_date}
            ${cell.date}\n${cell.name}${cell.information}
            --------------------------------------------
            `
            }
            await bot.sendMessage(user.t_id, message)
        }

        sendNotif()
    }, (time_before_sending*60*1000))
}
sendNotif()




