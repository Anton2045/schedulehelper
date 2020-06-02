const {Pool} = require('pg')
config = require('../config.json')


class Database {

    constructor(url){
        this.pool = new Pool({connectionString: url})
    }

    async AddGroup(groupName, groupTimetable){
        const request = 'INSERT INTO groups (name_group, timetable_group) values (($1),($2));'

        try{
            await this.pool.query(request, [groupName, groupTimetable])
        }catch (e) {
            console.log(e)
        }
    }

    async UpdateGroup(groupName, groupTimetable){
        const request = 'UPDATE groups set timetable_group = ($1) WHERE name_group = ($2);'

        try{
            await this.pool.query(request, [groupTimetable,groupName], (err, res)=>{
              if(err){
                  console.log(err)
              }
              console.log(res)
            })
        }catch (e) {
            console.log(e)
        }
    }

    async GetGroupID(GroupName){
        const request = 'SELECT id FROM groups WHERE name_group = ($1);'
        try{
            const result = (await this.pool.query(request, [GroupName])).rows[0]
            return result.id
        }catch (e) {
            console.log(e)
        }
        return 0
    }

    async GetGroupsName(){
        const request = 'SELECT name_group FROM groups ;'
        try{
            const result = (await this.pool.query(request)).rows
            return result
        }catch (e) {
            console.log(e)
        }
        return 0
    }

    async GetTimetable(GroupName){
        const request = 'SELECT timetable_group FROM groups WHERE name_group = ($1);'
        try{
            const result = (await this.pool.query(request, [GroupName])).rows[0]
            return result.timetable_group
        }catch (e) {
            console.log(e)
        }
        return 0
    }

    async GetTimetableForUser(userID){
        const request = 'SELECT timetable_group FROM (SELECT t_id, timetable_group FROM t_users INNER JOIN groups  ON t_users.my_group = groups.id)  AS foo WHERE t_id = ($1);'

        try{
            const result = (await this.pool.query(request, [userID])).rows[0]
            return result.timetable_group
        }catch (e) {
            console.log(e)
        }
        return 0
    }

    async GetUsersID(){
        const request = 'SELECT t_id FROM t_users;'

        try{
            const result = (await this.pool.query(request)).rows
            return result
        }catch (e) {
            console.log(e)
        }
        let arr = []
        return arr
    }

    async userExists(userId){
        const request = 'SELECT EXISTS (SELECT 1 FROM t_users WHERE t_id=($1));'
        try {
            const result = (await this.pool.query(request, [userId])).rows[0]
            return result.exists
        } catch (error) {
            console.log(error)
            return error
        }
    }

    async AddTelegramUser(userId, groupId) {
        const userExists = await this.userExists(userId)

        if (!userExists) {
            const request = 'INSERT INTO t_users (t_id, my_group) values (($1),($2));'
            try {
                await this.pool.query(request, [userId, groupId])

            } catch (error) {
                console.log(error)
                return false
            }
            return true
        }
        return false
    }

    async DeleteTelegramUser(userId){
        const userExists = await this.userExists(userId)
        const request = 'DELETE FROM t_users WHERE t_id = ($1);'
        if(userExists){
            try {
                await this.pool.query(request, [userId])
            } catch (error) {
                console.log(error)
                return false
            }
            return true
        }

        if(!userExists){
            return false
        }
    }


}

// const main = async ()=>{
//     const db = new Database(config.databaseURL)
//
//     const result = await db.GetUsersID()
//     console.log(result)
// }
//
// main().then(()=>{
//     console.log('done')
// })
module.exports = Database