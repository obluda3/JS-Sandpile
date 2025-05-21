class SandpileRule{
    constructor(){
    }

    iterate(tile, neighbors){
        var has_changed = false;
        if(tile.prevState >= tile.neighbors.length){
            tile.state -= tile.neighbors.length;
            for(var i = 0; i < neighbors.length; i++)
                neighbors[i].state += 1;
            
            has_changed = true;
        }
        return has_changed;
    }
}