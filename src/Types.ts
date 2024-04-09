export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type SuitSymbol = "♥" | "♦" | "♣" | "♠";
export type Value =  2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "Jack" | "Queen" | "King" | "Ace"
export type Color = "Red" | "Black";
export type GameState = "Initial" | "0Cards" | "2Cards" | "4Cards" | "TrumpReady" | "RoundSettled" | "RoundOver" | "Showdown" | "SmallBlinds" | "GameOver";

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
    roundPot: number,
    //suitLed: Suit | undefined,
    playersInRound: number[],
    hiddenTrumpSuit: boolean
    firstTwoCards: boolean
    secondTwoCards: boolean
    roundState: GameState
    dealer: number | undefined
    initialized: boolean
    turns: Turn[]
    trumpForSale: boolean
    dealerTookTrump: boolean
    playerTookTrump: number | undefined
}

export type Turn = {
    nextPlayer: number | undefined,
    winner: number | undefined,
    cardsPlayed: {cardId: number, playerId: number}[],
    suit: Suit | undefined,
}

export type Card = {
    suit: Suit,
    value: Value,
    suitSymbol: SuitSymbol,
    color: Color,
    isSelectable: boolean,
    isFresh: boolean,
    isSelected: boolean,
    isPlayed: boolean,
    isDiscarded: boolean,
    isTrump: boolean,
    isDealt: boolean,
    id: number,
}

export type Player = {
    name: string,
    hand: number[], // Card ids
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
    isIn: boolean,
}
