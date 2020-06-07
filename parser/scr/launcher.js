const puppeteer = require('puppeteer');

module.exports.StartBrowser = async ()=>{
    const browser = await puppeteer.launch({headless : true})
    return browser
}

module.exports.StartPage = async (browser) => {
    const page = await browser.newPage()
    return page
}