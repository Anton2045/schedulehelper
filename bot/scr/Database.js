const {Pool} = require('pg');
config = require('../config.json');


class Database {

    constructor(url){
        this.pool = new Pool({connectionString: url})
    }

    async AddGroup(groupName, groupTimetable){
        const request = 'INSERT INTO groups (group_name,  schedule_group) values (($1),($2));'

        try{
            await this.pool.query(request, [groupName, groupTimetable])
        }catch (e) {
            console.log(e)
        }
    }

    async UpdateGroup(groupName, groupTimetable){
        const request = 'UPDATE groups set  schedule_group = ($1) WHERE group_name = ($2);'

        try{
            await this.pool.query(request, [groupTimetable,groupName])
        }catch (e) {
            console.log(e)
        }
    }

    async GetGroupID(GroupName){
        const request = 'SELECT id FROM groups WHERE group_name = ($1);'
        try{
            const result = (await this.pool.query(request, [GroupName])).rows[0];
            return result.id
        }catch (e) {
            return 0
        }
    }

    async GetGroupsName(){
        const request = 'SELECT group_name FROM groups ;'
        try{
            const result = (await this.pool.query(request)).rows
            return result
        }catch (e) {
            console.log(e)
        }
        return 0
    }

    async GetTimetable(GroupName){
        const request = 'SELECT schedule_group FROM groups WHERE group_name = ($1);'
        try{
            const result = (await this.pool.query(request, [GroupName])).rows[0]
            return result.schedule_group
        }catch (e) {
            return 0
        }

    }

    async GetTimetableForUser(userID){
        const request = 'SELECT schedule_group FROM (SELECT user_id, schedule_group FROM t_users INNER JOIN groups  ON t_users.user_group = groups.id)  AS foo WHERE user_id = ($1);'

        try{
            const result = (await this.pool.query(request, [userID])).rows[0]
            return result.schedule_group
        }catch (e) {
            return 0
        }
    }

    async GetUsersID(){
        const request = 'SELECT user_id FROM t_users;'

        try{
            const result = (await this.pool.query(request)).rows
            return result
        }catch (e) {
        }
        let arr = []
        return arr
    }

    async userExists(userId){
        const request = 'SELECT EXISTS (SELECT 1 FROM t_users WHERE user_id=($1));'
        try {
            const result = (await this.pool.query(request, [userId])).rows[0]
            return result.exists
        } catch (error) {
            return error
        }
    }

    async AddTelegramUser(userId, groupId) {
        const userExists = await this.userExists(userId)

        if (!userExists) {
            const request = 'INSERT INTO t_users (user_id, user_group) values (($1),($2));'
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
        const request = 'DELETE FROM t_users WHERE user_id = ($1);'
        if(userExists){
            try {
                await this.pool.query(request, [userId])
            } catch (error){
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


module.exports = Database