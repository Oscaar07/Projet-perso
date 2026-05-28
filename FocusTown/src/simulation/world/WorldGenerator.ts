import { WORLD_HEIGHT, WORLD_WIDTH } from "../config/worldConfig";
import { Tile } from "./Tiles"

export class WorldGenerator {
    generate(): Tile[] {
        const tiles: Tile[] = []
        // Start from a full grass grid; systems and player actions will shape it later.
        for (let x = 0; x < WORLD_WIDTH; x++) {
            for (let y = 0; y < WORLD_HEIGHT; y++) {
                tiles.push({
                    x,
                    y,
                    type: "grass",
                    movementCost: 5,
                })
            }
        }

        // Seed a horizontal road spine so citizens and buildings have a usable baseline.
        for (let x = 0; x < WORLD_WIDTH; x++) {
            const tile = tiles.find((t) => t.x === x && t.y === 6)
            if (tile) {
                tile.type = "road"
                tile.movementCost = 1
            }
        }
        return tiles
    }
}