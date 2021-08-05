module.exports = function(io) {

  var express = require('express');
  var router = express.Router();
  const users = require("../data/userTable")
  const ballotBox = require('../data/ballotBox')

  router.use(function (req,res,next){
    if(req.session.PARENT){
      next()
    }else{
      res.render('login',{title:"PARENT LOGIN",action:"/api/login",type:"PARENT"})
    }
  });

  /* GET users listing. */
  router.get('/', function(req, res, next) {
      res.render('control_parent',{title:"VOLAVOTE PARENT",type:"PARENT",parent:req.session.PARENT,name:req.session.PARENT,user:''})
  });

  router.get('/signout',function(req,res,next){
      if(req.session.PARENT){
        req.session.PARENT = ""
        res.render('poll/nopoll',{title:'volavote',message:'SIGNED OUT'})
      }else{
        res.render('poll/nopoll',{title:'volavote',message:'INVALID ACCESS'})
      }
  })

  router.get('/setting',function(req,res,next){

    const name = req.session.PARENT
    const parent = users.getParent(name)

    res.json({
      result:"OK",
      checkRequireParentName:parent.requireParentName,
      checkRequireName:parent.requireUserName,
      childrenPollCreate:parent.childrenPollCreate,
      requireParentCode:parent.requireParentCode
    })
  })

  router.post('/setting',function(req,res,next){

    const field = req.body.field
    const value = req.body.value

    if(field === 'requireParentName' || field === 'requireUserName' || field === 'childrenPollCreate' || field === 'requireParentCode'){
      users.setParentConfig(req.session.PARENT,field,value)
      res.json({result:"OK"})
    }else{
      res.json({result:"NG",erro:"illegal access denied"})
    }

  })

  router.post('/export',function(req,res,next){

    const types = req.body.types
    const exportdata = {}

    if(types.includes("POLL")){
      exportdata["POLL"]=ballotBox.getPollByParent(req.session.PARENT)
    }else{
      exportdata["POLL"]={}
    }

    res.json({result:"OK",export:exportdata})
  })

  return router
}
