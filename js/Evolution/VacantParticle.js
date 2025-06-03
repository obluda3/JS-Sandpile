// Implémentation de VP de Gunji et al (2011)

// bitfield
const State = {
    Vacant:1,
    Sol:2,
    Gel:4,
    VacantParticle:8,
}
class VacantParticle {
    constructor(){
        this.m = 6;
        this.is_global = true;
        this.s = 0;
        this.s_time = 20;
    }

    random_choice(arr) {
        return arr[Math.floor(Math.random()*arr.length)];
    }

    global_iteration(tiles) {
        do {
            var vacant_particles = [];
            for (const tile of tiles)
                if (this.is_state(tile.state, State.VacantParticle))
                    vacant_particles.push(tile);
            
            this.s += 1;

            // recherche de nouvelle vp
            if (this.s == 1 || vacant_particles.length == 0) {
                var vp = this.find_new_vacant_particle(tiles);
                if (!vp)
                    break;
                vp.state = this.replace_state(vp.state, State.Vacant, State.VacantParticle);
                continue;
            }

            // choix d'une vp se trouvant à l'intérieur du blob
            var vacant_particle = this.select_vacant_particle(vacant_particles, tiles);
            
            // s'il n'y en a pas, on peut solidifer le gel, et 
            // supprimer les vp restantes
            if (vacant_particle === null || this.s >= this.s_time) {
                for (const tile of tiles) {
                    if (this.is_state(tile.state, State.Gel))
                        tile.state = this.replace_state(tile.state, State.Gel, State.Sol);
                    else if (this.is_state(tile.state, State.VacantParticle))
                        tile.state = this.replace_state(tile.state, State.VacantParticle, State.Vacant);
                }
                this.s = 0;
                continue;
            }
            
            // définition d'une nouvelle v-p parmi les voisins de l'ancienne
            var new_vacant_particle = this.random_choice(this.neighbor_state(vacant_particle, State.Sol, tiles));
            new_vacant_particle.state = this.replace_state(new_vacant_particle.state, State.Sol, State.VacantParticle);
            vacant_particle.state = this.replace_state(new_vacant_particle.state, State.VacantParticle, State.Gel);

            continue;
        } while (this.s != 0)
        return true;
    }

    find_new_vacant_particle(tiles) {
        var vacant_neighbors = [];
        for (const tile of tiles)
            if (this.is_state(tile.state, State.Vacant) && this.neighbor_state(tile, State.Sol, tiles).length > 0)
                vacant_neighbors.push(tile);
        if (vacant_neighbors.length <= 0)
            return null;
        return this.random_choice(vacant_neighbors);
    }

    select_vacant_particle(vacant_particles, tiles) {
        var vacant_particle = null;
        for (var i = 0; i < vacant_particles.length; i++) {
            var neighbors = this.neighbor_state(vacant_particles[i], State.Sol, tiles);
            if (neighbors.length > 0)
                vacant_particle = vacant_particles[i];
        }
        return vacant_particle;
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
