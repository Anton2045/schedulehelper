const launcher = require('./launcher.js')
const puppeteer = require('puppeteer')
const url = "https://ruz.hse.ru/ruz/main"
const fs = require('fs')
const GetTimetablePage = require('./GetTimetablePage')
const GetTimetable = require('./GetTimetable')


module.exports  = async (name_fk) => {
    let timetable= []
    let test =0

    const browser = await launcher.StartBrowser()
    const page = await launcher.StartPage(browser)
    await page.on('console', msg => console.log('PAGE LOG:', msg.text()));


    await page.goto(url)
    const result = await GetTimetablePage(page, name_fk)
    console.log(result)
    if (result == 0){
        return {result : 0, timetable : timetable};
    }
    timetable = await GetTimetable(page)
    await browser.close()
    return {result : 1, timetable : timetable};


    // fs.writeFileSync('./out.json', JSON.stringify(timetable, null, 2))
}



// main().then(()=>{
//     console.log('done')
// })