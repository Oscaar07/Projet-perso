/**
 * Définition de l'entité centrale du jeu : le citoyen.
 *
 * Chaque citoyen est un objet plat (type, pas class) pour faciliter la
 * sérialisation/désérialisation complète de l'état de la simulation.
 *
 * Propriétés clés :
 * - Besoins : energy, hunger, hygiene, fun, money, health
 * - État mental : mood, stress, motivation, burnout, anxiety, procrastination
 * - Émotion : emotionalState (déduit par EmotionSystem depuis les jauges)
 * - Social : relationships (amitiés), personality traits
 * - Déplacement : x/y (grille), path (file de cases), movingTicks,
 *   facingDirection (pour le rendu des sprites)
 * - Routines : workDesire/sleepDesire (chronotype), currentAction
 */
import { Memory } from "../ai/Memory";

export type JobType =
  | "developer"
  | "artist"
  | "engineer"
  | "merchant"
  | "scientist"

export interface Relationship {
    citizenId: string;
    friendship: number;
}

export type Citizen = {
    id: string;
    name: string;

    // Position grille (discrète, entière) et position précédente
    // pour interpolation du rendu.
    x: number;
    y: number;
    prevX: number;
    prevY: number;

    // États physiologiques (0-100)
    energy: number;
    hunger: number;
    hygiene: number;
    fun: number;
    money: number;
    health: number;
    isSick: boolean;

    // États psychologiques (0-100)
    mood: number;
    stress: number;
    motivation: number;
    procrastination: number;
    burnout: number;
    anxiety: number;
    discipline: number;
    confidence: number;
    perfectionism: number;

    // Social
    relationships: Relationship[];

    // Émotion déduite par EmotionSystem
    emotionalState: "happy" | "neutral" | "sad" | "burnout" | "anxious";

    // Travail
    job: JobType;

    // Lieux assignés
    homeX: number;
    homeY: number;
    homeId?: string;
    workX: number;
    workY: number;
    restaurantX: number;
    restaurantY: number;

    // Cible courante + chemin A*
    targetX: number;
    targetY: number;
    path: {x: number, y: number}[];

    // Action en cours
    currentAction: string;

    // Chronotype (définit les fenêtres travail/sommeil)
    chronotype: "morning" | "night";
    workDesire: number;
    sleepDesire: number;

    // Personnalité (traits OCEAN simplifiés)
    personality: {
        diligence: number;
        sociability: number;
        laziness: number;
    };

    // Mémoire
    memories: Memory[];

    // Habitudes (renforcées par HabitSystem)
    habits: {
        work: number;
        relax: number;
        socialize: number;
        wander: number;
    };

    // Déplacement Pokémon-style
    movingTicks: number;
    facingDirection: "down" | "up" | "left" | "right";
}
