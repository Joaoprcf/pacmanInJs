class Node {
    constructor(state, parent, size = 1, rw = 0 , lastmove = [0,0],boost = false) {
        this.state = state
        this.parent = parent 
        this.size = size
        this.rw = rw
        this.boost = boost
        this.blocked = [lastmove[0]*-1, lastmove[1]*-1]
           
    }
    contains(pos) {
        let node = this;
        while(node!=null) {
            if(node.state.equal(pos)) return true;
            node=node.parent;
        }
        return false;
    }

    get path() {
        let path = []
        let node = this;
        while(node!=null) {
            path = [node.state].concat(path)
            node=node.parent;
        }
        return path;
    }
}
class FastNode {
    constructor(state, parent) {
        this.state = state
        this.parent = parent 
    }
    layers(timeout,ghmoves) {
        let max = 1;
        let path = []
        let node = this.parent;
        while(node.parent!=null && max<ghmoves+1) {
            path.push([node.state,timeout-max ] )
            node=node.parent;
            max++;
        }
        while(max < ghmoves+1) {
            path.push([node.state,timeout-max ])
            max++;
        }
        return path;
    }
    get pathlen() {
        let node = this;
        let size = 0;
        while(node.parent!=null) {
            size ++;
            node=node.parent;
        }
        return size;
    }
    get invertedpath() {
        let path = []
        let node = this;
        while(node!=null) {
            path.push(node.state)
            node=node.parent;
        }
        return path;
    }
}


class FastNodeSize {
    constructor(state, parent, size = 0, boost = '') {
        this.state = state;
        this.parent = parent; 
        this.size = size;
        this.boost = boost
    }
    get pathlen() {
        let node = this;
        let size = 0;
        while(node.parent!=null) {
            size ++;
            node=node.parent;
        }
        return size;
    }

    get path() {
        let path = []
        let node = this;
        while(node!=null) {
            path = [node.state].concat(path)
            node=node.parent;
        }
        return path;
    }
}

class PredictionNode {
    constructor(state, parent, size=0, ghosts, rw, ghostspath , dangerArea ) {
        this.state = state;
        this.parent = parent;
        this.size = size;
        this.ghosts = ghosts
        this.rw = rw
        this.ghostspath = ghostspath
        this.dangerArea = dangerArea
    }
    get path() {
        let path = []
        let node = this;
        while(node!=null) {
            path = [node.state].concat(path)
            node=node.parent;
        }
        return path;
    }
    contains(pos) {
        let node = this;
        while(node!=null) {
            if(node.state.equal(pos)) return true; 
            //if(node.newpath) return false;
            node = node.parent
        }
        return false;
    }
}

module.exports = {
    Node,
    FastNode,
    FastNodeSize,
    PredictionNode
}