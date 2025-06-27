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
        this.physarumAttraction = 0.3;   
    }

    iterate(tile, neighbors) {
        if (!('physarumMass' in tile)) {
            // init
            tile.physarumMass = tile.state == States.Initial ? 100 : 0;
            tile.availableArea = tile.state == States.Wall ? 0 : 1;
            tile.chemoAttractant = tile.state == States.Food ? 100 : 0;
            tile.tubeExistence = 0;
            return true;
        }
        if (neighbors.length != 8)
            return false;


        var west = neighbors[0];
        var east = neighbors[1];
        var south = neighbors[2];
        var north = neighbors[3];
        var northEast = neighbors[4];
        var northWest = neighbors[5];
        var southEast = neighbors[6];
        var southWest = neighbors[7];

        var paMap = [0, 0, 0, 0, 0, 0, 0, 0];
        
        var maxChemoattractantIndex = 0;
        for (var i = 0; i < neighbors.length; i++) {
            if (neighbors[i].chemoAttractant > neighbors[maxChemoattractantIndex].chemoAttractant)
                maxChemoattractantIndex = i;
        }

        paMap[maxChemoattractantIndex] = this.physarumAttraction;
        paMap[this.opposite_side(maxChemoattractantIndex)] = -this.physarumAttraction;
        var verbose = false;
        for (var i = 0; i < neighbors.length; i++)
            if (neighbors[i].state == States.Initial)
                verbose = true;
        var pm = tile.physarumMass;
        var cha = tile.chemoAttractant;
        if (verbose)
            console.log(pm + " " + cha);
        for (var i = 0; i < 4; i++) { // VN
            tile.physarumMass += this.physarumDiffusionParameter1*((1+paMap[i])*neighbors[i].physarumMass-this.physarumDiffusionParameter3*pm);
            tile.chemoAttractant += this.chemoAttractantConstant1*(neighbors[i].chemoAttractant-this.chemoAttractantConstant3*cha)
        }

        for (var i = 4; i < 8; i++) { // Diagonals
            if (verbose)
                console.log(tile.physarumMass + " " + tile.chemoAttractant);
            tile.physarumMass += this.physarumDiffusionParameter2*((1+paMap[i])*neighbors[i].physarumMass-this.physarumDiffusionParameter3*pm);
            tile.chemoAttractant += this.chemoAttractantConstant2*(neighbors[i].chemoAttractant-this.chemoAttractantConstant3*cha)
        }
        tile.chemoAttractant*=this.consumptionConstant;
        if (verbose)
            console.log(pm + " " + cha);
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
        var x = result.lerp(new THREE.Color("#FFE135"), tile.physarumMass/100);
        if (tile.physarumMass > 1)
            console.log(x);
        return x;
    }
}