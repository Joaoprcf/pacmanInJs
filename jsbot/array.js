


Array.prototype.toS = function() {
    return this[0]+','+this[1]
}

Array.prototype.toC = function() {
    return this.join()
}

Array.prototype.equal = function(array) {
    return this[0] == array[0] && this[1] == array[1];
}

Array.prototype.add = function(array) {
    return this.map((m,i) => this[i] + array[i]);
}

Array.prototype.multiply = function(modifier) {
    return this.map((m,i) => this[i] ? this[i] * modifier : 0 );
}

Array.prototype.sub = function(array) {
    return this.map((m,i) => this[i] - array[i]);
}


Array.prototype.toMap = function() {
    let result = {}
    this.forEach(e => { 
        result[e.toS()] = e
    })
    return result
}

Array.prototype.toMapOfOnes = function() {
    let result = {}
    this.forEach(e => {
        result[e.toS()] = 1
    })
    return result
}

Array.prototype.toGhostMap = function() {
    let result = {}
    this.forEach(g => {
        if(g[0] in result) 
            result[g[0].toS()] = Math.min(g[2],result[g[0].toS()])
        else
            result[g[0].toS()] = g[2]
    })
    return result
}




Array.prototype.toSpawnMap = function() {
    let result = {}
    this.forEach(s => {
        result[s[0].toS()] = s[0]
    })
    return result
}

Array.prototype.toKey = function() {
    return {
        '1,0': 'd',
        '-1,0': 'a',
        '0,1': 's',
        '0,-1': 'w' 
    }[this.toS()] 
}

String.prototype.toArray = function() {
    return this.split(",").map(i=>Number(i))
}