var express = require('express');
var router = express.Router();
const ballotBox = require("../data/ballotBox")

/* GET home page. */
router.get('/', function(req, res, next) {
  let messages
  let message1
  let message1_sub
  let message2
  let message2_sub
  let message3
  let message3_sub
  let message4
  let message4_sub

  messages = 'Sign In'
  message1 = 'Connect remotely via poll'
  message1_sub = 
    `
    It's more difficult to pick up on the atmosphere of a telecon session than an offline's one.
    volavote can help you to know remote attendees to easily make various type of poll.
    `
  message2 = 'Various type of poll you can make'
  message2_sub = 
    `
    You can make a poll from a simple Yes/No style poll to a planning poker.
    Some of poll can be used as an ice-break and other can correct feedback and understand what they think.
    `
  message3 = 'Easy to deploy'
  message3_sub = 
    `
    You can deploy this application using <a href="https://hub.docker.com/r/shyamagu/volavote" target="_blank">Dokcer image</a> wherever you want.
    or you can clone source code from <a href="https://github.com/shyamagu/volavote" target="_blank">GitHub repository</a> and deploy whereever you want.
    `
  message4 = 'How to use'
  message4_sub = 
    `
    If you are an admin, please use environment variables that ADMIN_NAME is admin username and ADMIN_PASSWORD is admin password (default setting is vvadmin/vvpassword).
    If you are a volavote parent user, ask your admin about your login name/password and login at <a href="/parent" target="_blank">parent login portal</a>.
    If you are just a user of volavote, please ask your admin or parent user about poll page url or how to use.
    `

  if(req.acceptsLanguages('ja','en')=="ja"){

    messages = 'サインイン'
    message1 = 'リモートで、つながる'
    message1_sub = 
      `
      リモート会議では、直接顔が見えないため、全体状況などを雰囲気から理解することが難しいのではないでしょうか。
      volavote は各種の投票サイトを簡単に作成・シェアすることで、全体状況の理解促進をツールとしてお手伝いします。
      `
    message2 = '様々な投票サイトが簡単に作れる'
    message2_sub = 
      `
      YES/NO 投票サイトから、プランニングポーカーまで、様々なタイプの投票サイトを簡単に作成できます。（もちろん日本語対応です。）
      例えば会議冒頭のアイスブレークとして使うなども可能ですし、サーベイなどをその場で収集して会議中にお役立て頂くこともできます。
      `
    message3 = '簡単に構築できる'
    message3_sub = 
      `
      volavote は OSS なアプリケーションですが、<a href="https://hub.docker.com/r/shyamagu/volavote" target="_blank">Docker イメージ</a>も公開しています。 
      もしくは <a href="https://github.com/shyamagu/volavote" target="_blank">GitHub のリポジトリ</a> からソースコードを クローンしてお好きにデプロイしてください。
      面倒なデータベース設定などは不要です。
      volavote は揮発性のアプリケーションのため、永続的なデータストアは必要ありません。（その代わりサーバダウンとともにデータは失われます）
      `
    message4 = '使い方'
    message4_sub = 
      `
      もしあなたが volavote をデプロイした管理者でしたら、環境変数にADMIN_NAME と ADMIN_PASSWORDを設定することで、その管理者名・パスワードが使えます（デフォルト設定では、vvadmin/vvpassword です)。
      もしあなたが volavote の親ユーザでしたら、管理者にユーザ名/パスワードを確認の上で、<a href="/parent" target="_blank">親ユーザログイン画面</a> からログインして下さい。
      もしあなたが volavote のユーザでしたら、管理者またはあなたの親ユーザに、投票サイトのURLや使い方を確認して下さい。
      `

  }else{
  }

  res.render('index', 
  { title: 'volavote', signin: messages, 
    message1:message1, message1_sub:message1_sub, 
    message2:message2,message2_sub:message2_sub,
    message3:message3,message3_sub:message3_sub,
    message4:message4,message4_sub:message4_sub
  });
});

module.exports = router;
