const ballotBox = require("../data/ballotBox")

describe('ballotBox test suit',()=>{

    test('initilize Box and increment Id and check replace',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        let vvid = null
        vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        expect(ballotBox.getPollId()).toBe(1)
        expect(vvid).toEqual(expect.anything())

        vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        expect(ballotBox.getPollId()).toBe(2)
        vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        expect(ballotBox.getPollId()).toBe(3)

        const previous = Object.assign({},ballotBox.getAll())
        ballotBox.replace({})
        ballotBox.replace(previous)
        expect(ballotBox.getPollId()).toBe(3)
    })

    test('initilize Box',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        const result = ballotBox.getPollByVvid(vvid)

        expect(result).toEqual({
            TITLE: 'title1',
            ID: 0,
            TYPE: 'type1',
            IMAGE_URL:'imageurl1',
            IMAGE_W:500,
            NUMBER:3,
            DISPLAYS:['aaa','bbb','ccc'],
            ANSWER:['aaa','ccc'],
            PARENT: 'parent',
            LOCK:false,
            CONSTRAINT:'SINGLE',
            RESULT:{}
        })
    })

    test('vote',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        ballotBox.vote(vvid,'session1',[1,0])
        ballotBox.vote(vvid,'session1',[0,1])
        const result = ballotBox.getPollByVvid(vvid)

        expect(result).toEqual({
            TITLE: 'title1',
            ID: 0,
            TYPE: 'type1',
            IMAGE_URL:'imageurl1',
            IMAGE_W:500,
            NUMBER:3,
            DISPLAYS:['aaa','bbb','ccc'],
            ANSWER:['aaa','ccc'],
            PARENT: 'parent',
            CONSTRAINT:'SINGLE',
            LOCK:false,
            RESULT:{ session1 : [0,1]}
        })
    })

    test('voteMulti',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'MULTI','parent')
        ballotBox.vote(vvid,'session1',[1,0,0])
        sleep(50)
        ballotBox.vote(vvid,'session1',[0,2,0])
        const result = ballotBox.getPollByVvid(vvid)

        expect(Object.keys(result.RESULT).length).toBe(2)
    })

    test('empty Countup', ()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const returnBox = ballotBox.countUpPollByVvId('testid')
        expect(returnBox).toStrictEqual({})
    })

    test('vote Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        ballotBox.vote(vvid,'session1',[1,0,0])
        ballotBox.vote(vvid,'session1',[0,2,1])
        ballotBox.vote(vvid,'session2',[1,0,1])
        ballotBox.vote(vvid,'session3',[1,1,1])

        const returnBox = ballotBox.countUpPollByVvId(vvid)
        expect(returnBox.COUNTUP).toEqual([2,3,3])
    })

    test('voteMulti Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','type1','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'MULTI','parent')
        ballotBox.vote(vvid,'session1',[4,0,0])
        sleep(50)
        ballotBox.vote(vvid,'session1',[0,9,1])
        ballotBox.vote(vvid,'session2',[1,0,28])
        ballotBox.vote(vvid,'session3',[1,1,1])

        const returnBox = ballotBox.countUpPollByVvId(vvid)
        expect(returnBox.COUNTUP).toEqual([6,10,30])
    })

    test('vote MAP Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','MAP','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        ballotBox.vote(vvid,'session1',[ 50.05, 60.5])
        ballotBox.vote(vvid,'session1',[100.01,200.02])
        ballotBox.vote(vvid,'session2',[200.02,300.03])
        ballotBox.vote(vvid,'session3',[300.03,400.04])

        const returnBox = ballotBox.countUpPollByVvId(vvid)
        expect(returnBox.COUNTUP).toEqual([[100.01,200.02],[200.02,300.03],[300.03,400.04]])
    })

    test('voteMulti MAP Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','MAP','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'MULTI','parent')
        ballotBox.vote(vvid,'session1',[ 50.05, 60.5])
        sleep(50)
        ballotBox.vote(vvid,'session1',[100.01,200.02])
        ballotBox.vote(vvid,'session2',[200.02,300.03])
        ballotBox.vote(vvid,'session3',[300.03,400.04])

        const returnBox = ballotBox.countUpPollByVvId(vvid)
        expect(returnBox.COUNTUP).toEqual([[50.05,60.5],[100.01,200.02],[200.02,300.03],[300.03,400.04]])
    })

    test('vote TEXT Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','TEXT','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent')
        ballotBox.vote(vvid,'session1','testaaa')
        ballotBox.vote(vvid,'session1','testbbb')
        ballotBox.vote(vvid,'session2','testccc')
        ballotBox.vote(vvid,'session3','testbbb')

        const returnBox = ballotBox.countUpPollByVvId(vvid)
        expect(returnBox.COUNTUP).toEqual({testbbb:2,testccc:1})
    })

    test('voteMulti TEXT Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})

        const vvid = ballotBox.makeNewPoll('title1','TEXT','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'MULTI','parent')
        ballotBox.vote(vvid,'session1','testaaa')
        sleep(50)
        ballotBox.vote(vvid,'session1','testbbb')
        ballotBox.vote(vvid,'session2','testccc')
        ballotBox.vote(vvid,'session3','testbbb')

        const returnBox = ballotBox.countUpPollByVvId(vvid)
        expect(returnBox.COUNTUP).toEqual({testaaa:1,testbbb:2,testccc:1})
    })

    test('vote TEXT Countup',()=>{
        ballotBox.replace({})
        expect(ballotBox.box).toStrictEqual({})
        const vvid1 = ballotBox.makeNewPoll('title1','TEXT','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent1')
        const vvid2 = ballotBox.makeNewPoll('title2','TEXT','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','')
        const vvid3 = ballotBox.makeNewPoll('title3','TEXT','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent3')
        const vvid4 = ballotBox.makeNewPoll('title4','TEXT','imageurl1',500,3,['aaa','bbb','ccc'],['aaa','ccc'],'SINGLE','parent3')

        const poll1 = ballotBox.getPollByParent('parent1')
        expect(poll1[vvid1].TITLE).toBe('title1')
        expect(Object.keys(poll1).length).toBe(1)

        const poll2 = ballotBox.getPollByParent('')
        expect(poll2[vvid2].TITLE).toBe('title2')
        expect(Object.keys(poll2).length).toBe(1)

        const poll3 = ballotBox.getPollByParent('parent3')
        expect(poll3[vvid3].TITLE).toBe('title3')
        expect(poll3[vvid4].TITLE).toBe('title4')
        expect(Object.keys(poll3).length).toBe(2)
    })
})

function sleep(time) {
    const d1 = new Date();
    while (true) {
        const d2 = new Date();
        if (d2 - d1 > time) {
            return;
        }
    }
}