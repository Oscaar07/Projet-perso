import { Citizen } from "../entities/Citizen"
import { Building } from "../entities/Building"
import { Weather } from "../world/Weather"
import { CityEvent, EventType, EventResult } from "./CityEvent"


export interface ActiveEvent {
  type: EventType
  title: string
  icon: string
  description: string
  remainingTicks: number
  totalDuration: number
}

export class NarrativeDirector {
  activeEvent: ActiveEvent | null = null
  ticksSinceLastEvent = 0

  private events: CityEvent[] = [
    {
      type: "calm",
      title: "Calme",
      icon: "🌤️",
      duration: 0,
      score(_c, _b, _w, _m, ticksSinceLastEvent) {
        return Math.min(ticksSinceLastEvent * 0.5, 100)
      },
      execute(citizens, buildings, cityMoney) {
        return { description: "La ville est paisible.", citizens, buildings, cityMoney }
      },
    },

    {
      type: "fire",
      title: "Incendie",
      icon: "🔥",
      duration: 50,
      score(_c, buildings, weather, _m, _tsle) {
        return (weather === "storm" ? 40 : 0)
          + Math.min(buildings.length * 5, 30)
          + Math.random() * 30
      },
      execute(citizens, buildings, cityMoney) {
        const i = Math.floor(Math.random() * buildings.length)
        const burned = buildings.splice(i, 1)[0]
        citizens.forEach(c => {
          c.stress = Math.min(c.stress + 15, 100)
          c.mood = Math.max(c.mood - 10, 0)
        })
        return {
          description: `Un incendie a détruit ${burned.type === "house" ? "une maison" : burned.type === "office" ? "un bureau" : "un restaurant"} !`,
          citizens,
          buildings,
          cityMoney: cityMoney - 200,
        }
      },
    },

    {
      type: "epidemic",
      title: "Épidémie",
      icon: "🤒",
      duration: 80,
      score(citizens, _b, _w, _m, _tsle) {
        return citizens.filter(c => c.isSick).length * 20
          + Math.min(citizens.length, 10)
          + Math.random() * 20
      },
      execute(citizens, buildings, cityMoney) {
        citizens.forEach(c => {
          c.health = Math.max(c.health - 15, 0)
          c.stress = Math.min(c.stress + 10, 100)
        })
        return {
          description: "Une épidémie se propage dans la ville !",
          citizens,
          buildings,
          cityMoney: cityMoney - 100,
        }
      },
    },

    {
      type: "festival",
      title: "Festival",
      icon: "🎉",
      duration: 60,
      score(citizens, _b, _w, _m, _tsle) {
        const avgMood = citizens.reduce((s, c) => s + c.mood, 0) / citizens.length
        return Math.max(0, 70 - avgMood) + Math.random() * 40
      },
      execute(citizens, buildings, cityMoney) {
        citizens.forEach(c => {
          c.mood = Math.min(c.mood + 20, 100)
          c.motivation = Math.min(c.motivation + 15, 100)
        })
        return {
          description: "Un festival anime la ville ! Le moral remonte.",
          citizens,
          buildings,
          cityMoney: cityMoney + 150,
        }
      },
    },

    {
      type: "recession",
      title: "Récession",
      icon: "📉",
      duration: 120,
      score(citizens, _b, _w, cityMoney, _tsle) {
        const unemployed = citizens.filter(c => c.money < 20).length
        return Math.max(0, 80 - cityMoney / 20) + unemployed * 10 + Math.random() * 20
      },
      execute(citizens, buildings, cityMoney) {
        citizens.forEach(c => {
          c.money = Math.max(c.money - 20, 0)
          c.stress = Math.min(c.stress + 10, 100)
        })
        return {
          description: "La ville entre en récession ! Les salaires baissent.",
          citizens,
          buildings,
          cityMoney: cityMoney - 80,
        }
      },
    },
  ]

  update(
    citizens: Citizen[],
    buildings: Building[],
    weather: Weather,
    cityMoney: number,
    _tick: number,
    _day: number
  ): {
    citizens: Citizen[]
    buildings: Building[]
    cityMoney: number
    activeEvent: ActiveEvent | null
  } {
    if (this.activeEvent) {
      this.activeEvent.remainingTicks--
      if (this.activeEvent.remainingTicks <= 0) {
        this.activeEvent = null
        this.ticksSinceLastEvent = 0
      }
      return { citizens, buildings, cityMoney, activeEvent: this.activeEvent }
    }

    this.ticksSinceLastEvent++

    if (this.ticksSinceLastEvent % 100 !== 0) {
      return { citizens, buildings, cityMoney, activeEvent: null }
    }

    const scored = this.events.map(e => ({
      event: e,
      score: e.score(citizens, buildings, weather, cityMoney, this.ticksSinceLastEvent),
    }))

    scored.sort((a, b) => b.score - a.score)
    const best = scored[0]

    if (best.event.type === "calm") {
      return { citizens, buildings, cityMoney, activeEvent: null }
    }

    const result = best.event.execute(citizens, buildings, cityMoney)
    this.activeEvent = {
      type: best.event.type,
      title: best.event.title,
      icon: best.event.icon,
      description: result.description,
      remainingTicks: best.event.duration,
      totalDuration: best.event.duration,
    }

    return {
      citizens: result.citizens,
      buildings: result.buildings,
      cityMoney: result.cityMoney,
      activeEvent: this.activeEvent,
    }
  }
}