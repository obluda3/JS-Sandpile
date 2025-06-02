// Implémentation de VP de Gunji et al (2011)

const State = {
    Vacant:0,
    Sol:1,
    Gel:2,
    VacantParticle:3
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
                if (tile.state == State.VacantParticle)
                    vacant_particles.push(tile);
            
            this.s += 1;

            // recherche de particules vacantes
            if (this.s == 1 || vacant_particles.length == 0) {
                var vacant_neighbors = [];
                for (const tile of tiles)
                    if (tile.state == State.Vacant && this.neighbor_state(tile, State.Sol, tiles).length > 0)
                        vacant_neighbors.push(tile);
                if (vacant_neighbors.length <= 0)
                    continue;
                var vacant_particle = this.random_choice(vacant_neighbors);
                vacant_particle.state = State.VacantParticle;
                continue;
            }

            // choix d'une vp se trouvant à l'intérieur du blob
            var vacant_particle = null;
            for (var i = 0; i < vacant_particles.length; i++) {
                var neighbors = this.neighbor_state(vacant_particles[i], State.Sol, tiles);
                if (neighbors.length > 0)
                    vacant_particle = vacant_particles[i];
            }
            
            // s'il n'y en a pas, on a fini
            if (vacant_particle === null || this.s >= this.s_time) {
                for (const tile of tiles) {
                    if (tile.state == State.Gel)
                        tile.state = State.Sol;
                    else if (tile.state == State.VacantParticle)
                        tile.state = State.Vacant;
                }
                this.s = 0;
                continue;
            }
            
            // définition d'une nouvelle v-p parmi les voisins de l'ancienne
            var new_vacant_particle = this.random_choice(this.neighbor_state(vacant_particle, State.Sol, tiles));
            new_vacant_particle.state = State.VacantParticle;
            vacant_particle.state = State.Gel;

            continue;
        } while (1==0)//(this.s != 0)
        return true;
    }

    // renvoie la liste des voisins de tile ayant l'état state
    neighbor_state(tile, state, tiles) {
        var result = [];
        for (var i = 0; i < tile.neighbors.length; i++) {
            if (tiles[tile.neighbors[i]].state == state)
                result.push(tiles[tile.neighbors[i]]);
        }
        return result;
    }
}
