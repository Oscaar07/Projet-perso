import { Building } from "../entities/Building"

export class BuildingGenerator {
    generate() {
        const buildings: Building[] = [];
        let id = 1;

        for (let x = 2; x < 25; x += 4) {
            buildings.push({
                id: id++,
                type: "house",
                x,
                y: 4,
            })

            buildings.push({
                id: id++,
                type: "office",
                x,
                y: 10,
            })

            buildings.push({
                id: id++,
                type: "restaurant",
                x,
                y: 16,
            })
        }
        
        return buildings;
    }
}