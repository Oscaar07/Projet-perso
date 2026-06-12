import { Tile } from "../world/Tiles"
import { Building } from "../entities/Building"
import { TRAFFIC_PENALTY, WORLD_WIDTH, WORLD_HEIGHT } from "../config/worldConfig"

export class PathfindingGrid {
    private grid: {movementCost:number; occupancy:number} [][] = []

    constructor(){
        this.reset();
    }

    private reset() {
        this.grid = Array.from({length: WORLD_HEIGHT}, () => 
            Array.from({length:WORLD_WIDTH}, () => ({ movementCost:1, occupancy : 0}))
        )
    }

    rebuild(tiles : Tile[], buildings: Building[]) {
        this.reset();
        for(const tile of tiles) {
            if(tile.x >= 0 && tile.x < WORLD_WIDTH && tile.y >= 0 && tile.y < WORLD_HEIGHT) {
                this.grid[tile.y][tile.x].movementCost = tile.movementCost;
            }
        }
        for(const b of buildings) {
            if(b.x >= 0 && b.x < WORLD_WIDTH && b.y >= 0 && b.y < WORLD_HEIGHT) {
                this.grid[b.y][b.x].movementCost += 15;
            }
        }
    }

    getEffectiveCost(x : number, y : number) : number {
        if(x < 0 || x >= WORLD_WIDTH || y < 0 || y >= WORLD_HEIGHT) return Infinity
        const cell = this.grid[y][x];
        return cell.movementCost + TRAFFIC_PENALTY * cell.occupancy;
    }

    occupy(x : number, y : number){
        if(x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
            this.grid[y][x].occupancy++
        }
    }

    vacate(x : number, y : number) {
        if(x >= 0 && x < WORLD_WIDTH && y >= 0 && y < WORLD_HEIGHT) {
            this.grid[y][x].occupancy = Math.max(0, this.grid[y][x].occupancy - 1)
        }
    }
}