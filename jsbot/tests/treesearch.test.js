
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
    expect(st.glayers).toEqual([{},{},{},{}])
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
    

    expect(st.glayers).toEqual([ 
        { '9,15': 0 },
        { '8,15': -1, '9,15': 0 },
        { '7,15': -2, '8,15': -1, '9,15': 0 },
        { '6,15': -3, '7,15': -2, '8,15': -1, '9,15': 0 },
        { '5,15': -4, '6,15': -3, '7,15': -2, '8,15': -1, '9,15': 0 } 
    ])




    let ghostbait = st.ghostsurrondings()

    
    expect(st.ghosts).toEqual({'9,15': 0 })     //never destroy values
    expect(st.boost).toEqual({'5,10': [5,10] })    //never destroy values
    expect(st.ghostlist).toEqual([[9,15]])      //never destroy values

    expect(ghostbait['4,15']).toBe(16)
})


///

/* function premadefunc({ this_nghost = 4 , ghostpath , newpos }) {

    let newghostpaths = []
    let newposS = newpos.toS()
    for(let i=0; i<this_nghost ; i++) {
        //add non movment of ghosts
        let index = ghostpath[i].findIndex(g => newpos.equal(g))
        if(index==0) newghostpaths.push([newpos])
        else if(index!=-1)        //check if
            newghostpaths.push(ghostpath[i].filter((g,i) => i>0 && i<=index))       //closer to the enemy
        else {
            index = Math.min(...actions
                            .map(act => br.pos[newposS+','+act.toS()])                   //adjacent
                            .filter(g => !g.equal(newpos))                               //valid adjacent
                            .map(g => ghostpath[i].findIndex(gr => gr.equal(g)))  //findIndex
                            .filter(g => g!=-1)
                            ,ghostpath[i].length-1
                    )                                       //removeFalses   this remain at least one
            newghostpaths.push([...ghostpath[i].filter((g,I) => I>0 && I<=index) ,newpos ])
        } 
        if(newghostpaths[i].length==0)   //This piece of code needs to be really tested
                console.log('debug')
}
 */


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
    

    expect(st.glayers).toEqual([ 
        { '9,15': 0 },
        { '8,15': -1, '9,15': 0 },
        { '7,15': -2, '8,15': -1, '9,15': 0 },
        { '6,15': -3, '7,15': -2, '8,15': -1, '9,15': 0 },
        { '5,15': -4, '6,15': -3, '7,15': -2, '8,15': -1, '9,15': 0 } 
    ])



    let ghostbait = st.ghostsurrondings()

    
    expect(st.ghosts).toEqual({'9,15': 0 })     //never destroy values
    expect(st.boost).toEqual({'5,10': [5,10] })    //never destroy values
    expect(st.ghostlist).toEqual([[9,15],[9,15],[9,15],[9,15]])      //never destroy values

    expect(ghostbait['4,15']).toBe(16*4)
})


test('tree search specific function', ()=> { 
    
})
