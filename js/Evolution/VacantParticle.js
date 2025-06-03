// Implémentation de VP de Gunji et al (2011)

// bitfield
const State = {
    Vacant:1,
    Sol:2,
    Gel:4,
    Food:8,
    VacantParticle:16,
}
class VacantParticle {
    constructor(){
        this.is_global = true;
        this.s = 0;
        this.s_time = 20;

        this.is_vp_s = true;
        this.starvation = 0.3;
    }

    random_choice(arr) {
        return arr[Math.floor(Math.random()*arr.length)];
    }

    random_boolean(p) {
        return Math.random() < p;
    }

    global_iteration(tiles) {
        this.reset_board(tiles);
        do {
            this.s += 1;

            // recherche de nouvelle vp
            if (this.s == 1) {
                var vp = this.find_new_vacant_particle(tiles);
                if (!vp) {
                    this.s = 0;
                    break;
                }
                
                if (!this.is_vp_s)
                    vp.state = this.replace_state(vp.state, State.Vacant, State.VacantParticle);
                else
                    vp.state = vp.state|State.VacantParticle;
                continue;
            }

            // choix d'une vp se trouvant à l'intérieur du blob
            var vp = null;
            for (const tile of tiles)
                if (this.is_state(tile.state, State.VacantParticle))
                    vp = tile;

            // s'il n'y en a pas ou qu'elle ne peut pas se propager
            // on peut solidifer le gel, et supprimer les vp restantes
            if (vp === null || this.s >= this.s_time || this.neighbor_state(vp, State.Sol, tiles).length == 0) {
                this.reset_board(tiles);
                break;
            }
            
            // définition d'une nouvelle v-p parmi les voisins de l'ancienne
            var new_vacant_particle = this.random_choice(this.neighbor_state(vp, State.Sol, tiles));
            new_vacant_particle.state = this.replace_state(new_vacant_particle.state, State.Sol, State.VacantParticle);
            vp.state = this.replace_state(vp.state, State.VacantParticle, State.Gel);
        } while (this.s != 0)
        return true;
    }

    reset_board(tiles) {
        for (const tile of tiles) {
            if (this.is_state(tile.state, State.Gel))
                tile.state = this.replace_state(tile.state, State.Gel, State.Sol);
            else if (this.is_state(tile.state, State.VacantParticle))
                tile.state = this.replace_state(tile.state, State.VacantParticle, State.Vacant);
            if (this.is_state(tile.state, State.Food) && this.is_vp_s)
                tile.state = State.Food|State.Sol;
        }
        this.s = 0;
    }

    find_new_vacant_particle(tiles) {
        var vacant_neighbors = [];
        
        // used for vp-s
        var regular_neighbors = [];
        var food_sources = [];
        var narrow_neighbors = []; 
        for (const tile of tiles) {
            if (this.is_vp_s) {
                if (this.is_state(tile.state, State.Food))
                    food_sources.push(tile);
                else if (!this.is_state(tile.state, State.Vacant))
                    continue;
                if (this.has_narrow_neighbor(tile, tiles))
                    narrow_neighbors.push(tile);
                else if (this.neighbor_state(tile, State.Sol, tiles))
                    regular_neighbors.push(tile);
            }

            else if (!this.is_vp_s && this.is_state(tile.state, State.Vacant) 
                && this.neighbor_state(tile, State.Sol, tiles).length > 0)
                vacant_neighbors.push(tile);
        }

        if (!this.is_vp_s)
            return vacant_neighbors.length > 0 ? this.random_choice(vacant_neighbors) : null;
        return this.pick_vacant_particle_vp_s(regular_neighbors, food_sources, narrow_neighbors);
        
    }

    pick_vacant_particle_vp_s(regular_neighbors, food_neighbors, narrow_neighbors) {
        if (regular_neighbors.length + food_neighbors.length + narrow_neighbors.length == 0)
            return null;

        if (this.random_boolean(1-this.starvation) && food_neighbors.length > 0)
            return this.random_choice(food_neighbors);
        
        if (narrow_neighbors.length > 0)
            return this.random_choice(narrow_neighbors);
        if (regular_neighbors.length > 0)
            return this.random_choice(regular_neighbors);
        return this.random_choice(food_neighbors);
    }

    select_vacant_particle(vacant_particles, tiles) {
        var regular_neighbors = [];
        var food_neighbors = [];
        var narrow_neighbors = []; 

        for (var i = 0; i < vacant_particles.length; i++) {
            if (this.has_narrow_neighbor(vacant_particles[i], tiles))
                narrow_neighbors.push(vacant_particles[i]);
            else if (this.neighbor_state(vacant_particles[i], State.Food, tiles).length > 0)
                food_neighbors.push(vacant_particles[i]);
            else if (this.neighbor_state(vacant_particles[i], State.Sol, tiles).length > 0)
                regular_neighbors.push(vacant_particles[i]);

            var neighbors = this.neighbor_state(vacant_particles[i], State.Sol, tiles);
            if (neighbors.length > 0 && !this.is_vp_s)
                return vacant_particles[i];
        }
        
        if (!this.is_vp_s)
            return null;
        return this.pick_vacant_particle_vp_s(regular_neighbors, food_neighbors, narrow_neighbors);
    }

    has_narrow_neighbor(tile, tiles) {
        for (var i = 0; i < tile.neighbors.length; i++) 
            if (this.is_narrow_cell(tiles[tile.neighbors[i]], tiles))
                return true;
        return false;
    }

    is_narrow_cell(tile, tiles) {
        // neighbors = [W, E, N, S]
        if (!this.is_state(tile, State.Sol))
            return false;
        if (this.is_state(tiles[tile.neighbors[0]].state, State.Vacant) && this.is_state(tiles[tile.neighbors[1]].state, State.Vacant))
            return true;
        if (this.is_state(tiles[tile.neighbors[2]].state, State.Vacant) && this.is_state(tiles[tile.neighbors[3]].state, State.Vacant))
            return true;
        return false;
    }

    // les états sont des bits fields
    // permet d'avoir plusieurs états 
    // simultanément
    is_state(s, state) {
        return (s & state) != 0;
    }

    remove_state(s, state) {
        return s & ~state;
    }

    add_state(s, state) {
        return s | state;
    }
    replace_state(s, state1, state2) {
        return this.add_state(this.remove_state(s, state1), state2);
    }

    // renvoie la liste des voisins de tile ayant l'état state
    neighbor_state(tile, state, tiles) {
        var result = [];
        for (var i = 0; i < tile.neighbors.length; i++) {
            if (this.is_state(tiles[tile.neighbors[i]].state, state))
                result.push(tiles[tile.neighbors[i]]);
        }
        return result;
    }
}
