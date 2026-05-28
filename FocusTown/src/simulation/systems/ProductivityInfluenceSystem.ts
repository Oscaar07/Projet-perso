import {Citizen} from "../entities/Citizen"
import {ProductivitySummary} from "../../productivity/types"

export class ProductivityInfluenceSystem {
    update(citizens: Citizen[], summary: ProductivitySummary) {
        if(summary.totalTrackedSeconds <= 0) {
            return {cityMoneyDelta: 0
                    ,moodDelta: 0
                    ,motivationDelta: 0
                    ,stressDelta: 0
                    ,burnoutDelta: 0
            }
        }
        const focusRatio = summary.focusSeconds / summary.totalTrackedSeconds
        const distractionRatio = summary.distractionSeconds / summary.totalTrackedSeconds
        const idleRatio = summary.idleSeconds / summary.totalTrackedSeconds

        // Money is the city-level signal; mood/stress are citizen-level signals.
        let cityMoneyDelta = 0

        cityMoneyDelta += focusRatio * 10
        cityMoneyDelta -= distractionRatio * 8
        cityMoneyDelta -= idleRatio * 3

        citizens.forEach((citizen) => {
            // Focus sessions stabilize the population; distractions push stress upward.
            citizen.mood += focusRatio * 0.2
            citizen.motivation += focusRatio * 0.2
            citizen.stress -= focusRatio * 0.25
            citizen.burnout -= focusRatio * 0.15

            citizen.stress += distractionRatio * 0.45
            citizen.motivation -= distractionRatio * 0.35
            citizen.mood -= distractionRatio * 0.2
            citizen.burnout += distractionRatio * 0.25

            citizen.burnout += idleRatio * 0.1

            if(summary.averageProductivityScore < 40) {
                citizen.stress += 0.2
                citizen.burnout += 0.15
            }

            if(summary.averageProductivityScore > 75) {
                citizen.stress -= 0.15
                citizen.motivation += 0.15
            }

            citizen.mood =this.clamp(citizen.mood, 0, 100)
            citizen.motivation = this.clamp(citizen.motivation, 0, 100)
            citizen.stress = this.clamp(citizen.stress, 0, 100)
            citizen.burnout = this.clamp(citizen.burnout, 0, 100)
        });

        return {cityMoneyDelta,
                moodDelta: focusRatio * 0.2 - distractionRatio * 0.2,
                motivationDelta: focusRatio * 0.2 - distractionRatio * 0.35,
                stressDelta: -focusRatio * 0.25 + distractionRatio * 0.45,
                burnoutDelta: -focusRatio * 0.15 + distractionRatio * 0.25 + idleRatio * 0.1
        }
    }

    private clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value))
    }
}
