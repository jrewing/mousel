import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card, Player, Suit, Game, SuitSymbol, Value, Round } from '../Types'

const exchangeCards = (hand: Card[],deck: Card[]):Card[] => {
    const newHand = hand.map(card => {
        if (card.isSelected) {
            const drawnCard = [...deck].pop()!;
            return drawnCard;
        }
        return card;
    });
    return newHand;
}
// Step 1: Define the initial state
const initialState: Game ={
    players: [],
    deck: [],
    currentRound: 0,
    currentTurn: undefined,
    currentBet: 0,
    pot: 0,
    isGameOver: false,
    numberOfPlayers: 0,
    trumpSuit: '',
    rounds: [],
    initialized: false,
};

const initialRoundState: Round = {
    roundNumber: 0,
    roundWinner: undefined,
    roundPot: 0,
    roundCards: [],
    dealer: undefined,
    suitLed: undefined,
    playersInRound: [],
    hiddenTrumpSuit: false,
    firstTwoCards: false,
    secondTwoCards: false,
    roundState: 'Initial',
    initialized: false,
}
const createPlayers = (numberOfPlayers: number) => {
    console.log(numberOfPlayers)
    const players = [] as Player[];
    for (let i = 0; i < numberOfPlayers; i++) {
        const player = {
            id: i,
            name: `Player ${i + 1}`,
            hasFolded: false,
            isDealer: false,
            hand: [],
            score: 0,
            isTurn: false,
            isFolded: false,
            hasExchangedCards: false,
            isSmallBlind: false,
        } as Player;
        players.push(player);
    }
    return players;
};
const createDeck = () => {
    const suits: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
    const suitsSymbols: SuitSymbol[] = ["♥", "♦", "♣", "♠"];
    const values: Value[] = [5, 6, 7, 8, 9, 10, "Jack", "Queen", "King", "Ace"];
    const newDeck: Card[] = [];
    for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < values.length; j++) {
            newDeck.push({
                id: i * values.length + j,
                suit: suits[i],
                value: values[j],
                suitSymbol: suitsSymbols[i],
                color: suits[i] === 'Hearts' || suits[i] === 'Diamonds' ? 'Red' : 'Black',
                isSelectable: true,
                isSelected: false,
            })
        }
    }
    return newDeck;
}

function shuffleDeck(deck: Card[]) {
    const shuffledDeck = [...deck];
    for (let i = shuffledDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        const temp = shuffledDeck[i];
        shuffledDeck[i] = shuffledDeck[j];
        shuffledDeck[j] = temp;
    }
    return shuffledDeck;
}


// Step 2: Create the slice
const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Step 3: Define reducers
        initializeGame(state, action: PayloadAction<number>) {
            state.numberOfPlayers = action.payload;
            // Add logic to initialize players, deck, etc.
            state.players = createPlayers(state.numberOfPlayers);
            state.deck = createDeck();
            state.deck = shuffleDeck(state.deck);
            state.currentRound = 0;
            state.rounds = [initialRoundState];
            state.initialized = true;
        },
        newRound(state, action: PayloadAction<{ pot: number }>) {
            state.currentRound++;
            const newRoundState = { ...initialRoundState, roundNumber: state.currentRound };
            state.rounds.push(newRoundState);
        },
        setDealer(state, action: PayloadAction<number>) {
            const player = state.players.find(player => player.id === action.payload);
            if (player) {
                player.isDealer = true;
                state.rounds[state.currentRound].dealer = action.payload;
            }

        },
        dealCards(state) {
            // Add logic to deal cards
            const newDeck = [...state.deck];
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < state.players.length; j++) {
                    const card = newDeck.pop();
                    if (card) {
                        state.players[j].hand.push(card);
                    }
                }
            }
            state.deck = newDeck;
           if(state.rounds[state.currentRound].roundState === 'Initial' || state.rounds[state.currentRound].roundState === '0Cards') {
                state.rounds[state.currentRound].roundState = '2Cards';
           }
           if (state.rounds[state.currentRound].roundState === '2Cards') {
               state.rounds[state.currentRound].roundState = '4Cards';
           }
        },
        setTrumoSuitHidden(state) {
            state.trumpSuit = state.deck[0].suit;
            state.deck = state.deck.slice(1);
            state.rounds[state.currentRound].hiddenTrumpSuit = true;
        },
        setTrumpSuit(state) {
            state.trumpSuit = state.deck[0].suit;
            state.deck = state.deck.slice(1);
        },
        selectCard(state, action: PayloadAction<{ card: Card }>) {
            const card = action.payload.card;
            const player = state.players.find(player => player.hand.find(cardf => cardf.id === card.id))
            console.log(player, card)
            if (player) {
                const newHand = player.hand.map(c => {
                    if (c.id === card.id) {
                        console.log(card.id, c.isSelected);
                        return { ...c, isSelected: !c.isSelected };
                    }
                    return c;
                });
                player.hand = newHand;
            }
        }
        // Add other reducers for actions like shuffleDeck, exchangeCards, etc.
    },
});

// Step 4: Export action creators and reducer
export const {setDealer , setTrumpSuit, initializeGame, dealCards, selectCard , setTrumoSuitHidden, newRound   } = gameSlice.actions;

export const selectGame = (state: { game: Game }) => state.game;
export const selectPlayers = (state: { game: Game }) => state.game.players;
export const selectPlayer = (state: { game: Game }, playerId: number) => {
    return state.game.players.find(player => player.id === playerId);
}

export const gameInitialized = (state: { game: Game }) => state.game.initialized;
export const roundInitialized = (state: { game: Game }) => state.game.rounds[state.game.currentRound].initialized;

export const selectTrumpSuit = (state: { game: Game }) => state.game.trumpSuit;

export const selectTrumpSuitHidden = (state: { game: Game }) => state.game.rounds[state.game.currentRound].hiddenTrumpSuit;
export const selectRound = (state: { game: Game }) => state.game.rounds[state.game.currentRound];

export default gameSlice.reducer;
