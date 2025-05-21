class GameOfLifeRule {
    constructor(){
    }

    iterate(tile, neighbors){
        var has_changed = false;
        var count = 0;
        
        for (var i = 0; i < neighbors.length; i++) 
            if (neighbors[i].prevState > 0)
                count += 1;
        
        if (tile.prevState > 0){
            if (count != 2 && count != 3) {
                has_changed = true;
                tile.state = 0;
            }
        }
        else if (count == 3){
            tile.state = 1;
            has_changed = true;
        }

        return has_changed;
    }
}