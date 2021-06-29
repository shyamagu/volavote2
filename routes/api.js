module.exports = function(io) {

  var express = require('express');
  var router = express.Router();
  const ballotBox = require("../data/ballotBox")
  const userTable = require("../data/userTable")

  router.post('/login',function(req,res,next){

    const type = req.body.type
    const name = req.body.name
    const password = req.body.password

    if(type === "ADMIN"){
      if(name===process.env.ADMIN_NAME && password===process.env.ADMIN_PASSWORD){
        req.session.ADMIN = process.env.ADMIN_NAME
        res.json({login:"OK",redirect:"/admin"})
      }else{
        res.json({login:"NG",error:"Invalid Name or Password"})
      }
    }else if(type === "PARENT"){
      if(userTable.loginAsParent(name,password)){
        req.session.PARENT = name
        res.json({login:"OK",redirect:"/parent"})
      }else{
        res.json({login:"NG",error:"Invalid Name or Password"})
      }
    }else if(type === "USER"){

      const code = req.body.code
      const parent = req.body.parent
      const vvid = req.body.vvid
      const parent_code = req.body.parentcode

      if(code && process.env.POLL_CODE === code){
        req.session.CODE = code
      }

      if(name){
        req.session.NAME = name
        userTable.loginAsNewUser(req.session.id,name,parent)
      }

      if(parent){
        req.session.PARENT_NAME = parent

        if(parent_code && parent_code === userTable.getParent(parent).requireParentCode){
          req.session.PARENT_CODE = parent_code
        }
      }

      if(vvid){
        res.json({login:"OK",redirect:"/poll?vvid="+vvid})
      }else{
        res.json({login:"OK",redirect:"/poll/create?parent="+parent})
      }

    }
  });

  router.post('/create',function(req,res,next){

    if(req.session.ADMIN || req.session.PARENT || process.env.ANONIMOUS_CREATE==='true'|| userTable.getParent(req.body.parent).childrenPollCreate){

      const title = req.body.title
      const type = req.body.type
      let imageurl = req.body.imageUrl
      const imageTemplate = req.body.imageTemplate
      const imageWidth = req.body.imageWidth
      let number = req.body.number
      let displays = req.body.displays
      const answer = req.body.answer
      const constraint = req.body.constraint
      const parent = req.body.parent
      const user   = req.body.user

      if(type==='ALT'){
        number = 2
        displays = ["YES","NO"]
      }

      if(type==='MAP'){
        if(imageTemplate==='JAPAN') imageurl = '/images/japan.gif'
        if(imageTemplate==='WORLD') imageurl = '/images/world_img.png'
      }

      const vvid = ballotBox.makeNewPoll(title,type,imageurl,imageWidth,number,displays,answer,constraint,parent,user)
      io.emit('pollListingAdmin',ballotBox.countUpAll())
      io.emit('pollListingParent',{list:ballotBox.countUpParent(parent),parent:parent})

      res.json({result:"OK",vvid:vvid})
    }else{
      res.json({result:"NG",error:"CAN NOT CREATE POLL"})
    }

  })

  router.post('/switch',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN && poll){
      io.emit('switchToUrl',{url:"/poll?vvid="+vvid,from:"volavote"})
      io.emit('pollListingAdmin',ballotBox.countUpAll())
      res.json({result:"OK"})
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })

  router.post('/parentswitch',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(poll.PARENT === req.session.PARENT && poll){
      io.emit('switchToUrl',{url:"/poll?vvid="+vvid,from:poll.PARENT})
      io.emit('pollListingParent',{list:ballotBox.countUpParent(req.session.PARENT),parent:poll.PARENT})
      res.json({result:"OK"})
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })

  router.post('/emphasize',function(req,res,next){
    const vvid = req.body.vvid
    const emphasize = req.body.emphasize
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN || poll.PARENT === req.session.PARENT){
      io.emit('emphasizeVote',{vvid:vvid,index:emphasize})
      res.json({result:"OK"})
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })

  router.post('/lock',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN || poll.PARENT === req.session.PARENT){
      ballotBox.setLockPoll(vvid,true)

      io.emit('pollListingAdmin',ballotBox.countUpAll())
      io.emit('pollListingParent',{list:ballotBox.countUpParent(req.session.PARENT),parent:poll.PARENT})
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })

  router.post('/unlock',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN || poll.PARENT === req.session.PARENT){
      ballotBox.setLockPoll(vvid,false)

      io.emit('pollListingAdmin',ballotBox.countUpAll())
      io.emit('pollListingParent',{list:ballotBox.countUpParent(req.session.PARENT),parent:poll.PARENT})
      res.json({result:"OK"})
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })

  router.post('/clear',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN || poll.PARENT === req.session.PARENT){

      if(ballotBox.removePollResult(vvid)){

        io.emit('pollListingAdmin',ballotBox.countUpAll())
        io.emit('pollListingParent',{list:ballotBox.countUpParent(req.session.PARENT),parent:poll.PARENT})

        res.json({result:"OK"})
      }else{
        res.json({result:"NG",error:"CAN NOT REMOVE POLL RESULT"})
      }
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }

  })

  router.post('/delete',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN || poll.PARENT === req.session.PARENT){
      if(ballotBox.deletePoll(vvid)){
        io.emit('pollListingAdmin',ballotBox.countUpAll())
        io.emit('pollListingParent',{list:ballotBox.countUpParent(req.session.PARENT),parent:poll.PARENT})

        res.json({result:"OK"})
      }else{
        res.json({result:"NG",error:"CAN NOT DELETE NON-EXIST POLL"})
      }
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })

  router.post('/result',function(req,res,next){
    const vvid = req.body.vvid
    const poll = ballotBox.getPollByVvid(vvid)

    if(req.session.ADMIN || poll.PARENT === req.session.PARENT){
      ballotBox.setLockPoll(vvid,true)

      if(poll.TYPE==='QUIZ'){
        io.emit('showResult',{vvid:vvid,answer:poll.ANSWER})
      }else if(poll.TYPE==='PPK'){
        let returnData = new Array(poll.NUMBER)
        for(let index = 0; index < poll.NUMBER ; index++){
          returnData[index] = new Array()
        }
        Object.keys(poll.RESULT).forEach(sessionid=>{
          const user = userTable.getUser(sessionid)
          if(user){
            poll.RESULT[sessionid].forEach((element,index) =>{
              if(element===1){
                returnData[index].push(user.NAME)
              }
            })
          }
        })
        const countUp = ballotBox.countUpPollByVvIdForUser(vvid)
        io.emit('showResult',{vvid:vvid,countup:countUp,users:returnData})
      }
      
      io.emit('pollListingAdmin',ballotBox.countUpAll())
      io.emit('pollListingParent',{list:ballotBox.countUpParent(req.session.PARENT),parent:poll.PARENT})

      res.json({result:"OK"})
    }else{
      res.json({result:"NG",error:"INVALID ACCESS"})
    }
  })


  return router
}