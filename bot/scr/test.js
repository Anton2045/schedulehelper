config = require('../config.json')
Database = require('./Database')
const db = new Database(config.databaseURL);

const main = async ()=>{
   a = await db.GetTimetableForUser(313604880)
    console.log(a)
}


main().then((result)=>{
    console.log(result)
})
.catch((e)=>{
    console.log(e, 'i am here')
})
