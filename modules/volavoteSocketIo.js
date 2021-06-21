const userTable = require("../data/userTable")
const ballotBox = require("../data/ballotBox")

module.exports = (io) => {
    io.on('connection',function(socket){
        socket.on('parentManaging',function(){
            const parentList = userTable.getAllParentNames() 
            io.emit('parentManaging',parentList)
        })

        socket.on('pollListingAdmin',function(){
            const pollList = ballotBox.countUpAll()
            io.emit('pollListingAdmin',pollList)
        })

        socket.on('pollListingParent',function(name){
            const pollList = ballotBox.countUpParent(name)
            io.emit('pollListingParent',{list:pollList,parent:name})
        })

        socket.on('pollCountUp',function(vvid){
            const countUp = ballotBox.countUpPollByVvIdForUser(vvid)
            io.emit('pollCountUp',countUp)
        })
    })
}