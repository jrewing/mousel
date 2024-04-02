export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type SuitSymbol = "♥" | "♦" | "♣" | "♠";
export type Value =  2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "Jack" | "Queen" | "King" | "Ace"
export type Color = "Red" | "Black";
export type GameState = "Initial"|"0Cards" | "2Cards" | "4Cards" | "TrumpReady" | "RoundSettled" | "Showdown" | "SmallBlinds";

export type Game= {
    numberOfPlayers: number
    players: Player[]
    deck: Card[]
    discardedCards: Card[]
    currentTurn: Player | undefined
    currentRound: number
    isGameOver: boolean
    rounds: Round[]
    initialized: boolean
}

export type Round = {
    roundNumber: number,
    trumpSuit: Card | undefined,
    roundWinner: Player | undefined,
    roundPot: number,
    roundCards: Card[],
    suitLed: Suit | undefined,
    playersInRound: Player[],
    hiddenTrumpSuit: boolean
    firstTwoCards: boolean
    secondTwoCards: boolean
    roundState: GameState
    dealer: number | undefined
    initialized: boolean
    currentTurn: number
    turns: Turn[]
    trumpForSale: boolean
    dealerTookTrump: boolean
    playerTookTrump: Player | undefined
}

export type Turn = {
    startingPlayer: Player,
    currentPlayer: Player,
    nextPlayer: Player,
    winner: Player | undefined,
    cardsPlayed: {card: Card, player: Player}[],
    turnNumber: number,
    suit: Suit | undefined,
}

export type Card = {
    suit: Suit,
    value: Value,
    suitSymbol: SuitSymbol,
    color: Color,
    isSelectable: boolean,
    isSelected: boolean,
    isPlayed: boolean,
    isDiscarded: boolean,
    id: number,
}

export type Player = {
    name: string,
    hand: Card[],
    tricks: number,
    hasFolded: boolean,
    isDealer: boolean,
    isSmallBlind: boolean,
    hasExchangedCards: boolean,
    id: number,
    bank: number,
    isDeclarer: boolean,
    hasTakenTrump: boolean,
    hasRefusedTrump: boolean,
    hasTakenTrumpEarly: boolean,
    hasRefusedTrumpEarly: boolean,
}
