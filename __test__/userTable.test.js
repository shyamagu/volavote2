const users = require("../data/userTable")

describe('users test suit',()=>{

    test('create parent, update and login',()=>{
        users.parents = {}
        users.users = {}
        const p1 = users.createParentUser('parent1','parentpass1')
        expect(p1).toBe(true)
        expect(users.parents.parent1).toEqual(expect.anything())

        const p2 = users.createParentUser('parent1','parentpass2')
        expect(p2).toBe(false)

        users.createParentUser('parent2','parentpass2')

        const numOfParent = users.getAllParentNames().length
        expect(numOfParent).toBe(2)

        const login1 = users.loginAsParent('parent1','parentpass1')
        expect(login1).toBe(true)
        const login2 = users.loginAsParent('parent1','parentpass2')        
        expect(login2).toBe(false)
        const login3 = users.loginAsParent('parent2','parentpass1')        
        expect(login3).toBe(false)

        const update1 = users.updateParentUser('parent1','parentpass2')
        expect(update1).toBe(true)
        const login4 = users.loginAsParent('parent1','parentpass1')
        expect(login4).toBe(false)
        const login5 = users.loginAsParent('parent1','parentpass2')
        expect(login5).toBe(true)

        const update2 = users.updateParentUser('parent5','parentpass1')
        expect(update2).toBe(false)
    })

    test('login users and get them',()=>{
        users.users = {}
        expect(users.getAllUser()).toStrictEqual({})

        const u1 = users.loginAsNewUser('session1','user1','parent1')
        const u2 = users.loginAsNewUser('session2','user2',null)
        const u3 = users.loginAsNewUser('session3','user3','parent1')
        const u4 = users.loginAsNewUser('session3','user4','parent2')
        const u11= users.loginAsNewUser('session4','user1','parent2')


        expect(u1).toBe(true)
        expect(u2).toBe(true)
        expect(u3).toBe(true)
        expect(u4).toBe(true)
        expect(u11).toBe(true)

        const alluser = users.getAllUser()
        expect(Object.keys(alluser).length).toBe(4)

        const p1user = users.getUserByParent('parent1')
        expect(Object.keys(p1user).length).toBe(1)
        const p2user = users.getUserByParent('parent2')
        expect(Object.keys(p2user).length).toBe(2)
        const npuser = users.getUserByParent(null)
        expect(Object.keys(npuser).length).toBe(1)

    })
})