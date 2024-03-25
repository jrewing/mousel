export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type SuitSymbol = "♥" | "♦" | "♣" | "♠";
export type Value =  2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "Jack" | "Queen" | "King" | "Ace"
export type Color = "Red" | "Black";
export type GameState = "Initial"|"0Cards" | "2Cards" | "4Cards" | "TrumpReady" | "RoundSettled" | "Showdown" | "SmallBlinds";

export type Game= {
    numberOfPlayers: number
    trumpSuit: string
    players: Player[]
    deck: Card[]
    pot: number
    currentBet: number
    currentTurn: Player | undefined
    currentRound: number
    isGameOver: boolean
    rounds: Round[]
    initialized: boolean
}

export type Round = {
    roundNumber: number,
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
}

export type Card = {
    suit: Suit,
    value: Value,
    suitSymbol: SuitSymbol,
    color: Color,
    isSelectable: boolean,
    isSelected: boolean,
    id: number,
}

export type Deck = Card[];

export type Player = {
    name: string,
    hand: Card[],
    score: number,
    hasFolded: boolean,
    isDealer: boolean,
    isSmallBlind: boolean,
    hasExchangedCards: boolean,
    id: number,
}
