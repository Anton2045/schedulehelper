const puppeteer = require('puppeteer')

module.exports = async (page,name_fk)=> {
    await page.waitForSelector('input#autocomplete-group')
    await page.type('input#autocomplete-group', name_fk)
    await page.waitForSelector('#pr_id_1_list>.ng-star-inserted')
    const result = await page.evaluate(async () => {
        const text = document.querySelector('#pr_id_1_list>.ng-star-inserted').innerText
        if (text == 'Не найдено') {
            return 0
        } else {
            return 1
        }
    });
    if (result == 0) {
        return 0
    }
    await page.click('#pr_id_1_list>.ng-star-inserted')
    await page.waitFor(10000)
    return 1
}