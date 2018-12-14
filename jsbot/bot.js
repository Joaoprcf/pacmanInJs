const debuglastboost = require("debug")('app:lastboost')
const TreeSearch = require("./treesearch");
const Board = require('./map')
const readline = require('readline');

keyMapping = {
    '1,0': 'd',
    '-1,0': 'a',
    '0,1': 's',
    '0,-1': 'w' 
}



class Brain {
    constructor(name = 'student') {
        this.name = name;
        this.points = {};
        this.lives = 0;
        this.board = null;
        this.clear = 0
        this.lastmove = [0,0]
        this.lastboost = ''
        this.level = 0
        this.lastGhostState = []
        this.laststep = 0
    }


    insertMapInfo(state) {
        let checkpoint = Number(new Date())
        this.points = state.points;
        this.lives = state.lives;
        this.level = state.ghosts_level
        this.board = new Board(state.map); 
        
        console.log('time to process:',Number(new Date() - checkpoint)+ ' ms')
    }


    processNextMove(state) {
        let limit = 65
        let deadline = Number(new Date()) + limit
        let { energy, ghosts, boost,pacman , step, lives, player } = state

        delete this.board.energy[pacman.toS()];
        energy = energy.toMapOfOnes();
        boost = boost.toMap();
        let ghostlist = ghosts.map(i => i[0]);
        let ghostarr = ghosts.map(i => [i[0], i[2]]);
        if(this.lastGhostState.length==0) {
            this.lastGhostState = [...ghostlist]
        }
        let lastghostmoves = this.lastGhostState.map((row,i) => this.lastGhostState[i].sub(ghostlist[i])) // inverse to get blocked!!
        ghosts = ghosts.toGhostMap();

        if(this.lastboost != '' && this.board.checkArea(energy,this.lastboost)) {
            this.lastboost = ''
            debuglastboost('Bait activated')
        }
        debuglastboost('=',this.lastboost)
        
        let ts = new TreeSearch(this.board, {
            step, 
            lives,
            boost,
            ghosts,
            ghostarr,
            ghostlist,
            lastghostmoves,
            level: this.level,
            laststep: this.laststep
        });
   
        let dist = ts.updateghostlayer(pacman)
        this.test = dist
       
       
        let path = ts.ghostprediction(pacman,deadline-5,this.lastboost)
        //if(path.length==1) throw new Error('err')

        
        let clear = 0;
/* 
        let { path, clear } = this.lastboost=='' 
                    ? ts.search(pacman,this.lastmove ,deadline-5,dist,ghostbait) 
                    : ts.foodsearch(pacman,this.lastmove,deadline-5,this.lastboost) */
            
        this.clear = clear;
        let next;
        try {
            next = [[1,0],[-1,0],[0,1],[0,-1]].find(a => this.board.nextpos(pacman,a).equal(path[1]))
            if(path[1].toS() in boost) {
               this.lastboost = path[1].toS() 
               this.laststep = step
               debuglastboost('updating last boost to',this.lastboost)
               
            } 
        } catch(ex) {
            next = [1,0] 
        }
        this.lastmove = next
        
        const keyToPlay = next.toKey()
        if(deadline < Number(new Date()))
        console.log('time to process:',Number(new Date()) - deadline+limit)
        this.lastGhostState = [...ghostlist]
        console.log('step',step)
        return {
            cmd: 'key',
            key: keyToPlay,
            path: path //ts.ghostpath[0].concat(ts.ghostpath[1]).concat(ts.ghostpath[2]).concat(ts.ghostpath[3]) //this.board.path //Object.keys(ts.glayers[3]).map(p=> p.split(',').map(p => Number(p)))
        }
    }
}



module.exports =  Brain 
