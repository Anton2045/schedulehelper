const launcher = require('./launcher.js')
const puppeteer = require('puppeteer')
const fs = require('fs')
const GetTimetablePage = require('./GetTimetablePage')
const GetTimetable = require('./GetTimetable')
const config = require('../../bot/config.json')
Database = require('../../bot/scr/Database')

const db = new Database(config.databaseURL);
const url = "https://ruz.hse.ru/ruz/main"

const ParseTimetable = async (GroupName) => {
    let timetable= []
    let test =0

    const browser = await launcher.StartBrowser()
    const page = await launcher.StartPage(browser)
    await page.on('console', msg => console.log('PAGE LOG:', msg.text()));


    await page.goto(url)
    const result = await GetTimetablePage(page, GroupName)
    if (result == 0){
        return {result : 0, group_name:'', timetable : timetable};
    }
    response = await GetTimetable(page)
    await browser.close()
    fs.writeFileSync('../out.json', JSON.stringify(timetable, null, 2))
    return {result: 1, group_name: response.group_name, timetable: response.timetable};



}



const UpdateDB = async ()=>{
    const Groups = await db.GetGroupsName()
    if (Groups ==0) {
        return 0
    }
    for(group of Groups) {
        const result = await ParseTimetable(group.group_name)
        if (result.result) {
            const data = result.timetable
            let json_st = JSON.stringify(data)
            db.UpdateGroup(group.group_name, json_st)
        }
    }
}
//
// UpdateDB()
//     .then(()=>{
//     console.log('done')
//     })
//     .catch((e)=>{
//     console.log(e)
// })

// ParseTimetable('бц').then((res)=>{
//     console.log(res)
// })
//     .catch((e)=>{
//         console.log(e)
//     })




module.exports.ParseTimetable = ParseTimetable;
module.exports.UpdateDB = UpdateDB;
