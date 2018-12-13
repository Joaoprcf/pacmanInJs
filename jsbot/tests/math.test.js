

require("../array")

function calc(dist,level,lives,boosts,lastboost) {

    const nghost = dist.length
    const visibility = [2,4,8,8][level]

    const closingvalue = dist.map(g => g>visibility ? 0 : (visibility*2-g+1)/(visibility*2)  ).reduce((a,b) => a + b,0)/nghost
    
    const greedlevel = [3,1.5,1,3][level]
    const greedlives = [2,1.8,1.6][lives-1]
    const greedboosts = [3,2.8,2.6,2.4][boosts-1]
   
    if(lastboost!='') return null;
    return  greedlevel*greedboosts*greedlives*closingvalue;

} 

test('Boost process no_lastboost', ()=> {       //zombie dont move!!

    let value = calc([1],2,2,2,'something')

    expect(value).toBe(null)
})

test('Best Reward Possible', ()=> {       //zombie dont move!!          //ghostspawn area

    let value = calc([1],3,1,1,'')

    expect(value).toBeCloseTo(18)

    value = calc([1,1,1,1],3,1,1,'')

    expect(value).toBeCloseTo(18)
})

test('0 Reward', ()=> {       //zombie dont move!!          //ghostspawn area

    let value = calc([9],2,3,4,'')

    expect(value).toBeCloseTo(0)

    value = calc([9,9,9,9],2,3,4,'')

    expect(value).toBeCloseTo(0)
})

test('Worf it', ()=> {       //zombie dont move!!          //ghostspawn area

    let value = calc([4],1,1,1,'')
    expect(value).toBeGreaterThan(5)
    console.log('worf it',value)
    let value2 = calc([4,4,4,4],1,1,1,'')
    expect(value2).toBeCloseTo(value)
    console.log('worf it',value)
})


test('Not Worth it', ()=> {       //zombie dont move!!          //ghostspawn area

    let value = calc([4],1,3,4,'')
    expect(value).toBeLessThan(4)

    value = calc([4,4,4,8],2,3,4,'')
    expect(value).toBeLessThan(4)
    console.log('v',value)
})