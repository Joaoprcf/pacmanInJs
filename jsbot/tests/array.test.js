
require('../array')
test('array toS', () => {
    expect([0,0].toS()).toBe('0,0')
    expect([123,0].toS()).toBe('123,0')
    expect([0,123].toS()).toBe('0,123')
    expect([100,10].toS()).toBe('100,10')
})

test('array toC', () => {
    expect([0,0,0].toC()).toBe('0,0,0')
    expect([123,0,0].toC()).toBe('123,0,0')
    expect([0,123,0].toC()).toBe('0,123,0')
    expect([100,10,0].toC()).toBe('100,10,0')
})


test('array equal', () => {
    expect([0,0].equal([0,0])).toBe(true)
    expect([0,0].equal([0,1])).toBe(false)
    expect([1,0].equal([0,1])).toBe(false)
    expect([0,0].equal([0,0,0])).toBe(true)
})


test('array add', () => {
    expect([0,0].add([0,0])).toEqual([0,0])
    expect([1,0].add([0,0])).toEqual([1,0])
    expect([0,0].add([0,1])).toEqual([0,1])
    expect([1,0].add([0,1])).toEqual([1,1])
})

test('array sub', () => {
    expect([0,0].sub([0,0])).toEqual([0,0])
    expect([1,0].sub([0,0])).toEqual([1,0])
    expect([0,0].sub([0,1])).toEqual([0,-1])
    expect([1,0].sub([0,1])).toEqual([1,-1])
})

test('array mutiply', () => {
    expect([0,0].multiply(2)).toEqual([0,0])
    expect([1,0].multiply(-1)).toEqual([-1,0])
    expect([1,2].multiply(2)).toEqual([2,4])
    expect([1,0].multiply(10)).toEqual([10,0])
})






test('array toMap', () => {
    expect([[0,0]].toMap()).toEqual({ '0,0': [0,0] })
    expect([[1,0]].toMap()).toEqual({ '1,0': [1,0] })
    expect([[0,0],[2,4]].toMap()).toEqual({ '0,0': [0,0], '2,4': [2,4] })
})

test('array toMapOfOnes', () => {
    expect([[0,0]].toMapOfOnes()).toEqual({ '0,0': 1 })
    expect([[1,0]].toMapOfOnes()).toEqual({ '1,0': 1 })
    expect([[0,0],[2,4]].toMapOfOnes()).toEqual({ '0,0': 1, '2,4': 1})
})

test('array toGhostMap', () => {

    expect([ [ [0,0], true, 1] ].toGhostMap()).toEqual({ '0,0': 1 })
    expect([
        [[0,0],true,1],
        [[1,0],false,0],
        [[0,1],true,2]
    ].toGhostMap()).toEqual({ '0,0': 1 , '1,0': 0, '0,1': 2 })
    
})

test('array toKey', () => {

    expect([1,0].toKey()).toBe('d')
    expect([-1,0].toKey()).toBe('a')
    expect([0,1].toKey()).toBe('s')
    expect([0,-1].toKey()).toBe('w')
})
