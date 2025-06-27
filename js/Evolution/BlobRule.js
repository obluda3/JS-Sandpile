// Implantation du modèle de Tsompanas

const States = {
    Available:0,
    Initial:1,
    Food:2,
    Wall:3
}
class BlobRule {

    constructor() {
        this.is_global = false;
        this.V_MAX = 20;
        this.first = false;
        this.customColor = true;

        this.physarumDiffusionParameter1 = 0.05; // PMP1
        this.physarumDiffusionParameter2 = 0.025; // PMP2
        this.physarumDiffusionParameter3 = 1; // PMP3
        
        this.chemoAttractantConstant1 = 0.05; // CAP1
        this.chemoAttractantConstant2 = 0.025; // CAP2
        this.chemoAttractantConstant3 = 1; // CAP3

        this.consumptionConstant = 1; // CON
        this.physarumAttraction = 0.3; // PAP
    }

    init(tile) {
        if (!('physarumMass' in tile)) 
            return true;
        
        tile.prevPhysarumMass = tile.physarumMass;
        tile.prevAvailableArea = tile.availableArea;
        tile.prevChemoAttractant = tile.chemoAttractant;
        tile.prevTubeExistence = tile.tubeExistence;
    }

    iterate(tile, neighbors) {
        if (!('physarumMass' in tile)) {
            // init
            tile.physarumMass = tile.state == States.Initial ? 100 : 0;
            tile.availableArea = tile.state == States.Wall ? 0 : 1;
            tile.chemoAttractant = tile.state == States.Food ? 100 : 0;
            tile.tubeExistence = 0;
            tile.prevPhysarumMass = tile.physarumMass;
            tile.prevAvailableArea = tile.availableArea;
            tile.prevChemoAttractant = tile.chemoAttractant;
            tile.prevTubeExistence = tile.tubeExistence;
            return true;
        }
        if (neighbors.length != 8 || tile.prevState == States.Initial)
            return false;

        var paMap = [0, 0, 0, 0, 0, 0, 0, 0];
        
        var maxChemoattractantIndex = 0;
        for (var i = 0; i < neighbors.length; i++) {
            if (neighbors[i].prevChemoAttractant > neighbors[maxChemoattractantIndex].prevChemoAttractant)
                maxChemoattractantIndex = i;
        }

        if (neighbors[maxChemoattractantIndex].chemoAttractant > tile.chemoAttractant) {
            paMap[maxChemoattractantIndex] = this.physarumAttraction;
            paMap[this.opposite_side(maxChemoattractantIndex)] = -this.physarumAttraction;
        }

        var pm = tile.physarumMass;
        var cha = tile.chemoAttractant;

        // Von Neumann neighbors
        var s1_p = 0;
        var s1_c = 0;
        for (var i = 0; i < 4; i++) {
            s1_p += (1 + paMap[i]) * neighbors[i].prevPhysarumMass;
            s1_c += neighbors[i].prevChemoAttractant;
            if (neighbors[i].state != States.Wall) {
                s2_p -= this.physarumDiffusionParameter3 * pm;
                s2_c -= this.chemoAttractantConstant3 * cha;
            }
        }

        // Diagonal neighbors
        var s2_p = 0;
        var s2_c = 0;
        for (var i = 4; i < 8; i++) {
            s2_p += (1 + paMap[i]) * neighbors[i].prevPhysarumMass;
            s2_c += neighbors[i].prevChemoAttractant;
            if (neighbors[i].state != States.Wall) {
                s2_p -= this.physarumDiffusionParameter3 * pm;
                s2_c -= this.chemoAttractantConstant3 * cha;
            }
        }
        
        tile.physarumMass = Math.max(0, pm + this.physarumDiffusionParameter1*s1_p + this.physarumDiffusionParameter2*s2_p);
        tile.chemoAttractant = Math.max(0, (cha + this.chemoAttractantConstant1*s1_c + this.chemoAttractantConstant2*s2_c) * this.consumptionConstant);
        return true;
    }

    opposite_side(index) {
        // [W, E, S, N, NE, NW, SE, SW]
        //  0  1  2  3   4   5   6   7
        var map = {0:1, 1:0, 2:3, 3:2, 4:7, 5:6, 6:5, 7:4}
        return map[index];
    }

    color(tile) {
        if (tile.state == States.Wall)
            return new THREE.Color("#000000");
        if (tile.state == States.Initial)
            return new THREE.Color("#ffff00");
        if (tile.state == States.Food)
            return new THREE.Color("#ff0000");
        if (!('physarumMass' in tile))
            return new THREE.Color("#ffffff");
        
        var result = new THREE.Color("#ffffff");
        var x = result.lerp(new THREE.Color("#ff0000"), tile.physarumMass/100);

        return x;
    }
}