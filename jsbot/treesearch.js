const {
    Node,
    FastNode,
    FastNodeSize
} = require('./nodes')

//const this.ghmoves = 4


function createForbidenPath(path,forbiden) {
    //console.log(path)
    for(let i=0,ii=path.length-1; i<Math.floor(path.length/2.0);i++,ii--) {
        forbiden[path[i].toS()] = path[i] in forbiden ? Math.min(forbiden[path[i]],i) : i
        forbiden[path[ii].toS()] = path[ii] in forbiden ?  Math.min(forbiden[path[ii]],i) : i
    }
    if(path.length%2) {
        let middle = Math.floor(path.length/2);
        forbiden[path[middle].toS()] = path[middle] in forbiden ? forbiden[path[middle]]+middle : middle
    }
}


class TreeSearch {
    constructor(board,{ boost, ghosts ,ghostlist, lastghostmoves, level, step , ghostarr  }) {
        this.board = board
        this.energy = this.board.energy
        this.ghosts = ghosts
        this.ghostlist = ghostlist
        
        this.step = step
        this.level = level ? level : 1
        this.ghmoves = level ? 2<<level : 4;  //ghost predict
        this.nghost = this.ghostlist.length
        this.freemoves = lastghostmoves ? lastghostmoves : Array(this.nghost).fill(0).map(m => [0,0]);
        this.boost = boost  
        this.glayers = Array(this.ghmoves).fill(0).map(m => ({}))
        this.ghostpaths = Array(this.nghost).fill(0).map(m => [])
        //console.log('ghostarr',ghostarr)
        this.ghostarr = ghostarr
    }


    ghostprediction(initial) {
        let starttest = Number(new Date())
        console.log('time left',deadline-starttest)
        let nodes = [new PredictionNode(initial,null,0,this.ghostlist.map(gp => [gp,this.ghosts[gp]]),this.freemoves)] 
        const br = this.board
        const boostmap = br.boostmap;
        const visited = new Set([initial.toS()])
        const energy = this.energy;
        const ghosts = this.ghosts;
        const glayers = this.glayers;
        let bestpath = nodes[0]
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        while(nodes.length>0) {
            let node = nodes.shift()
            let currentPrediction = node.ghosts;
            if(Number(new Date()) > deadline) {
                break;
            }            
            actions.forEach(p => {
                let newpos = br.pos[node.state.toS()+','+p.toS()]
                let newposS = newpos.toS()
                const newsize = node.size+1;

                if(!visited.has(newposS) && !(newposS in ghostmap && ghostmap[newposS]<=0)) {                   
                    let newnode = new PredictionNode(newpos,node,newsize )  // p.toS(),false)  //not done
                    nodes.push(newnode)
                    visited.add(newposS)
                }
            })
            
        }
        
        return { path: bestpath.path, clear: 0 }
    }



    updateGlayers(forbiden) {
        let glayers = this.glayers;
        for(let f in forbiden) {
            let layer = forbiden[f];
            if(layer>this.ghmoves) continue;
            glayers[layer][f] = 0; 
        }
    }

    generateAreas() { 
        let start = Number(new Date())
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        const br = this.board;
        let nodes = []
        let visited = new Set()
        let boostmap = {}
        for(let b in this.boost) {
            visited.add(b)
            nodes.push(new FastNodeSize(b.toArray(),null,0,b))
            boostmap[b] = [0,b]
        }
        let newsize=0;
        while(nodes.length>0) {
            let node = nodes.shift()
            actions.forEach(p => {
                newsize = node.size+1;
                let newpos = br.pos[node.state.toS()+','+p.toS()];
                let newposS = newpos.toS();
                if(!visited.has(newposS)) {
                    let newnode = new FastNodeSize(newpos,node,newsize,node.boost);                          
                    nodes.push(newnode);
                    visited.add(newposS);
                    boostmap[newposS] = [newsize,node.boost];
                }
            }) 
        
        }

        console.log('boost took',Number(new Date())-start,'ms')
        for(let b in boostmap) {
            let arr = boostmap[b]
            boostmap[b] = [newsize-arr[0],arr[1]]
        }
        br.boostmap = boostmap
    }

    ghostsurrondings() { 
        let start = Number(new Date())
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        const br = this.board
        let forbiden = {};
        let ghosts = this.ghosts;
        let ghostbait = {};
        for(let i=0; i<this.ghostlist.length;i++) {
            let garr = this.ghostlist[i]
            let g = garr.toS()
            let nodes = [new FastNodeSize(garr,null)];
            let visited = new Set([g])
            if(ghosts[g]<=0) {
                while(nodes.length>0) {
                    let node = nodes.shift()
                    actions.forEach(p => {
                        let newsize = node.size+1;
                        let newpos = br.pos[node.state.toS()+','+p.toS()];
                        let newposS = newpos.toS();
                        if(!visited.has(newposS) && newsize<8) {
                            let newnode = new FastNodeSize(newpos,node,newsize)                          
                            nodes.push(newnode);
                            visited.add(newposS);
                            let value = 32>>Math.abs(newsize-4);
                            ghostbait[newposS] = newposS in ghostbait ? value+ghostbait[newposS] :value;
                                                        
                            if(newposS in ghosts)   //refactor with no function
                                createForbidenPath(newnode.path ,forbiden)
                            
                        }
                    }) 
                }
            }
            
        }
        this.updateGlayers(forbiden)
        console.log('took',Number(new Date())-start,'ms')
        return ghostbait
    }


    updateghostlayer(initial) {  //call number 0
        let start = Number(new Date())
        let initialnode = new FastNode(initial,null)
        let nodes = [initialnode] 
        const visited = {} 
        visited[initial.toS()] = initialnode;  
        const br = this.board
        let ghosts = this.ghosts;
        let ghostlist = this.ghostlist;
        let freemoves = this.freemoves;
        let layers = []
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        let dist=[]
        let excludedghosts = []
        while(nodes.length>0) {
            let node = nodes.shift()

            if(Number(new Date()) - start > 4) {
                console.log('no time')
                break;  
            }
            if(node.state in ghosts) {

                let pathlen = node.pathlen;
                let ghostnextmove = node.parent== null ? '--' : node.parent.state.sub(node.state).toS();

                let indexes = ghostlist
                            .map((g,i) => [g,freemoves[i],i])
                
                let notrestricted = indexes 
                    .filter(g => this.level==0 || pathlen<=2 || (g[0].equal(node.state) && freemoves[g[2]].toS()!=ghostnextmove))
                
                let restricted = indexes 
                    .filter(g => this.level!=0 && pathlen>2 && g[0].equal(node.state) && freemoves[g[2]].toS()==ghostnextmove)

                     
                start = Number(new Date())
                                
                notrestricted.forEach(nres=>{
                    if(!excludedghosts.includes(nres[2]))  {  //check for repeated indexes 
                        excludedghosts.push(nres[2])
                        this.ghostpaths[nres[2]] = node.invertedpath
                        layers.push(node.layers(ghosts[node.state],this.ghmoves));
                        dist.push(pathlen) 
                    }                   
                })              
                
                if(restricted.length>0) {
                    
                    console.log('not afraid of ghost movement')
                    node.delete = true
                }
                start = Number(new Date())
                
                
            }


            actions.forEach(p => {
                
                let newpos = br.pos[node.state.toS()+','+p.toS()]
                let newposS = newpos.toS()
                if(!(newposS in visited)) {
                    nodes.push(new FastNode(newpos,node));
                    visited[newposS] = node;
                }
            })    
            if(node.delete)
                delete visited[node.state.toS()]
        }
        this.newglayers = visited
        let result = Array(this.ghmoves).fill(0).map(m => ({}))
        layers.forEach(layer => {
            layer.forEach((a,i) => {
                result[i][a[0].toS()] = a[1]
            })
        })
        result = [ghosts].concat(result)

        for(let i =1;i<result.length;i++) {
            result[i] = {...result[i], ...result[i-1] }    
        }
        this.glayers = result;
        
        return dist.concat(
                Array(this.nghost-dist.length).fill((br.width+br.height)>>1) 
                );
    }

    foodsearch(initial, prev = [0,0], deadline,boost) {
        let nodes = [new Node(initial,null,1,0,prev,false)] 
        let visited = new Set([initial.toS()])
        const br = this.board
        const boostmap = br.boostmap;
        const energy = this.energy;
        const ghosts = this.ghosts;
        const glayers = this.glayers;

        let bestpath = nodes[0]
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        while(nodes.length>0) {
            
            let node = nodes.shift()
            if(Number(new Date()) > deadline) {
                break;
            }
                              
            actions.forEach(p => {
                
                let newpos = br.pos[node.state.toS()+','+p.toS()]
                let newposS = newpos.toS()
                const newsize = node.size+1;

                let ghostmap = newsize<=this.ghmoves ? glayers[newsize] : glayers[this.ghmoves] 
                 
                if(!visited.has(newposS) && !(newposS in ghostmap && ghostmap[newposS]<=0)) {
                    let rw = 0;
                    if(newposS in ghosts && ghosts[newposS]>newsize){
                        rw = 1000
                    }
                    else if(newposS in energy){
                        rw = boostmap[newposS][1] == boost ? 5 : 1;
                    }

                    let newnode = new Node(newpos,node,newsize,rw, p.toS(),false)
                    if(rw>bestpath.rw)
                        bestpath = newnode
                    nodes.push(newnode)
                    visited.add(newposS)
                }
            })
            
        }
        return { path: bestpath.path, clear: 0 }
    }    


    search(initial, prev = [0,0],deadline,dist,ghostbait) {
        
        let starttest = Number(new Date())
        console.log('time left',deadline-starttest)
        let nodes = [new Node(initial,null,1,0,prev,false)] 
        let visited = new Set([initial.toS()])
        let enought = 8*4-(initial in ghostbait ? ghostbait[initial] : 0)
        //console.log(enought)
        const br = this.board
        const boostmap = br.boostmap;
        const energy = this.energy;
        const ghosts = this.ghosts;
        const glayers = this.glayers;

        let bestpath = nodes[0]
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        while(nodes.length>0) {
            
            let node = nodes.shift()
            if(Number(new Date()) > deadline) {
                break;
            }
                              
            actions.forEach(p => {
                let newpos = br.pos[node.state.toS()+','+p.toS()]
                let newposS = newpos.toS()
                const newsize = node.size+1;

                let ghostmap = newsize<=this.ghmoves ? this.glayers[newsize] : this.glayers[this.ghmoves] 
                 
                if(!visited.has(newposS) && !(newposS in ghostmap && ghostmap[newposS]<=0)) {
                    let rw = newposS in ghostbait ? ghostbait[newposS] : 0;
                    let boostinfo = boostmap[newposS]
                    if(boostinfo[1] in this.boost && ghostbait[newposS]>enought)
                        rw *= 4+boostinfo[0]
                    
                   
                    let newnode = new Node(newpos,node,newsize,rw, p.toS(),false)
                    if(rw>bestpath.rw)
                        bestpath = newnode
                    nodes.push(newnode)
                    visited.add(newposS)
                }
            })
            
        }
        
        return { path: bestpath.path, clear: 0 }
    }

}        

module.exports = TreeSearch;


