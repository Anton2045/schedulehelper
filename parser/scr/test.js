
Database = require('../../bot/scr/Database');
const db = new Database(config.databaseURL);

const main = async ()=>{
    result = await db.GetUsersID()
    console.log(result[0].user_id)
}
main().then(
    console.log('DONE')
)
.catch((e)=>{
    console.log(e)
})