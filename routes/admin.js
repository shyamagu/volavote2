module.exports = function(io) {

  var express = require('express');
  var router = express.Router();
  const users = require("../data/userTable")
  const ballotBox = require('../data/ballotBox')

  router.use(function (req,res,next){
    if(req.session.ADMIN === process.env.ADMIN_NAME){
      next()
    }else{
      res.render('login',{title:"ADMIN LOGIN",action:"/api/login",type:"ADMIN"})
    }
  });

  /* GET users listing. */
  router.get('/', function(req, res, next) {
      res.render('control_admin',{title:"VOLAVOTE ADMIN",type:"ADMIN",name:'',user:''})
  });

  router.get('/signout',function(req,res,next){
      if(req.session.ADMIN){
        req.session.ADMIN = ""
        res.render('poll/nopoll',{title:'volavote',message:'SIGNED OUT'})
      }else{
        res.render('poll/nopoll',{title:'volavote',message:'INVALID ACCESS'})
      }
  })

  router.post('/parent',function(req,res,next){
    const name = req.body.name
    const password = req.body.password
    if(name && password){
      const result = users.createParentUser(name,password)

      if(result){
        io.emit('parentManaging',users.getAllParentNames())
        res.json({result:"OK"})
      }else{
        res.json({result:"NG",error:"Invalid name"})
      }

    }else{
      res.json({result:"NG",error:"Invalid name or password"})
    }
  });

  router.post('/parent/delete',function(req,res,next){
    const name = req.body.name
    const result = users.deleteParentUser(name)

      if(result){
        io.emit('parentManaging',users.getAllParentNames())
        res.json({result:"OK"})
      }else{
        res.json({result:"NG",error:"Invalid name"})
      }
  })

  router.get('/setting',function(req,res,next){
    res.json({
      result:"OK",
      checkAnonymousCreate:process.env.ANONIMOUS_CREATE,
      checkRequireCode:process.env.REQUIRE_CODE,
      pollCode:process.env.POLL_CODE,
      checkRequireName:process.env.REQUIRE_NAME,
    })
  })

  router.post('/setting',function(req,res,next){

    const ENV_NAME = req.body.envName
    const VALUE = req.body.valueStr

    if(ENV_NAME==='ANONIMOUS_CREATE' || ENV_NAME==='REQUIRE_CODE' || ENV_NAME==='POLL_CODE' || ENV_NAME==='REQUIRE_NAME'){

      process.env[ENV_NAME] = VALUE
      if(ENV_NAME==='REQUIRE_CODE' && VALUE==='false'){
        process.env.POLL_CODE = ""
      }
      res.json({result:"OK"})
    }else{
      res.json({result:"NG",erro:"illegal access denied"})
    }

  })

  router.post('/export',function(req,res,next){

    const types = req.body.types
    const exportdata = {}

    if(types.includes("SETTING")){
      exportdata["SETTING"]={
        checkAnonymousCreate:process.env.ANONIMOUS_CREATE,
        checkRequireCode:process.env.REQUIRE_CODE,
        pollCode:process.env.POLL_CODE,
        checkRequireName:process.env.REQUIRE_NAME,
      }
    }else{
      exportdata["SETTING"]={}
    }

    if(types.includes("POLL")){
      exportdata["POLL"]=ballotBox.getAll()
    }else{
      exportdata["POLL"]={}
    }

    if(types.includes("PARENT")){
      exportdata["PARENT"]=users.getAllParent()
    }else{
      exportdata["PARENT"]={}
    }

    if(types.includes("USER")){
      exportdata["USER"]=users.getAllUser()
    }else{
      exportdata["USER"]={}
    }

    res.json({result:"OK",export:exportdata})
  })

  router.post('/import',function(req,res,next){
    const importedJson = req.body.import

    if(importedJson["SETTING"]){
      process.env.ANONIMOUS_CREATE = importedJson["SETTING"]["checkAnonymousCreate"]
      process.env.REQUIRE_CODE = importedJson["SETTING"]["checkRequireCode"]
      process.env.POLL_CODE = importedJson["SETTING"]["pollCode"]
      process.env.REQUIRE_NAME = importedJson["SETTING"]["checkRequireName"]
    }
    if(importedJson["POLL"]){
      ballotBox.replace(importedJson["POLL"])
      io.emit('pollListingAdmin',ballotBox.countUpAll())
    }
    if(importedJson["PARENT"]){
      users.setAllParent(importedJson["PARENT"])
      io.emit('parentManaging',users.getAllParentNames())
    }
    if(importedJson["USER"]){
      users.setAllUser(importedJson["USER"])
    }

    res.json({result:"OK"})
  })

  return router
}
