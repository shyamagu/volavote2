const {v4:uuidv4}=require('uuid')

class BallotBox {

    constructor(){
        this.box = {}
        this.id = 0
        this.current = null
    }

    makeNewPoll(title,type,image,imageWidth,number,displays,answer,constraint,parent,user){
        const vvid = uuidv4();
        this.box[vvid] = {}
        this.box[vvid]["ID"]=this.id++
        this.box[vvid]["TITLE"]=title
        this.box[vvid]["TYPE"]=type
        this.box[vvid]["IMAGE_URL"]=image
        this.box[vvid]["IMAGE_W"]=imageWidth
        this.box[vvid]["NUMBER"]=number
        this.box[vvid]["DISPLAYS"]=displays
        this.box[vvid]["ANSWER"]=answer
        this.box[vvid]["CONSTRAINT"]=constraint
        this.box[vvid]["PARENT"]=parent
        this.box[vvid]["USER"]=user
        this.box[vvid]["LOCK"]=false
        this.box[vvid]["RESULT"]={}

        return vvid
    }

    getPollByVvid(vvid){
        if(!vvid) return null
        return this.box[vvid]
    }

    getPollByParent(parent){
        let pollByParent = {}
        Object.keys(this.box).forEach(vvid => {
            if(this.box[vvid].PARENT === parent){
                pollByParent[vvid] = this.box[vvid]
            }
        });
        return pollByParent
    }

    setLockPoll(vvid,lock){
        this.box[vvid].LOCK = lock
    }

    deletePoll(vvid){
        return delete this.box[vvid]
    }

    getPollId(){
        return this.id
    }

    replace(box){
        this.box = box
        this.id = Object.keys(box).length
        this.current = null
    }

    getAll(){
        return this.box
    }

    getPollByType(type){
        let pollByType = {}
        Object.keys(this.box).forEach(vvid => {
            if(this.box[vvid].TYPE === type){
                pollByType[vvid] = this.box[vvid]
            }
        });
        return pollByType
    }

    getPollByTypeAndParent(type,parent){
        let pollByType = {}
        Object.keys(this.box).forEach(vvid => {
            if(this.box[vvid].TYPE === type && this.box[vvid].PARENT === parent){
                pollByType[vvid] = this.box[vvid]
            }
        });
        return pollByType
    }


    vote(vvid,sessionid,vote){
        if(this.box[vvid]["CONSTRAINT"]==="SINGLE"){
            this.box[vvid]["RESULT"][sessionid] = vote
        }else{
            this.box[vvid]["RESULT"][sessionid+"@"+Date.now()] = vote
        }
    }

    countUpAll(){
        let returnBoxList = []
        Object.keys(this.box).forEach(vvid => {
            if(vvid) returnBoxList.push(this.countUpPollByVvId(vvid,true))
        });
        return returnBoxList
    }

    countUpParent(parentName){
        let returnBoxList = []
        Object.keys(this.box).forEach(vvid => {
            const poll = this.getPollByVvid(vvid)
            if(poll && poll.PARENT === parentName) returnBoxList.push(this.countUpPollByVvId(vvid,true))
        });
        return returnBoxList
    }

    countUpPollByVvIdForUser(vvid){
        return this.countUpPollByVvId(vvid,false)
    }

    countUpPollByVvId(vvid,control){
        const pollResult = this.getPollByVvid(vvid)
        if(!pollResult) return {}

        let returnBox = {}
        returnBox["VVID"] = vvid
        returnBox["NUMBER"]=pollResult.NUMBER
        if(control){
            returnBox["TITLE"]=pollResult.TITLE
            returnBox["PARENT"]=pollResult.PARENT
            returnBox["USER"]=pollResult.USER
            returnBox["TYPE"] =pollResult.TYPE
            returnBox["ID"]=pollResult.ID
            returnBox["CURRENT"] = (this.id===this.current)
            returnBox["IMAGE_URL"]=pollResult.IMAGE_URL
            returnBox["IMAGE_W"]=pollResult.IMAGE_W
            returnBox["DISPLAYS"]=pollResult.DISPLAYS
            returnBox["ANSWER"]=pollResult.ANSWER
        }
        returnBox["CONSTRAINT"]=pollResult.CONSTRAINT
        returnBox["LOCK"]=pollResult.LOCK

        if(pollResult.TYPE === "MAP"){
            returnBox["COUNTUP"]=[]
            const result = pollResult["RESULT"]
            for(let key in result){
                returnBox["COUNTUP"].push(result[key])
            }

        }else if(pollResult.TYPE === "TEXT"){
            returnBox["COUNTUP"]={}
            let result = pollResult["RESULT"]
            for(let key in result){
                returnBox["COUNTUP"][result[key]] = (returnBox["COUNTUP"][result[key]])? returnBox["COUNTUP"][result[key]]+1 : 1;
            }
        }else{
            let countup = new Array(Number(returnBox["NUMBER"])).fill(0)
            let result = pollResult["RESULT"]
            for(let key in result){
                countup = result[key].map((el,index)=>countup[index]+=el)
            }
            returnBox["COUNTUP"]=countup
        }
        return returnBox
    }
}

module.exports = new BallotBox()