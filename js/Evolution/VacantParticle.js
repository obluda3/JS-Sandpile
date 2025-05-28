// Implémentation de VP de Gunji et al (2011)
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
                if (tile.state == 3)
                    vacant_particles.push(tile);
            
            this.s += 1;
            if (this.s == 1 || vacant_particles.length == 0) {
                var vacant_neighbors = [];
                for (const tile of tiles)
                    if (tile.state == 0 && this.neighbor_state(tile, 1, tiles).length > 0)
                        vacant_neighbors.push(tile);
                if (vacant_neighbors.length <= 0)
                    continue;
                var vacant_particle = this.random_choice(vacant_neighbors);
                vacant_particle.state = 3;
                continue;
            }

            var vacant_particle = null;
            for (var i = 0; i < vacant_particles.length; i++) {
                var neighbors = this.neighbor_state(vacant_particles[i], 1, tiles);
                if (neighbors.length > 0 && neighbors.length < 3)
                    vacant_particle = vacant_particles[i];
            }
            
            if (vacant_particle === null || this.s >= this.s_time) {
                for (const tile of tiles) {
                    if (tile.state == 2)
                        tile.state = 1;
                    else if (tile.state == 3)
                        tile.state = 0;
                }
                this.s = 0;
                continue;
            }
            
            var tmp = this.neighbor_state(vacant_particle, 1, tiles);
            console.log(tmp);
            console.log(vacant_particle);
            var new_vacant_particle = this.random_choice(this.neighbor_state(vacant_particle, 1, tiles));
            new_vacant_particle.state = 3;
            vacant_particle.state = 2;

            continue;
        } while (this.s != 0)
        return true;
    }

    
    neighbor_state(tile, state, tiles) {
        var result = [];
        for (var i = 0; i < tile.neighbors.length; i++) {
            if (tiles[tile.neighbors[i]].state == state)
                result.push(tiles[tile.neighbors[i]]);
        }
        return result;
    }
}
