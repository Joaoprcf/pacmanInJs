const bmp = require("bmp-js");
const fs = require("fs")
const _ = require("lodash")
const TreeSearch = require("./treesearch")



const WALL = '255,0,0,0'
const GSPAWN = '255,0,249,0'
const ENERGY = '255,214,215,255'
const BOOST = '255,0,38,255'


function groupArr(data, n) {
    var group = [];
    for (var i = 0, j = 0; i < data.length; i++) {
        if (i >= n && i % n === 0)
            j++;
        group[j] = group[j] || [];
        group[j].push(data[i])
    }
    return group;
}

class Board {
    constructor(filename) {
        var bmpData = bmp.decode(fs.readFileSync(filename));
        let { height, width, data} =  bmpData
        this.height = height;
        this.width = width;
        this.boostmap = {};
        data = groupArr([...data],4).map((row,i) => [[i%width,Math.floor(i/width)],row.toC()])

        this.walls = data.filter(p => p[1]==WALL).map(p => p[0]).toMap()
        let energy = data.filter(p => p[1]==ENERGY).map(p => p[0])
        this.boost = data.filter(p => p[1]==BOOST).map(p => p[0])
        

        //let arr = Array(height).fill(0).map((harray,y) => Array(width).fill(0).map((warray,x) => [x,y] in this.walls ? 1 : 0) )
        

        //console.log(JSON.stringify(arr))  get map array

        this.energy = energy.toMapOfOnes()
        
        this.pos = {  }
        for (let i = 0; i< this.width; i++)  for (let j = 0; j< this.height; j++) {
            [[1,0],[-1,0],[0,-1],[0,1]].forEach(p => {
                this.pos[[i,j].toS()+','+p.toS()] = this.nextpos([i,j],p)
            })
            
        }        
        this.gspawns = data.filter(p => p[1]==GSPAWN).toSpawnMap()
        
        

        let st = new TreeSearch(this, {
            ghosts: {},
            boost: this.boost.toMap(),
            ghostlist: [] 
        })

        st.generateAreas()

        
  
    }
    checkArea(energy,boost) {
        let bmap = this.boostmap
        for(let b in bmap) {
            if(bmap[b][1]==boost && b in energy) 
                return false
        }
        return true;
    }
    nextpos(pos,act) { 
        let npos = pos.add(act)
        let [nx, ny] = npos
        if(nx < 0)
            nx = this.width-1
        if(nx == this.width)
            nx = 0
        if(ny < 0)
            ny = this.height-1
        if(ny == this.height)
            ny = 0
            
        npos = [nx, ny] 
        if(npos.toS() in this.walls) {
            return [...pos]
        }
            
        return npos
    }
    

}

module.exports = Board;

