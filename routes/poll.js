module.exports = function(io) {
        
    var express = require('express');
    var router = express.Router();
    const ballotBox = require("../data/ballotBox")
    const userTable = require("../data/userTable")
    
    /* GET home page. */
    router.get('/', function(req, res, next) {

        const poll = ballotBox.getPollByVvid(req.query.vvid)
        const requestParent = req.query.parent
        const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
        const ogpImageUrl = req.protocol + '://' + req.get('host') + "/images/volavote_ogp.png"

        if(poll){
            //CODEやユーザ名、親名の必須チェックとログイン画面へ返す
            let checks = []
            if(process.env.REQUIRE_CODE==='true' && req.session.CODE !== process.env.POLL_CODE){
                checks.push("REQUIRE_CODE")
            }

            if(process.env.REQUIRE_NAME==='true' && !req.session.NAME){
                checks.push("REQUIRE_NAME")
            }

            if(poll.PARENT){
                const parent = userTable.getParent(poll.PARENT)

                if(parent.requireUserName===true && !req.session.NAME){
                    if(!checks.includes("REQUIRE_NAME")){
                        checks.push("REQUIRE_NAME")
                    }
                }

                if(parent.requireParentName===true && req.session.PARENT_NAME !== poll.PARENT){
                        checks.push("REQUIRE_PARENT_NAME")
                }

                if(parent.requireParentCode && req.session.PARENT_CODE !== parent.requireParentCode){
                    checks.push("REQUIRE_PARENT_CODE")
                }
            }

            if(checks.length > 0){
                res.render('login_user',{title:"USER LOGIN",action:"/api/login",type:"USER",conditions:checks,vvid:req.query.vvid,parent:requestParent})
                return
            }

            let setting = { 
                        title: poll.TITLE,
                        vvid: req.query.vvid,
                        image: poll.IMAGE_URL, 
                        number: poll.NUMBER, 
                        displays: poll.DISPLAYS,
                        parent:poll.PARENT,
                        lock:poll.LOCK,
                        user:req.session.NAME,
                        fullurl:fullUrl,
                        ogpimageurl:ogpImageUrl,
                    }

            switch(poll.TYPE){
                case 'ALT':
                    res.render('poll/yesno', setting);
                break;
                case 'MULTI':
                    res.render('poll/multi', setting);
                break;
                case 'SURVEY':
                    res.render('poll/survey',setting);
                break;
                case 'MAP':
                    setting["width"] = poll.IMAGE_W
                    res.render('poll/map',setting);
                break;
                case 'TEXT':
                    res.render('poll/text',setting);
                break;
                case 'WORD':
                    res.render('poll/wordcloud',setting);
                break;
                case 'QUIZ':
                    res.render('poll/quiz',setting);
                break;
                case 'PPK':
                    res.render('poll/poker',setting);
                break;
                case 'INFO':
                    res.render('poll/info',setting);
                break;
                default:
                    res.render('poll/nopoll',{title:'volavote',message:'POLL NOT FOUND'})
            }
        }else{
                    res.render('poll/nopoll',{title:'volavote',message:'POLL NOT FOUND'})
        }
    });

    router.get('/signout',function(req,res,next){
      if(req.session.NAME){
        req.session.NAME = ""
        res.render('poll/nopoll',{title:'volavote',message:'SIGNED OUT'})
      }else{
        res.render('poll/nopoll',{title:'volavote',message:'INVALID ACCESS'})
      }
    })

    router.post('/vote', function(req, res, next) {
        const vvid = req.body.vvid
        const vote = req.body.vote

        const poll = ballotBox.getPollByVvid(vvid)
        if(poll){

            if(poll.LOCK === false){
                ballotBox.vote(vvid,req.session.id,vote)

                io.emit('pollCountUp',ballotBox.countUpPollByVvIdForUser(vvid))
                io.emit('pollListingAdmin',ballotBox.countUpAll())

                if(poll.PARENT){
                  io.emit('pollListingParent',{list:ballotBox.countUpParent(poll.PARENT),parent:poll.PARENT})
                }
                res.json({result:"OK"})
            }else{
                res.json({result:"NG",error:"POLL CLOSED"})
            }
        }else{
        res.json({result:"NG",error:"NO SUCH POLL"})
        }
    });

    router.get('/showqr',function(req,res,next){
        const vvid = req.query.vvid
        let pollCode

        const poll = ballotBox.getPollByVvid(vvid)
        if(poll && (req.session.ADMIN || poll.PARENT === req.session.PARENT)){
            const fullurl = req.protocol + '://' + req.get('host') + "/poll?vvid=" + vvid;

            if(process.env.REQUIRE_CODE==="true"){
                pollCode = process.env.POLL_CODE? process.env.POLL_CODE: ""
            }

            let parentCode = ""
            if(userTable.getParent(poll.PARENT)){
                parentCode = userTable.getParent(poll.PARENT).requireParentCode
            }

            res.render('poll/qr',{title:poll.TITLE,url:fullurl,code:pollCode,parent:poll.PARENT,parent_code:parentCode})
        }else{
            res.render('poll/nopoll',{title:'volavote',message:'QR NOT FOUND'})
        }
    })

    router.get('/create',function(req,res,next){
        const parent = req.query.parent

        //CODEやユーザ名、親名の必須チェックとログイン画面へ返す
        let checks = []
        if(process.env.REQUIRE_CODE==='true' && req.session.CODE !== process.env.POLL_CODE){
            checks.push("REQUIRE_CODE")
        }

        if(process.env.REQUIRE_NAME==='true' && !req.session.NAME){
            checks.push("REQUIRE_NAME")
        }

        if(parent){
            const parentData = userTable.getParent(parent)

            if(parentData.requireUserName===true && !req.session.NAME){
                if(!checks.includes("REQUIRE_NAME")){
                    checks.push("REQUIRE_NAME")
                }
            }

            if(parentData.requireParentName===true && req.session.PARENT_NAME !== parent){
                    checks.push("REQUIRE_PARENT_NAME")
            }

            if(parentData.requireParentCode && req.session.PARENT_CODE !== parentData.requireParentCode){
                checks.push("REQUIRE_PARENT_CODE")
            }
        }

        if(checks.length > 0){
            res.render('login_user',{title:"USER LOGIN",action:"/api/login",type:"USER",conditions:checks,vvid:req.query.vvid,parent:parent})
            return
        }


        if(!parent && process.env.ANONIMOUS_CREATE==='false'){
            res.render('poll/nopoll',{title:'volavote',message:'PERMISSION DENIED'})
            return
        }

        if(!parent){
            if(process.env.ANONIMOUS_CREATE==='true'){
                res.render('control_user',{title:"VOLAVOTE",type:"USER",name:'',user:''})
            }else{
                res.render('poll/nopoll',{title:'volavote',message:'PERMISSION DENIED'})
            }
        }else{
            const parentData = userTable.getParent(parent)
            if(parentData.childrenPollCreate){
                res.render('control_user',{title:"VOLAVOTE",type:"USER",name:parent,user:req.session.NAME})
            }else{
                res.render('poll/nopoll',{title:'volavote',message:'PERMISSION DENIED'})
            }
        }
    })


    return router
}
