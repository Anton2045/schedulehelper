const puppeteer = require('puppeteer')

module.exports = async (page,GroupName)=> {
    await page.waitForSelector('input#autocomplete-group')      //ждем загрузки
    await page.type('input#autocomplete-group', GroupName)          //вбивем название группы
    await page.waitForSelector('#pr_id_1_list>.ng-star-inserted')
    // выбираем первое название группы и переходим на старницу
    const result = await page.evaluate(async () => {
        let group_name = document.querySelector('#pr_id_1_list>.ng-star-inserted').innerText
        if (group_name == 'Не найдено') {
            return 0
        } else {
            group_name = document.querySelector("#pr_id_1_list > li:nth-child(1) > div > div").innerText
            return group_name
        }
    });
    if (result == 0) {
        return 0
    }
    // ожидаем перехода и прогрузки
    try {
        await Promise.all([
            page.waitForNavigation({timeout:6000}),
            page.click('#pr_id_1_list>.ng-star-inserted')
        ])
    } catch(err){
    }

    return result
}