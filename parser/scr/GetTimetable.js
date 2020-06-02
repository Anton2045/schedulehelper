const puppeteer = require('puppeteer')



module.exports = async (page)=> {
    return  await page.evaluate(()=>{
        let timetable = []
        let group_name = ''
        //проверка,есть ли расписание
        if (document.querySelector('.mb-3.ng-star-inserted') != null){
            return timetable
        }
        //получаем все ячейки
        let elements = document.querySelectorAll('.media-body.day-items')
        // вытаскиваем из каждой ячейки значения
        for (const element of elements) {
            const today = new Date()
            const dd = String(today.getDate()).padStart(2, '0')
            const mm = String(today.getMonth() + 1).padStart(2, '0')
            const yyyy = today.getFullYear()
            const create_date = `${dd}.${mm}.${yyyy}`
            const date = element.querySelector('.d-lg-none.date.clearfix').innerText
            //если дата не совпадает с настоящим числом, то пропускаем итерацию
            if ( (date.match(/[^\s]*/)[0]) != create_date){
                console.log(date.match(/[^\s]*/)[0], create_date)
                continue
            }
            const title = element.querySelector('.title').innerText
            const information = element.querySelector('.info').innerText


            //собираем объект
            const cell_data = {
                create_date: create_date,
                date: date,
                name: title,
                information: information,
            }

            timetable.push(cell_data)
        }
        group_name = document.querySelector('[title="Раскрыть"]').innerText
        group_name = group_name.trim()
        return {group_name: group_name, timetable}
    });

}