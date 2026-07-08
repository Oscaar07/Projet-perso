/**
 * Gère le cycle jour/nuit et la météo.
 *
 * Le temps avance de 0.1h par tick (soit 10 ticks par heure simulée).
 * Un cycle jour complet dure 240 ticks.
 *
 * La météo change chaque jour avec des probabilités :
 * - sunny 60% (effet positif sur le mood)
 * - rain  20% (effet négatif)
 * - fog   15%
 * - storm  5%
 *
 * Les effets météo sont appliqués par NeedsSystem et l'affichage
 * par le rendu (overlays visuels).
 */
import { Weather } from "../world/Weather"

export class TimeSystem {
  update(ctx: {time: number, day: number, weather: Weather}) {
    let nextTime = ctx.time + 0.1
    let nextDay = ctx.day
    let nextWeather = ctx.weather

    if (nextTime >= 24) {
      nextTime = 0
      nextDay ++
      nextWeather = this.updateWeather()
    }

    return { time: nextTime, day: nextDay, weather: nextWeather }
  }

  private updateWeather(): Weather {
    const random = Math.random()
    if (random < 0.6) {
      return "sunny"
    } else if (random < 0.8) {
      return "rain"
    } else if (random < 0.95) {
      return "fog"
    } else {
      return "storm"
    }
  }
}
