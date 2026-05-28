import { Building } from "../entities/Building"

export class BuildingGenerator {
    generate() {
        const buildings: Building[] = [];

        // Repeat a compact house/office/restaurant pattern to bootstrap the first city block.
        for (let x = 2; x < 25; x += 4) {
            buildings.push({
                id: crypto.randomUUID(),
                type: "house",
                x,
                y: 4,
                capacity: 4,
                comfort: Math.random() * 100,
                cleanliness: 100,
            })

            buildings.push({
                id: crypto.randomUUID(),
                type: "office",
                x,
                y: 10,
                capacity: 999,  
                comfort: 50,
                cleanliness: 100,
            })

            buildings.push({
                id: crypto.randomUUID(),
                type: "restaurant",
                x,
                y: 16,
                capacity: 999,
                comfort: 50,
                cleanliness: 100,
            })
        }
        
        return buildings;
    }
}