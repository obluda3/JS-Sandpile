// Implémentation de CELL de Gunji et al (2008)
class CellRule {
    // 0 - empty (S_0)
    // 1 - m : cell (S_1_1 -> S_1_m = S_1)
    // m+1 : skeleton (S_2)
    // m+2 : bubble (S_3)
    // m+3 : marked (S_4)
    // m+4 : food
    constructor(){
        this.m = 10;
        this.s = 3;
        this.is_global = true;

        this.develop_done = false;
        this.k = 0;
        this.k_max = 400;
    }
    random_choice(arr) {
        return arr[Math.floor(Math.random()*arr.length)];
    }

    random_choice_prob(array, probabilities) {
        var cumulative_prob = [];
        var x = 0;
        for (const prob of probabilities) {
            x += prob;
            cumulative_prob.push(x);
        }
        var p = Math.random();
        for (var i = 0; i < array.length; i++) {
            if (p < cumulative_prob[i])
                return array[i];
        }
        return array[array.length-1];
    }

    global_iteration(tiles) {
        if (!this.develop_done) {
                var develop = this.development(tiles);
                if (develop)
                   return true;
                // for (const tile of tiles) {
                //     if (tile.prevState > 0)
                //         tile.state = this.m;
                // }
                this.reform_skeleton(tiles);
                this.develop_done = true;
                return true;
        }
        
        while (this.k < this.k_max) {
            for (const tile of tiles)
                tile.prevState = tile.state;
            
            if (this.k == 0) {
                var sp = this.choose_stimulus_point(tiles);
                if (!sp) {
                    this.k = this.k_max;
                    continue;
                }
                sp.state = this.m+2;
                
                var bubble = this.random_choice(this.neighbor_state(sp, 0, tiles));
                bubble.state = this.m+1;
                for (const tile of tiles) {
                    if (tile.prevState == this.m) 
                        tile.state = this.m+1;
                } 
                this.k += 1;
                continue;
            }

            for (const tile of tiles) {
                if (tile.prevState == this.m+2) {
                    var bubble_neighbors = this.neighbor_state(tile, this.m+1, tiles);
                    var s = this.neighbor_state(tile, 0, tiles).length;
                    if (bubble_neighbors.length == 0 || s >= this.s)
                        this.k = this.k_max;
                    else {
                        tile.state = this.m+3; // marked
                        this.random_choice(bubble_neighbors).state = this.m+2;
                    }
                }
            }
            this.k += 1;
        }
        for (const tile of tiles)
            tile.prevState = tile.state;
        this.reform_skeleton(tiles);
        this.k = 0;
        return true;
    }

    reform_skeleton(tiles) {
        for (const tile of tiles) {
            if (tile.prevState == 0 || tile.prevState == this.m + 4)
                continue;
            else if (tile.prevState == this.m + 2) {
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
    
    check_in_rectangle(x, y, rectangle) {
        var x1 = rectangle[0][0];
        var x2 = rectangle[1][0];
        var y1 = rectangle[0][1];
        var y2 = rectangle[1][1];

        return x > x1 && x < x2 && y > y1 && y < y2;
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

    calculate_coordinates(tile) {
        var bar_x = 0;
        var bar_y = 0;
        for (var i = 0; i < tile.bounds.length; i+=2) {
            bar_x += tile.bounds[i];
            bar_y += tile.bounds[i+1];
        }
        bar_x = 2 * bar_x / tile.bounds.length;
        bar_y = 2 * bar_y / tile.bounds.length;
        return [bar_x, bar_y];
    }
    
    distance(a, b) {
        return Math.abs(b[1]-a[1]) + Math.abs(b[0]-a[0]);
    }

    // choose_stimulus_point(tiles) {
    //     var distances = [];
    //     var food_sources = [];
    //     var skeleton = [];

    //     for (const tile of tiles) {
    //         if (tile.prevState == this.m+1 && this.neighbor_state(tile, 0, tiles).length > 0)
    //             skeleton.push(tile);
    //         else if (tile.prevState == this.m+4)
    //             food_sources.push(this.calculate_coordinates(tile));
    //     }

    //     var coords = [];
    //     for (const tile of skeleton)
    //         coords.push(this.calculate_coordinates(tile));

    //     var sum_d_inverse = 0;
    //     for (const tile of skeleton) {
    //         var min_d = 10e12;
    //         var coords = this.calculate_coordinates(tile);
    //         for (const coord of food_sources)
    //             min_d = Math.min(min_d, this.distance(coord, coords));
    //         sum_d_inverse += 1/(min_d*min_d);
    //         distances.push(min_d);
    //     }

    //     var probabilities = [];
    //     for (const d of distances) 
    //         probabilities.push(1/((d*d)*sum_d_inverse));
        
        
    //     return this.random_choice_prob(skeleton, probabilities);
    // }

    choose_stimulus_point(tiles) {
        var skeleton = [];
        for (const tile of tiles) {
            if (tile.prevState == this.m+1 && this.neighbor_state(tile, 0, tiles).length > 0)
                skeleton.push(tile);
        }

        if (skeleton.length == 0)
            return null;

        var active_zones = [ [[-30, -3], [-5, 3]],  [[5, -3], [30, 3]], [[-3, 5], [3, 30]], [[-3, -30], [3, -5]]]; 
        var valid = [];
        for (const tile of skeleton) {
            var bar_x = 0;
            var bar_y = 0;
            for (var i = 0; i < tile.bounds.length; i+=2) {
                bar_x += tile.bounds[i];
                bar_y += tile.bounds[i+1];
            }

            bar_x = 2 * bar_x / tile.bounds.length;
            bar_y = 2 * bar_y / tile.bounds.length;
            
            for (const rectangle of active_zones) {
                if (!this.check_in_rectangle(bar_x, bar_y, rectangle))
                    continue;
                valid.push(tile);
                break;
            }
        }
        if (valid.length > 0)
            return this.random_choice(valid);
        return this.random_choice(skeleton);
        
    }
}