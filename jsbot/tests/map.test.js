require("../array")
const Board = require("../map")


test('testing map1 loading', () => {
    const board = new Board('data/map1.bmp');
    expect(board.width).toBe(19)
    expect(board.height).toBe(31)
    expect(board.nextpos([0,15],[-1,0])).toEqual([18,15])
    expect(board.nextpos([3,15],[0,1])).toEqual([3,15])
    expect(board.nextpos([6,15],[0,1])).toEqual([6,16])
})