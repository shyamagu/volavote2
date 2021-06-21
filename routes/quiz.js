var express = require('express');
var router = express.Router();
const userTable = require("../data/userTable")
const ballotBox = require("../data/ballotBox")

/* GET users listing. */
router.get('/ranking', function(req, res, next) {
    const type = req.query.type

    if(type==='ADMIN' && req.session.ADMIN){
        const quizs = ballotBox.getPollByType('QUIZ')
        userTable.clearAllUserScore()

        let quizAttendeeSessionId = []
        Object.values(quizs).forEach(quizPoll => {
            const answer = quizPoll.ANSWER
            Object.keys(quizPoll.RESULT).forEach(sessionid=>{
                const userAnswer = quizPoll.RESULT[sessionid]

                const user = userTable.getUser(sessionid)
                if(user){
                    const userName  = user.NAME
                    const parentName= user.PARENT
                    if(!quizAttendeeSessionId.includes(sessionid)){
                        quizAttendeeSessionId.push(sessionid)
                    }
                    if(JSON.stringify(answer)===JSON.stringify(userAnswer)){
                        userTable.addUserScore(sessionid,1)
                    }
                }
            })
        });
        let userResultByParent = {}
        quizAttendeeSessionId.forEach(sessionid => {
            const user = userTable.getUser(sessionid)
            if(!userResultByParent[user.PARENT]){
                userResultByParent[user.PARENT] = []
            }
            userResultByParent[user.PARENT].push({name:user.NAME,score:user.SCORE})
        });

        res.render('poll/quiz_ranking',{title:'Quiz Ranking',data:userResultByParent})

    }else if(type==='PARENT'&& req.session.PARENT){
        const quizs = ballotBox.getPollByTypeAndParent('QUIZ',req.session.PARENT)

        userTable.clearUserScoreByParent(req.session.PARENT)

        let quizAttendeeSessionId = []
        Object.values(quizs).forEach(quizPoll => {
            const answer = quizPoll.ANSWER
            Object.keys(quizPoll.RESULT).forEach(sessionid=>{
                const userAnswer = quizPoll.RESULT[sessionid]

                const user = userTable.getUser(sessionid)
                if(user){
                    const userName  = user.NAME
                    const parentName= user.PARENT
                    if(!quizAttendeeSessionId.includes(sessionid)){
                        quizAttendeeSessionId.push(sessionid)
                    }
                    if(JSON.stringify(answer)===JSON.stringify(userAnswer)){
                        userTable.addUserScore(sessionid,1)
                    }
                }
            })
        });
        
        let userResultByParent = {}
        quizAttendeeSessionId.forEach(sessionid => {
            const user = userTable.getUser(sessionid)
            if(!userResultByParent[user.PARENT]){
                userResultByParent[user.PARENT] = []
            }
            userResultByParent[user.PARENT].push({name:user.NAME,score:user.SCORE})
        });
        
        res.render('poll/quiz_ranking',{title:'Quiz Ranking',data:userResultByParent,user:''})


    }else{
        res.render('poll/nopoll',{title:'volavote',message:'QR NOT FOUND'})
    }
});

router.post('/answer/remove', function(req, res, next) {
    const parent = req.body.parent

    if(req.session.ADMIN || req.session.PARENT === parent){
        const quizs = ballotBox.getPollByTypeAndParent('QUIZ',parent)
        Object.values(quizs).forEach(quizPoll => {
            quizPoll.RESULT = {}
        })    
        res.json({result:"OK"})
    }else{
        res.json({result:"NG",error:"INVALID ACCESS"})
    }

});

module.exports = router;