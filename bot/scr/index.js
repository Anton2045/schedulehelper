TelegramBot = require('node-telegram-bot-api');
Scraper = require('../../parser/scr/index');
config = require('../config.json');
Database = require('./Database');
const createMessageHTML = require('../templates/templates_msg');
const SendTimetableForUser = require('./SendTimetable');
const appearance = require('../appearance/menu');


const bot = new TelegramBot(config.token, { polling: {
        interval:300,
        autoStart: true,
        params:{
            timeout: 10,
        }
    }
});
const db = new Database(config.databaseURL);
const today = new Date();


bot.onText(/Помощь/, async msg=>{

    const ChatId = msg.chat.id;
    await bot.sendMessage(ChatId, 'Чтобы начать отслеживать расписание введите /start' +
        ' и через пробел укажите название группы\n пример: /start БЦИ181.\n\n' +
        'Если вы хотите перестать отслеживать группу с расписанием введите /delete.\n\n' +
        'Чтобы получить рассписание с сайта введите /get_timetable и через пробел укажите название\n' +
        'В этом случае вы не будете прикреплены к ноовой группе и просто получите актуальное расписание на сегодня.\n' +
        'пример: /get_timetable БЦИ181\n'
         )
});



bot.onText(/\/start(?!.+)/,async msg =>{
    const ChatId = msg.chat.id;
    await bot.sendMessage(
              ChatId,
        'чтобы начать отслеживать расписание введите /start' +
             ' и через пробел укажите название группы\n Пример: /start БЦИ181\n',
        {reply_markup: appearance.mainMenu.reply_markup}
        );
});


bot.onText(/\/start (.+)/,async (msg, [source, GroupName]) =>{

    const ChatId = msg.chat.id;
    const UserId = msg.from.id;
    const GroupId = await db.GetGroupID(GroupName);
    const UserExist = await db.userExists(UserId);

    if(UserExist){
        await bot.sendMessage(ChatId, 'вы уже отслеживаете рассписание\n'+
            'введите /delete чтобы отключиться от рассылки')
        return 0
    }

    if (!UserExist){
        if (GroupId != 0) {
            const result = await db.AddTelegramUser(UserId, GroupId)
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
                    message = `мы добавили в список вашу группу, теперь вы успешо подключены к группе ${response.group_name}`
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


bot.onText(/получить Рсписание(?!.+)/,async msg =>{

    const ChatId = msg.chat.id;
    const UserId = msg.from.id;
    const UserExist = await db.userExists(UserId);

    if (!UserExist){
        await bot.sendMessage(ChatId,'вы не зарегистрировались!!\n ' +
            'введите команду \'/start\' и  через пробел укажите название группы \n Пример: /start БЦИ181')
    }
    if(UserExist){
        await SendTimetableForUser(bot, db, UserId)
    }
});


bot.onText(/\/get_timetable (.+)/,async (msg, [source, GroupName])=> {

    const ChatId = msg.chat.id;
    const timetable_str = await db.GetTimetable(GroupName);

    bot.sendMessage(ChatId, 'поиск...')

    if ( timetable_str != 0){
        const timetable = JSON.parse(timetable_str);
        await SendTimetableForUser(bot, db, ChatId, timetable );
        return 0
    }

    let response_pars = await Scraper.ParseTimetable(GroupName)
    if(response_pars.result == 0 ){
        bot.sendMessage(ChatId, 'такой группы нет ')
    }
    await SendTimetableForUser(bot, db, ChatId, response_pars.timetable );
    if (await db.GetTimetable(response_pars.group_name) == 0) {
        db.AddGroup(response_pars.group_name, response_pars.timetable)
    }
});


bot.onText(/\/delete/,async (msg)=>{
    const ChatId = msg.chat.id;
    const UserId = msg.from.id;
    const result = await db.DeleteTelegramUser(UserId);

    if(result == true){
        bot.sendMessage(ChatId,'вы успешно отключились от рассылки ')
    }else{
        bot.sendMessage(ChatId,'вы и так не отслеживаете рассписание')
    }
});


const UpdateDataBase = async () => {await Scraper.UpdateDB()}
UpdateDataBase();
setInterval(async() => {
    await Scraper.UpdateDB()
}, (4*3600*1000));


function sendNotif() {
    const today = new Date();

    h = today.getHours()
    m = today.getMinutes()
    now = h * 60 + m
    time_for_send = 8 * 60 + 10
    time_before_sending = time_for_send - now
    if (time_before_sending <= 0){
        time_before_sending = 24*60 + time_before_sending
    }
    setTimeout(async ()=>{
        const UsersID = await db.GetUsersID()

        for (user of UsersID) {
            await SendTimetableForUser(bot, db, user.user_id);
        }

        sendNotif()
    }, time_before_sending*60*1000)
}
sendNotif()




