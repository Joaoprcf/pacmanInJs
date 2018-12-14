

require("../array")

function calc(dist,level,lives,boosts,lastboost) {

    const nghost = dist.length
    const visibility = [3,4,7,6][level]

    const closingvalue = dist.map(g => g>visibility ? 0 : g!=visibility ? 1 : 0.5 ).reduce((a,b) => a + b,0)
    

    const greedlevel = [1.5,3.5,4,2][level]
    

    if(lastboost!='') return null;
    return closingvalue>= Math.min(greedlevel,nghost);

} 

test('Boost process no_lastboost', ()=> {       //zombie dont move!!

    let value = calc([1],2,2,2,'something')

    expect(value).toBe(null)
})


describe('level 0 test', () => {

    it('1 ghosts', () => {

        let value = calc([1],0,3,4,'')

        expect(value).toBe(true)

        value = calc([2],0,3,4,'')

        expect(value).toBe(true)

        value = calc([4],0,3,4,'')

        expect(value).toBe(false)
    })

    it('2 ghosts', () => {

        let value = calc([1,1],0,3,4,'')

        expect(value).toBe(true)

        value = calc([2,2],0,3,4,'')

        expect(value).toBe(true)

        value = calc([2,4],0,3,4,'')

        expect(value).toBe(false)
    })


    it('4 ghosts', () => {

        let value = calc([1,1,1,1],0,3,4,'')

        expect(value).toBe(true)

        value = calc([2,2,4,4],0,3,4,'')

        expect(value).toBe(true)

        value = calc([2,3,4,4],0,3,4,'')

        expect(value).toBe(true)

        value = calc([2,4,4,4],0,3,4,'')

        expect(value).toBe(false)
    })



})


describe('level 1 test', () => {

    it('1 ghosts', () => {

        let value = calc([1],1,3,4,'')

        expect(value).toBe(true)

        value = calc([2],1,3,4,'')

        expect(value).toBe(true)

        value = calc([4],1,3,4,'')

        expect(value).toBe(false)
    })

    it('2 ghosts', () => {

        let value = calc([1,1],1,3,4,'')

        expect(value).toBe(true)

        value = calc([2,2],1,3,4,'')

        expect(value).toBe(true)

        value = calc([2,4],1,3,4,'')

        expect(value).toBe(false)
    })


    it('4 ghosts', () => {

        let value = calc([1,1,1,1],1,3,4,'')

        expect(value).toBe(true)

        value = calc([3,3,3,4],1,3,4,'')

        expect(value).toBe(true)

        value = calc([3,3,3,3],1,3,4,'')

        expect(value).toBe(true)

        value = calc([2,3,4,4],1,3,4,'')

        expect(value).toBe(false)

        value = calc([2,2,4,4],1,3,4,'')

        expect(value).toBe(false)

    })

})
