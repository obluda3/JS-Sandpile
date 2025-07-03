const Direction = {
    West: 0,
    East: 1,
    South: 2,
    North: 3,
    None: 4
};

const States = {
    Empty: 0,
    Blob: 1,
    Food: 2,
    Path: 3,
    RetractingBlob: 4,
    FoundFood: 5,
    Wall:6,
};

class BlobRule {
    constructor() {
        this.is_global = false;
        this.customColor = true
        this.opposite_directions = {
            0: 1, 1: 0, 2: 3, 3: 2
        };
    }

    iterate(tile, neighbors) {
        if (!('direction' in tile)) {
            tile.direction = Direction.None;
        }

        if (tile.prevState == States.Path || tile.prevState == States.FoundFood || tile.prevState == States.Wall) {
            return false;
        }

        switch (tile.prevState) {
            case States.RetractingBlob:
                tile.state = States.Empty;
                return true;

            case States.Food:
                if (neighbors.some(n => n && n.prevState == States.Blob)) {
                    tile.state = States.FoundFood;
                    return true;
                }
                break;

            case States.Empty:
                for (var i = 0; i < neighbors.length; i++) {
                    const neighbor = neighbors[i];
                    if (neighbor && neighbor.prevState === States.Blob) {
                        tile.state = States.Blob;
                        tile.direction = this.opposite_directions[i];
                        return true;
                    }
                }
                break;

            case States.Blob:
                if (tile.direction === Direction.None) {
                    break;
                }

                let isNextToPath = false;
                let becomesPath = false;

                for (var i = 0; i < neighbors.length; i++) {
                    var neighbor = neighbors[i];
                    if (!neighbor) continue;

                    if (neighbor.prevState === States.Food && neighbor.neighborsRef) {
                        var foodCell = neighbor;
                        var myPriority = this.opposite_directions[i];
                        var isHighestPriority = true;

                        for (var j = 0; j < foodCell.neighborsRef.length; j++) {
                            var otherBlobCandidate = foodCell.neighborsRef[j];
                            var otherPriority = j;

                            if (otherBlobCandidate && otherBlobCandidate.prevState === States.Blob) {
                                if (otherPriority < myPriority) {
                                    isHighestPriority = false;
                                    break;
                                }
                            }
                        }

                        if (isHighestPriority) {
                            tile.state = States.Path;
                            return true;
                        }
                    }

                    if (neighbor.prevState === States.Path) {
                        isNextToPath = true;
                        if (neighbor.direction === i) {
                            becomesPath = true;
                            break;
                        }
                    }
                }

                if (becomesPath) {
                    tile.state = States.Path;
                    return true;
                }

                if (neighbors.some(n => n && n.prevState === States.RetractingBlob)) {
                    tile.state = States.RetractingBlob;
                    return true;
                }

                if (isNextToPath) {
                    tile.state = States.RetractingBlob;
                    return true;
                }
                break;
        }
        
        return false;
    }

    color(tile) {
        switch (tile.state) {
            case States.Blob:
                return new THREE.Color("#FFE135");

            case States.Food:
                return new THREE.Color("#ff0000");

            case States.Path:
                return new THREE.Color("#d68f00"); 

            case States.RetractingBlob:
                return new THREE.Color("#fff099");

            case States.FoundFood:
                return new THREE.Color("#ff4444");
            
            case States.Wall:
                return new THREE.Color("#000000");

            default:
                return new THREE.Color("#ffffff");
        }
    }
}
