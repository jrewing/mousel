export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type SuitSymbol = "♥" | "♦" | "♣" | "♠";
export type Value =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "Jack"
  | "Queen"
  | "King"
  | "Ace";
export type Color = "Red" | "Black";
export type GameState =
  | "Initial"
  | "0Cards"
  | "2Cards"
  | "4Cards"
  | "TrumpReady"
  | "RoundSettled"
  | "RoundOver"
  | "Showdown"
  | "SmallBlinds"
  | "GameOver";

export type Game = {
  numberOfPlayers: number;
  players: Player[];
  deck: Card[];
  discardedCards: Card[];
  currentTurn: Player | undefined;
  currentRound: number;
  rounds: Round[];
  initialized: boolean;
  canFlipTrump: boolean;
};

export type Round = {
  roundNumber: number;
  trumpSuit: Card | undefined;
  roundPot: number;
  //suitLed: Suit | undefined,
  playersInRound: number[];
  hiddenTrumpSuit: boolean;
  firstTwoCards: boolean;
  secondTwoCards: boolean;
  roundState: GameState;
  dealer: number | undefined;
  initialized: boolean;
  turns: Turn[];
  trumpForSale: boolean;
  dealerTookTrump: boolean;
  playerTookTrump: number | undefined;
};

export type Turn = {
  nextPlayer: number | undefined;
  winner: number | undefined;
  cardsPlayed: { playerId: number; cardId: number; sequence: number }[];
  suit: Suit | undefined;
};

export type Card = {
  suit: Suit;
  name: Value;
  value: number;
  suitSymbol: SuitSymbol;
  color: Color;
  isFresh: boolean;
  isSelected: boolean;
  isPlayed: boolean;
  isDiscarded: boolean;
  isTrump: boolean;
  isDealt: boolean;
  id: number;
};

export type Player = {
  name: string;
  hand: number[]; // Card ids
  tricks: number;
  hasFolded: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  hasExchangedCards: boolean;
  id: number;
  bank: number;
  isDeclarer: boolean;
  hasFlippedTrump: boolean;
  hasRefusedToFlipTrump: boolean;
  hasTakenTrump: boolean;
  hasRefusedTrump: boolean;
  hasTakenTrumpEarly: boolean;
  hasRefusedTrumpEarly: boolean;
  isIn: boolean;
};

export type PlayedCard = {
  cardId: number;
  playerId: number;
  rectRef: DOMRect;
};

export type CardInTurn = {
  cardId: number;
  playerId: number;
  sequence: number;
};
