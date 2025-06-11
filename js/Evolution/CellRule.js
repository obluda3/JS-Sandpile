// Implémentation de CELL de Gunji et al (2008)
class CellRule {
    // 0 - empty (S_0)
    // 1 - m : cell (S_1_1 -> S_1_m = S_1)
    // m+1 : skeleton (S_2)
    // m+2 : bubble (S_3)
    // m+3 : marked (S_4)
    // m+4 : food
    constructor(){
        this.m = 9;
        this.s = 3;
        this.is_global = true;

        this.develop_done = false;
        this.k = 0;
        this.k_max = 15;
    }
    random_choice(arr) {
        return arr[Math.floor(Math.random()*arr.length)];
    }

    random_choice_prob(array, probabilities) {
        // probably doesn't work well
        var cumulative_prob = [0];
        var x = 0;
        for (const prob of probabilities) {
            x += prob;
            cumulative_prob.push(x);
        }
        var p = Math.random();
        for (var i = 0; i < array.length-1; i++) {
            if (p >= cumulative_prob[i] && p <= cumulative_prob[i+1]) {
                return array[i];
            }
        }
        return array[array.length-1];
    }

    global_iteration(tiles) {
        
        if (!this.develop_done) {
            var develop = this.development(tiles);
            if (develop)
               return true;
            this.reform_skeleton(tiles);
            this.develop_done = true;
            return true;
        }
        
        if (this.k == 0) {
            var sp = this.choose_stimulus_point(tiles);
            if (!sp) {
                this.k = this.k_max;
                return true;
            }
            sp.state = this.m+2;
            
            var bubble = this.random_choice(this.neighbor_state(sp, 0, tiles));
            bubble.state = this.m+1;
            for (const tile of tiles) {
                if (tile.prevState == this.m) 
                    tile.state = this.m+1;
            } 
            this.k += 1;
            return true;
        }
        if (this.k >= this.k_max) {
            this.reform_skeleton(tiles);
            this.k = 0;
            return true;
        }

        for (const tile of tiles) {
            if (tile.prevState == this.m+2) { // bubble
                var bubble_neighbors = this.neighbor_state(tile, this.m+1, tiles);
                var s = this.neighbor_state(tile,0, tiles).length;
                if (bubble_neighbors.length == 0 || s >= this.s)
                    this.k = this.k_max;
                else {
                    tile.state = this.m+3; // marked
                    this.random_choice(bubble_neighbors).state = this.m+2;
                }
            }
        }
        this.k += 1;
        return true;
    }

    reform_skeleton(tiles) {
        for (const tile of tiles) {
            if (tile.prevState == 0)
                continue;
            if (tile.prevState == this.m + 2) {
                tile.state = 0;
                continue;
            }
            var count = this.neighbor_state(tile, this.m+1, tiles).length + this.neighbor_state(tile, this.m+3, tiles).length + this.neighbor_state(tile, this.m, tiles).length;
            if (count == 4)
                tile.state = this.m;
            else
                tile.state = this.m+1;
        }
    }

    choose_stimulus_point(tiles) {
        var skeleton = [];
        for (const tile of tiles) {
            if (tile.prevState == this.m+1 && this.neighbor_state(tile, 0, tiles).length > 0)
                skeleton.push(tile);
        }

        if (skeleton.length == 0)
            return null;
        
        var distances = [];
        for (const tile of skeleton) {
            var bar_x = 0;
            var bar_y = 0;
            for (var i = 0; i < tile.bounds.length; i+=2) {
                bar_x += tile.bounds[i];
                bar_y += tile.bounds[i+1];
            }

            bar_x = 2 * bar_x / tile.bounds.length;
            bar_y = 2 * bar_y / tile.bounds.length;

            distances.push(Math.min(
                Math.abs(bar_x+20)+Math.abs(bar_y+20), 
                Math.abs(bar_x-20)+Math.abs(bar_y-20), 
                Math.abs(bar_x-20)+Math.abs(bar_y+20),
                Math.abs(bar_x+20)+Math.abs(bar_y-20)
            ));
        }

        var d_sum = 0;
        for (const d of distances)
            d_sum += 1/d;

        var probabilities = [];
        for (const d of distances) 
            probabilities.push(1/(d*d_sum));
        
        
        return this.random_choice_prob(skeleton, probabilities);
    }

    development(tiles) {
        var has_changed = false;
        for (const tile of tiles) {
            var state = tile.prevState;
            has_changed |= state < this.m && state > 0;

            var maxNeighbor = 0;
            if (state < this.m && state >= 1) { // S_1_k
                tile.state = state+1;
                continue;
            }
            else if (state == this.m)
                continue;
            for (var j = 0; j < tile.neighbors.length; j++) { // S_0
                var neighbor = tiles[tile.neighbors[j]];
                if (neighbor.prevState > maxNeighbor && neighbor.prevState < this.m)
                    maxNeighbor = neighbor.prevState;
            }
            if (maxNeighbor > 0) {
                tile.state = maxNeighbor+1;
                has_changed = true;
            }
        }
        return has_changed;
    }

    // renvoie la liste des voisins de tile ayant l'état state
    neighbor_state(tile, state, tiles) {
        var result = [];
        for (var i = 0; i < tile.neighbors.length; i++) {
            if (tiles[tile.neighbors[i]].prevState == state)
                result.push(tiles[tile.neighbors[i]]);
        }
        return result;
    }
}