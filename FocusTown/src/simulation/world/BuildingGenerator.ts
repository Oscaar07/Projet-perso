import { Building } from "../entities/Building"

export class BuildingGenerator {
    generate() {
        const buildings: Building[] = [];
        const occupied = new Set<string>();

        // Houses scattered in the upper area (above the road at y=6)
        for (let i = 0; i < 8; i++) {
            let x: number, y: number, key: string;
            do {
                x = 1 + Math.floor(Math.random() * 28);
                y = 1 + Math.floor(Math.random() * 4);
                key = `${x},${y}`;
            } while (occupied.has(key));
            occupied.add(key);
            buildings.push({
                id: crypto.randomUUID(),
                type: "house",
                x, y,
                capacity: 4,
                comfort: Math.random() * 100,
                cleanliness: 100,
                maxResidents: 4,
            });
        }

        // Offices scattered in the middle area (below the road)
        for (let i = 0; i < 6; i++) {
            let x: number, y: number, key: string;
            do {
                x = 1 + Math.floor(Math.random() * 28);
                y = 7 + Math.floor(Math.random() * 6);
                key = `${x},${y}`;
            } while (occupied.has(key));
            occupied.add(key);
            buildings.push({
                id: crypto.randomUUID(),
                type: "office",
                x, y,
                capacity: 999,
                comfort: 50,
                cleanliness: 100,
            });
        }

        // Restaurants scattered in the lower area
        for (let i = 0; i < 6; i++) {
            let x: number, y: number, key: string;
            do {
                x = 1 + Math.floor(Math.random() * 28);
                y = 14 + Math.floor(Math.random() * 6);
                key = `${x},${y}`;
            } while (occupied.has(key));
            occupied.add(key);
            buildings.push({
                id: crypto.randomUUID(),
                type: "restaurant",
                x, y,
                capacity: 999,
                comfort: 50,
                cleanliness: 100,
            });
        }

        return buildings;
    }
}
