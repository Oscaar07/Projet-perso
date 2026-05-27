import {Citizen} from "../entities/Citizen"
import { Building } from "../entities/Building"

export class CityFinanceSystem {
    update(params: { citizens: Citizen[], buildings: Building[], cityMoney: number }) {
        let cityMoney = params.cityMoney

        cityMoney += this.collectTaxes(params.citizens)
        cityMoney -= this.payBuildingUpKeep(params.buildings)
        return {cityMoney}
    }

    private collectTaxes(citizens: Citizen[]) {
        let collectedTaxes = 0
        citizens.forEach((citizen) => {
            const tax = citizen.money * 0.001
            collectedTaxes += tax
            citizen.money -= tax
        })
        return collectedTaxes
    }

    private payBuildingUpKeep(buildings: Building[]) {
        let upKeep = 0
        buildings.forEach((building) => {
            if(building.type === "house") {
                upKeep += 1
            } else if(building.type === "office") {
                upKeep += 2
            } else if(building.type === "restaurant") {
                upKeep += 3
            }
        })
        return upKeep * 0.01
    }
}
