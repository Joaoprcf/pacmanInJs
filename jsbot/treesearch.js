const debuglastboost = require("debug")('app:lastboost')
const {
    Node,
    FastNode,
    FastNodeSize,
    PredictionNode
} = require('./nodes')

//const this.ghmoves = 4


function calcboost(dist,level,lives,boosts,lastboost,step,laststep) {

    console.log('step',step,'laststep',laststep)


    const nghost = dist.length
    const visibility = [5,5,9,7][level]

    const closingvalue = dist.map(g => g>visibility ? 0 : g!=visibility ? 1 : 0.5 ).reduce((a,b) => a + b,0)
    

    let greedlevel = [1.5,3,3.5,2][level]
    greedlevel = Math.max(1,greedlevel+(lives-3)/2)
    greedlevel = Math.max(1,greedlevel-(step-laststep)/350)
  
    if(lastboost!='') return null;
    console.log(closingvalue>= Math.min(greedlevel,nghost))
    return closingvalue>= Math.min(greedlevel,nghost);

} 



class TreeSearch {
    constructor(board,{ boost, ghosts ,ghostlist, lastghostmoves, level, step , ghostarr , lives , laststep  }) {
        this.board = board
        this.energy = this.board.energy
        this.ghosts = ghosts
        this.lives = lives
        this.ghostlist = ghostlist
        this.step = step
        this.laststep = laststep
        this.level = level ? level : 1
        this.ghmoves = level ? 2<<level : 4;  //ghost predict
        this.nghost = this.ghostlist.length
        this.freemoves = lastghostmoves ? lastghostmoves : Array(this.nghost).fill(0).map(m => [0,0]);
        this.boost = boost  
        this.ghostpath = Array(this.nghost).fill(0).map(m => [])
        this.ghostarr = ghostarr
        
    }

    ghostspam(initial) {
        let start = Number(new Date())
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        const br = this.board;
        let nodes = [new FastNode(initial,null)]
        let visited = new Set(initial)
        let fullmap = {}
        fullmap[initial.toS()] = nodes[0]
        while(nodes.length>0) {
            let node = nodes.shift()
            actions.forEach(p => {
                
                let newpos = br.pos[node.state.toS()+','+p.toS()];
                let newposS = newpos.toS();
                if(!visited.has(newposS)) {
                    let newnode = new FastNode(newpos,node);                          
                    nodes.push(newnode);
                    visited.add(newposS);
                    fullmap[newposS] = newnode;
                }
            }) 
        
        }

        console.log('boost took',Number(new Date())-start,'ms')
        return fullmap
        

    }

    ghostprediction(initial, deadline, lastboost) { //   AI function
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
        let bestpath = { rw: -2e10, size: 1  }
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
                let rw = 0
   
                if(!node.contains(newpos) && !(node.dangerArea.includes(newposS))) {                   
                    
                    let newghostpaths = []
                    let renew = node.ghosts.map(g => false)
                    for(let i=0; i<this.nghost ; i++) {
                        if(node.ghosts[i][1]>0 && node.ghosts[i][0].equal(newpos)) {
                            newghostpaths.push(br.pathsfromSpam[newposS].path)
                            rw+=10e4/newsize;
                            renew[i] =true
                            continue;
                        } 
                       
                        let index = ghostpath[i].findIndex(g => newpos.equal(g))
                        if(index==0) newghostpaths.push([newpos])
                        else if(index!=-1)       
                            newghostpaths.push(ghostpath[i].filter((g,I) => (I>0 || node.ghosts[i][1]>1 || g.length>12)  && I<=index))       //closer to the enemy
                        else {
                            index = Math.min(...actions
                                            .map(act => br.pos[newposS+','+act.toS()])                   //adjacent
                                            .filter(g => !g.equal(newpos))                               //valid adjacent
                                            .map(g => ghostpath[i].findIndex(gr => gr.equal(g)))  //findIndex
                                            .filter(g => g!=-1)
                                            ,ghostpath[i].length-1
                                    )                                       //removeFalses   this remain at least one
                            newghostpaths.push([...ghostpath[i].filter((g,I) => (I>0 || node.ghosts[i][1]>1 || g.length>12) && I<=index) ,newpos ])
                        } 
    
                            
                    }                   
                    
                
                    let boost = newposS in this.boost

                    let newghosts = node.ghosts
                                    .map((g,i) => [newghostpaths.length>0 ? newghostpaths[i][0] : g[0], boost ? 30 : renew[i] ? 0 : Math.max(g[1]-1,0) ])
                  
                    let dangerArea = newghosts.filter(g => g[1]<=0).map(g => g[0].toS())
                    
           

                    if(!(dangerArea.includes(newposS))) {
                       
                        
                     
                        //ADD LAST BOOST!!!

                       newghostpaths.forEach((P,i) => rw+= newghosts[i][1]>0 && P.length==1 ? 500-newsize+10 : Math.max(0,8-P.length)*Math.max(0,8-P.length)*(boostleft>0 ? (lastboost=='' ? 1 : 0.2  ) : 0))
                       
                       
                       if(boost) { 
                            node.newpath = true
                            let dist = newghostpaths.map(g=> g.length-1)
                            let newrw = calcboost(dist,this.level,this.lives,this.nghost,lastboost,this.step,this.laststep)  
                            
                            if(lastboost!='' || (!newrw && this.lives==3)) return
                            rw += newrw ? 1e5/(10+newsize) : -1e5/(10+newsize) 

                       } 
                    
                      
                       if(newposS in energy) {
                           debuglastboost(boostmap[newposS][1],'==',lastboost)
                           rw+= (20+(boostmap[newposS][1]==lastboost)*1000)/newsize
                       } 
                     
                       let newnode = new PredictionNode(
                                                    newpos,                    //state
                                                    node,                      //parent
                                                    newsize,                   //size
                                                    newghosts,                 //ghosts
                                                    node.rw+rw,                //rw
                                                    newghostpaths,             //ghostspath
                                                    dangerArea                 //dangerArea
                                                )  
                        
                        if(bestpath.rw + bestpath.size<=newnode.rw + newnode.size || (bestpath.size<5 && newsize==5)) bestpath = newnode
                        count[0]++;
                        nodes.push(newnode)                    
                        visited.add(newposS)
                        if(newsize==1){
                            
                            testreturn.push(newghosts.map(g => g[0]))
                        }
                            
                       
                    }                   
                    
                                       

                }
            })
            
        }
        
        console.log('count:',count)
        console.log('MAXRW:',bestpath.rw)
        return bestpath.path
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
        let actions = [[1,0],[-1,0],[0,-1],[0,1]]
        let dist=Array(this.nghost).fill(0)
        let excludedghosts = []
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
                    .filter(g => (true || freemoves[g[2]].toS()!=ghostnextmove) && g[0].equal(node.state))
                
                let restricted = indexes 
                    .filter(g => false && freemoves[g[2]].toS()==ghostnextmove && g[0].equal(node.state))

                
                     
                start = Number(new Date())
                   
                
                restricted.forEach(res=>{
                    if(!excludedghosts.includes(res[2]))  {  //in case of dead ends
                        this.ghostpath[res[2]] = node.invertedpath
                        dist[res[2]] = pathlen 
                        node.delete = true
                    
                    }                   
                })         

                notrestricted.forEach(nres=>{
                    if(!excludedghosts.includes(nres[2]))  {  //check for repeated indexes 
                        excludedghosts.push(nres[2])
                        this.ghostpath[nres[2]] = node.invertedpath
                        dist[nres[2]] = pathlen 
                       
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
        return dist.map(g => g==0 ? br.width+br.height : g)
    }

}        

module.exports = TreeSearch;


