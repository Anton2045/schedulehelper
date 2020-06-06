const appearance = require('../appearance/menu');
const createMessageHTML = require('../templates/templates_msg');

const SendTimetableForUser =async (bot, db, UserId=0, timetable= 'не передано')=> {
    if (timetable == 'не передано') {
        const timetable_str = await db.GetTimetableForUser(UserId);
        timetable = JSON.parse(timetable_str);

    }

    if (timetable.length == 0) {
        bot.sendMessage(UserId, 'нет рассписания на сегодня: ')
        return 0
    }
    let message_html = `      <strong>Расписание на сегодня </strong>\n`
    //отправка сообщений
    for(cell of timetable){
        message_html = message_html + createMessageHTML(cell)
    }
    try {
        await bot.sendMessage(UserId, message_html, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                disable_notification: true
            })
    }catch (e) {
        for(cell of timetable){
            message_html = createMessageHTML(cell)
            await bot.sendMessage(UserId, message_html, {
                parse_mode: 'HTML',
                disable_web_page_preview: true,
                disable_notification: true
            })
        }
    }
}
module.exports = SendTimetableForUser