// simulation/systems/TimeSystem.ts

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
