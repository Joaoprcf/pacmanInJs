const debuglastboost = require("debug")('app:lastboost')
const {
    Node,
    FastNode,
    FastNodeSize,
    PredictionNode
} = require('./nodes')

//const this.ghmoves = 4


function calcboost(dist,level,lives,boosts,lastboost) {

    const nghost = dist.length
    const visibility = [2,4,8,8][level]

    const closingvalue = dist.map(g => g>visibility ? 0 : (visibility*2-g+1)/(visibility*2)  ).reduce((a,b) => a + b,0)/nghost
    
    const greedlevel = [3,1.5,1,3][level]
    const greedlives = [2,1.8,1.6][lives-1]
    const greedboosts = [3,2.8,2.6,2.4][boosts-1]
   
    if(lastboost!='') return null;
    return  greedlevel*greedboosts*greedlives*closingvalue-5.5;

} 



function createForbidenPath(path,forbiden) {

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
        this.ghostpath = Array(this.nghost).fill(0).map(m => [])
        this.ghostarr = ghostarr
        
    }


    ghostprediction(initial, deadline, lastboost) { //{ needtobait , boostarea  }) {
        let starttest = Number(new Date())
        console.log('time left',deadline-starttest)

        if(Object.keys(this.ghosts).length==4)
            console.log('ok')



        let nodes = [new PredictionNode(
                                        initial,            //state
                                        null,               //parent
                                        0,                  //size
                                        this.ghostarr,      //ghosts
                                        0,                  //rw
                                        this.ghostpath,     //ghostspath
                                        this.ghostarr.filter(g => g[1]<=0).map(g => g[0].toS())  //dangerarea
                                        )
                    ] 
        
        const br = this.board
        const boostmap = br.boostmap;
        
        const visited = new Set([initial.toS()])
        
        const energy = this.energy;
                    
        const boostleft = Object.keys(this.boost).length
        
        console.log('START!!:')
        const testreturn = []
        let bestpath = nodes[0]
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        let count = [0,0]
        while(nodes.length>0) {
            let node = nodes.shift()
            let ghostpath = node.ghostspath;
            if(Number(new Date()) > deadline) { //remove false
                console.log('size',node.size)
                break;
            }                    
            
                                              //need to verify surrounding area
            actions.forEach(p => {
                let newpos = br.pos[node.state.toS()+','+p.toS()]
                let newposS = newpos.toS()
                const newsize = node.size+1;
                count[1]++;
   
                if(!node.contains(newpos) && !(node.dangerArea.includes(newposS))) {                   
                    //console.log('Entering',newposS)
                    let newghostpaths = []
                    
                    for(let i=0; i<this.nghost ; i++) {
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
                        if(node.ghosts[i].length==0)   //This piece of code needs to be really tested
                            throw new Error('WHY??')
                            
                    }                   
                    
                
                    let boost = newposS in this.boost

                    let newghosts = node.ghosts
                                    .map((g,i) => [newghostpaths.length>0 ? newghostpaths[i][0] : g[0], boost ? 30 : Math.max(g[1]-1,0) ])
                  
                    let dangerArea = newghosts.filter(g => g[1]<=0).map(g => g[0].toS())
                    
                  /*   console.log('ghosts',node.ghosts)
                    console.log(newsize,'->',newpos,'From-to\n',ghostpath,'--',newghostpaths)
                    console.log('After Enter danger area',dangerArea)
                    console.log('FORMED PATH',this.ghostpath) */

                    if(!(dangerArea.includes(newposS))) {
                       let rw = 0
                        
                     
                        //ADD LAST BOOST!!!

                       newghostpaths.forEach((P,i) => rw+= newghosts[i][1]>0 && P.length==1 ? 500-newsize+10 : Math.max(0,8-P.length)*Math.max(0,8-P.length)*(boostleft>0 ? (lastboost=='' ? 1 : 0.2  ) : 0))
                       
                       
                       if(boost) { 
                            node.newpath = true
                            let dist = newghostpaths.map(g=> g.length-1)
                            let newrw = calcboost(dist,this.level,3,this.nghost,lastboost)  //need live variables
                            rw += (newrw>0 ? 1 : -1)*Math.sqrt(Math.abs(newrw))*200
                            //rw += (this.nghost*2 - newghostpaths.map(g=> g.length>5 ? g.length : Math.sqrt(g.length)).reduce((a,b) => a + b,0))*200
                            if(lastboost!='')return;
                       } 
                       //console.log('path so far:',node.path)
                      
                       if(newposS in energy) {
                           debuglastboost(boostmap[newposS][1],'==',lastboost)
                           rw+= (20+(boostmap[newposS][1]==lastboost)*1000)/newsize
                       } 
                       //console.log(newghostpaths.map(g => g.length))   erro 10,16 para 6,16 :(...
                       let newnode = new PredictionNode(
                                                    newpos,                    //state
                                                    node,                      //parent
                                                    newsize,                   //size
                                                    newghosts,                 //ghosts
                                                    node.rw+rw,                //rw
                                                    newghostpaths,             //ghostspath
                                                    dangerArea                 //dangerArea
                                                )  
                        
                        if(bestpath.rw + bestpath.size<=newnode.rw + newnode.size) bestpath = newnode
                        count[0]++;
                        nodes.push(newnode)                    
                        visited.add(newposS)
                        if(newsize==1){
                            
                            testreturn.push(newghosts.map(g => g[0]))
                        }
                            
                       
                    } else {
                       // console.log('Ghost may kill you if you continue')
                    }
                    
                    
                                       

                }
            })
            
        }
        
        console.log('count:',count)
        console.log('MAXRW:',bestpath.rw)
        return bestpath.path
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
        let dist=Array(this.nghost).fill(0)
        let excludedghosts = []
        let notrestrictedcount = 0;
        let restrictedcount = 0;
        while(nodes.length>0) {
            let node = nodes.shift()

            if(Number(new Date()) - start > 10) {
                console.log('no time')
                break;  
            }
            if(node.state in ghosts) {
                
                let pathlen = node.pathlen;
                if(pathlen==2) {
                    console.log('break')
                }
                let ghostnextmove = node.parent== null ? '--' : node.parent.state.sub(node.state).toS();

                let indexes = ghostlist
                            .map((g,i) => [g,freemoves[i],i])
                
                let notrestricted = indexes 
                    .filter(g => (this.level==0 || pathlen<=2 || freemoves[g[2]].toS()!=ghostnextmove) && g[0].equal(node.state))
                
                let restricted = indexes 
                    .filter(g => this.level!=0 && pathlen>2 && freemoves[g[2]].toS()==ghostnextmove && g[0].equal(node.state))

                restrictedcount
                     
                start = Number(new Date())
                   
                
                restricted.forEach(res=>{
                    if(!excludedghosts.includes(res[2]))  {  //in case of dead ends
                        this.ghostpath[res[2]] = node.invertedpath
                        dist[res[2]] = pathlen 
                        node.delete = true
                        restrictedcount++;
                    }                   
                })         

                notrestricted.forEach(nres=>{
                    if(!excludedghosts.includes(nres[2]))  {  //check for repeated indexes 
                        excludedghosts.push(nres[2])
                        this.ghostpath[nres[2]] = node.invertedpath
                        layers.push(node.layers(ghosts[node.state],this.ghmoves));
                        dist[nres[2]] = pathlen 
                        notrestrictedcount++;
                    }                   
                })              
    
                if(restricted.length>0) {
                    console.log('not afraid of ghost movement')
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
        //console.log('this.path',this.ghostpath)
        //if(notrestrictedcount!=this.nghost) throw new Error('Problem found '+restrictedcount)
        
        return dist.map(g => g==0 ? br.width+br.height : g)
    }

}        

module.exports = TreeSearch;


