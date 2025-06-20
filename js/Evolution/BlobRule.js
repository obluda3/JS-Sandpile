const States = {
    Empty: 0,
    Food: 1,
    Body: 2,
    Path: 3,

    BodyFlux_3: 4,
    BodyFlux_2: 5,
    BodyFlux_1: 6,

    FoodFlux_3: 7,
    FoodFlux_2: 8,
    FoodFlux_1: 9,
    Empty2: 10
};

class BlobRule {

    constructor() {
        this.is_global = false;
    }

    iterate(tile, neighbors) {
        tile.state = tile.prevState;


        if (tile.prevState === States.Body || tile.prevState === States.Food || tile.prevState === States.Path) 
            return false;

        var bodyFluxCount = this.neighbor_count(neighbors, States.BodyFlux_3) +
                               this.neighbor_count(neighbors, States.BodyFlux_2) +
                               this.neighbor_count(neighbors, States.BodyFlux_1) +
                               this.neighbor_count(neighbors, States.Body);

        var foodFluxCount = this.neighbor_count(neighbors, States.FoodFlux_3) +
                               this.neighbor_count(neighbors, States.FoodFlux_2) +
                               this.neighbor_count(neighbors, States.FoodFlux_1) +
                               this.neighbor_count(neighbors, States.Food);
        
        if (bodyFluxCount > 0 && foodFluxCount > 0) {
            tile.state = States.Path;
            return tile.state !== tile.prevState;
        }
        
        switch (tile.prevState) {
            case States.Empty:
                if (bodyFluxCount > 0) {
                    tile.state = States.BodyFlux_3;
                } else if (foodFluxCount > 0) {
                    tile.state = States.FoodFlux_3;
                }
                break;

            case States.BodyFlux_3:
                tile.state = States.BodyFlux_2;
                break;
            case States.BodyFlux_2:
                tile.state = States.BodyFlux_1;
                break;
            case States.BodyFlux_1:
                tile.state = States.Empty2;
                break;

            case States.FoodFlux_3:
                tile.state = States.FoodFlux_2;
                break;
            case States.FoodFlux_2:
                tile.state = States.FoodFlux_1;
                break;
            case States.FoodFlux_1:
                tile.state = States.Empty2;
                break;
        }

        return tile.state !== tile.prevState;
    }

    neighbor_count(neighbors, state) {
        var count = 0;
        for (var i = 0; i < neighbors.length; i++) {
            if (neighbors[i].prevState === state) {
                count++;
            }
        }
        return count;
    }
}