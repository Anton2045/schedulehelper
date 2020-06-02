config = require('../config.json')
Database = require('./Database')
const db = new Database(config.databaseURL);

const main = async ()=>{
   console.log(await db.DeleteTelegramUser(313604880))
}


main().then((result)=>{
    console.log(result)
})
.catch((e)=>{
    console.log(e, 'i am here')
})
