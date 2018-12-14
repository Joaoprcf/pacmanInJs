
require("../array")
const Board = require("../map")
const TreeSearch = require("../treesearch")

test('tree search map1 loading', ()=> {
    const board = new Board('data/map1.bmp');
    const st = new TreeSearch(board,{ 
        boost:  {'5,10': [5,10] },
        ghosts: {'9,15': 0 }, 
        ghostlist: [[9,15]]
    })
    expect(st.board).toBe(board)
    expect(st.ghosts).toEqual({'9,15': 0 })
    expect(st.boost).toEqual({'5,10': [5,10] })
})


///

test('tree search map1 funcionality 1 ghost', ()=> { 
    const board = new Board('data/map1.bmp');
    const st = new TreeSearch(board,{ 
        boost:  {'5,10': [5,10] },
        ghosts: {'9,15': 0 }, 
        ghostlist: [[9,15]]
    })
    expect(st.level).toBe(1)

    expect(st.nghost).toBe(1)
    expect(st.ghmoves).toBe(4)

    let dist = st.updateghostlayer([3,15])

    expect(dist).toEqual([ 6 ])
    expect(st.ghosts).toEqual({'9,15': 0 })     //never destroy values
    expect(st.boost).toEqual({'5,10': [5,10] })    //never destroy values
    expect(st.ghostlist).toEqual([[9,15]])      //never destroy values
    

    
    expect(st.ghosts).toEqual({'9,15': 0 })     //never destroy values
    expect(st.boost).toEqual({'5,10': [5,10] })    //never destroy values
    expect(st.ghostlist).toEqual([[9,15]])      //never destroy values

   
})


///



test('tree search map1 funcionality 4 ghosts', ()=> { 
    const board = new Board('data/map1.bmp');
    const st = new TreeSearch(board,{ 
        boost:  {'5,10': [5,10] },
        ghosts: {'9,15': 0 }, 
        ghostlist: [[9,15],[9,15],[9,15],[9,15]]
    })
    expect(st.level).toBe(1)
    
    expect(st.nghost).toBe(4)
    expect(st.ghmoves).toBe(4)

    let dist = st.updateghostlayer([3,15])

    expect(dist).toEqual([ 6, 6, 6, 6 ])
    expect(st.ghosts).toEqual({'9,15': 0 })     //never destroy values
    expect(st.boost).toEqual({'5,10': [5,10] })    //never destroy values
    expect(st.ghostlist).toEqual([[9,15],[9,15],[9,15],[9,15]])      //never destroy values
    




    
    expect(st.ghosts).toEqual({'9,15': 0 })     //never destroy values
    expect(st.boost).toEqual({'5,10': [5,10] })    //never destroy values
    expect(st.ghostlist).toEqual([[9,15],[9,15],[9,15],[9,15]])      //never destroy values


})


test('tree search specific function', ()=> { 
    
})
