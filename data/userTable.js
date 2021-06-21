const crypto = require('crypto');

class UserTable {

    constructor(){
        this.parents = {}
        this.users = {}
    }

    createParentUser(name,password){
        if(this.parents[name]) return false
        this.parents[name] = {}
        this.parents[name]["password"] = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
        return true
    }

    updateParentUser(name,password){
        if(!this.parents[name]) return false
        this.parents[name]["password"] = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
        return true
    }

    deleteParentUser(name){
        return delete this.parents[name]
    }

    loginAsParent(name,password){
        const hashed = crypto.createHash('sha256').update(password, 'utf8').digest('hex');
        if(!this.parents[name]){
            return false
        }

        if(this.parents[name]["password"] === hashed){
            return true
        }else{
            return false
        }
    }

    getAllParentNames(){
        return Object.keys(this.parents)
    }

    loginAsNewUser(sessionid,name,parent){
        this.users[sessionid] = {NAME:name, PARENT:parent, SCORE: 0}
        return true
    }

    setParentConfig(name,field,value){
        this.parents[name][field] = value
    }

    getAllParent(){
        return this.parents
    }
    getAllUser(){
        return this.users
    }

    setAllParent(parents){
        this.parents = parents
    }
    setAllUser(users){
        this.users = users
    }

    getParent(name){
        return this.parents[name]
    }

    setParent(name, parent){
        this.parents[name] = parent
    }

    getUserByParent(parent){
        let userByParent = {}
        Object.keys(this.users).forEach(sessionid=>{
            if(this.users[sessionid].PARENT === parent){
                userByParent[sessionid] = this.users[sessionid]
            }
        })
        return userByParent
    }

    getUser(sessionid){
        return this.users[sessionid]
    }
    clearAllUserScore(){
        Object.keys(this.users).forEach(sessionid=>{
            this.users[sessionid].SCORE = 0
        })
    }
    clearUserScoreByParent(parent){
        Object.keys(this.users).forEach(sessionid=>{
            if(this.users[sessionid].PARENT === parent){
                this.users[sessionid].SCORE = 0
            }
        })
    }
    addUserScore(sessionid,score){
        if(!this.users[sessionid]) return false
        this.users[sessionid].SCORE = this.users[sessionid].SCORE + score
        return true
    }
}

module.exports = new UserTable()