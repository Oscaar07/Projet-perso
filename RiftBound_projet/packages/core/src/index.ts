export type {
  ActionLogEntry,
  Battlefield,
  CardCost,
  CardDefinition,
  CardInstance,
  ChainEntry,
  ChainStep,
  CombatState,
  GameError,
  GameErrorCode,
  GamePhase,
  GameState,
  OpenClosed,
  PlayerAction,
  PlayerId,
  PlayerState,
  RunePool,
  ShowdownState,
  TurnLayer,
} from "./types/game.js";

export {
  catalogFromArray,
  createCardInstance,
  createInitialGameState,
  createPlayer,
  effectiveMight,
  isMighty,
  resetInstanceCounter,
  startMatchWithDecks,
  type CardCatalog,
  type CreateMatchOptions,
} from "./types/factory.js";

export { RulesViolation, isRulesViolation } from "./engine/errors.js";
export { gameReducer, wasActionRejected, type ReduceContext } from "./engine/gameReducer.js";
export { assertCanPlaceFacedown } from "./engine/guards/facedown.js";
export {
  assertActionAllowedInClosedState,
  cardHasReactionTag,
  syncClosedState,
} from "./engine/guards/chain.js";
export {
  canPayCost,
  calculateTotalCost,
  payCost,
  runPaymentPipeline,
  type ActivationStep,
  type ActivationContext,
} from "./engine/payment.js";
export { appendActionLog, describeAction, resetLogCounter } from "./engine/actionLog.js";
export { maskGameStateForPlayer, type PublicGameState } from "./masking/rule127.js";
export { loadCardCatalog, loadCardsArray } from "./cards/catalog.js";
export {
  parseDecklist,
  EXAMPLE_DECKLIST,
  type DeckParseResult,
  type ParsedDeck,
  type DeckParseError,
  type OfficialParsedDeck,
} from "./deck/parseDecklist.js";
export {
  OFFICIAL_GUIDE,
  OFFICIAL_GUIDE_URL,
} from "./rules/officialGuide.js";
export {
  tryScore,
  scoreHolding,
  maybeConquer,
  healAllUnits,
  clearStunned,
  controlsAllBattlefields,
  controlsBattlefield,
} from "./engine/scoring.js";
export {
  validateDeckConstruction,
  assertDeckLegal,
  OFFICIAL_MAIN_MIN,
  OFFICIAL_RUNE_COUNT,
  OFFICIAL_MAX_COPIES,
} from "./deck/validateDeck.js";
export type { ArbitrationMode, BoardZone } from "./types/product.js";
export {
  RIOT_LEGAL_DISCLAIMER,
  UNOFFICIAL_FORMAT_NOTICE,
} from "./types/product.js";
export {
  RULE_COVERAGE,
  ARBITRATION_GOAL,
  coverageSummary,
  type RuleCoverage,
  type RuleStatus,
} from "./rules/registry.js";
export {
  KEYWORD_RULES,
  KEYWORD_GLOSSARY,
  deriveTagsFromKeywords,
  hasKeyword,
  keywordValue,
  parseKeywordToken,
  isLegionSatisfied,
  type KeywordId,
  type KeywordDef,
  type ParsedKeyword,
} from "./rules/keywords.js";
export {
  combatOffenseMight,
  assignCombatDamage,
  sumCombatOffense,
} from "./engine/combatKeywords.js";
export {
  assertDiscretionaryAllowed,
  cardTimingClass,
} from "./rules/permissions.js";
export { runCleanup, clearTemps } from "./engine/cleanup.js";
export {
  advancePhase,
  endTurn,
  drawCards,
  channelRunes,
  runStartOfTurn,
  enforceHandLimit,
  readyAll,
} from "./engine/turn.js";
