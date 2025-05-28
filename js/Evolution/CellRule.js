class CellRule {
    constructor(){
        this.m = 6
        this.is_stable = false;
        this.phase = 0;
        this.stimulus_point = null;
        this.bubble = null;
        this.moves = 0;
        this.marked = new Set();
        this.s = 3;
        this.n = 1000;
        this.is_global = true;
    }
    random_choice(arr) {
        return arr[Math.floor(Math.random()*arr.length)];
    }

    global_iteration(tiles) {
        var develop = this.development(tiles);
        // Implémentation de l'algorithme pour "manger 0"
        
        // (1)
        if (this.stimulus_point === null) {
            // définition d'un nouveau "stimulus point" 
            var cytoskeleton = [];
            for (const tile of tiles) 
                if (tile.prevState == this.m)
                    cytoskeleton.push(tile);
            if (cytoskeleton.length == 0)
                return develop;
            this.stimulus_point = this.random_choice(cytoskeleton);

            // (2) définition d'une nouvelle bulle
            var zero = [];
            var sp = this.stimulus_point;
            for (var i = 0; i < sp.neighbors.length; i++) 
                if (tiles[sp.neighbors[i]].prevState == 0)
                    zero.push(tiles[sp.neighbors[i]]);
            
            var bubble = this.random_choice(zero);

            // (3)
            for (const tile of tiles)
                tile.state = tile.prevState == 1 ? this.m : tile.prevState;

            bubble.state = this.stimulus_point.prevState;
            this.stimulus_point.state = bubble.prevState;
            this.bubble = this.stimulus_point;

            this.moves = 0;
            return true;
        }

        // (4)
        var bubble = this.bubble;
        this.marked.add(bubble);

        // (5)
        var zero_count = 0;
        for (var i = 0; i < bubble.neighbors.length; i++) 
            if (tiles[bubble.neighbors[i]].state == 0)
                zero_count += 1;

        if (zero_count < this.s && this.moves < this.n) {
            // (7)
            var non_marked = []
            for (var i = 0; i < bubble.neighbors.length; i++)
                if (!this.marked.has(tiles[bubble.neighbors[i]]))
                    non_marked.push(tiles[bubble.neighbors[i]]);
            this.moves += 1;

            if (non_marked.length > 0) {
                // transportation of the bubble
                var new_bubble = this.random_choice(non_marked);
                bubble.state = this.m;
                new_bubble.state = 0;
                this.bubble = new_bubble;
                return true;
            }
        } 

        // (8)
        this.stimulus_point = null;
        this.bubble = null;
        this.marked = new Set(); // pas sûr
        
        // reconstruction de l'intérieur (on remet à 1 les états pas au bord)
        for (var i = 0; i < tiles.length; i++) {
            var count = 0;
            var tile = tiles[i];
            var state = tile.prevState;
            if (state != this.m)
                continue;
            
            for (var j = 0; j < tile.neighbors.length; j++) 
                if (tiles[tile.neighbors[j]].prevState == 0)
                    count += 1;    
            
            if (count == 0) {
                tile.state = 1;
            }
                
        }
        return true;
    }

    

    development(tiles) {
        var has_changed = false;
        for (var i = 0; i < tiles.length; i++) {
            var count = 0;
            var tile = tiles[i];
            var state = tile.prevState;
            has_changed |= state < this.m;
            
            for (var j = 0; j < tile.neighbors.length; j++) {
                var neighbor = tiles[tile.neighbors[j]];
                if (neighbor.prevState == 0) {
                    if (state < this.m && state > 1) 
                        neighbor.state = state+1;
                    
                    count += 1;
                }     
            }

            if (state < this.m && state > 1)
                tile.state = state+1;
        }
        return has_changed;
    }

}