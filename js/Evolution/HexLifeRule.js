class HexLifeRule{
    constructor(){
    }

    iterate(tile, neighbors){
        var has_changed = false;
        var count = 0;
        
        for (var i = 0; i < neighbors.length; i++) 
            if (neighbors[i].prevState > 0)
                count += 1;
        
        if (count == 2) {
            has_changed = tile.prevState <= 0;
            tile.state = 1;
        }

        else {
            has_changed = tile.prevState > 0;
            tile.state = 0;
        }

        return has_changed;
    }
}