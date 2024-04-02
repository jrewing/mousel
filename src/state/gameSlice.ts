import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card, Player, Suit, Game, SuitSymbol, Value, Round } from '../Types'
import PlayerComponent from '../PlayerComponent';

// Step 1: Define the initial state
const initialState: Game = {
    players: [],
    deck: [],
    discardedCards: [],
    currentRound: 0,
    currentTurn: undefined,
    isGameOver: false,
    numberOfPlayers: 0,
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
    trumpSuit: undefined,
    turns: [],
    currentTurn: 0,
    trumpForSale: true,
    dealerTookTrump: false,
    playerTookTrump: undefined,
}

const createPlayers = (numberOfPlayers: number) => {
    const players = [] as Player[];
    for (let i = 0; i < numberOfPlayers; i++) {
        const player = {
            id: i,
            name: `Player ${i + 1}`,
            hasFolded: false,
            isDealer: false,
            hand: [],
            tricks: 0,
            isTurn: false,
            isFolded: false,
            hasExchangedCards: false,
            isSmallBlind: false,
            isDeclarer: false,
            bank: 200,
            hasTakenTrump: false,
            hasTakenTrumpEarly: false,
            hasRefusedTrump: false,
            hasRefusedTrumpEarly: false,
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
                isPlayed: false,
                isDiscarded: false,
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
            //Reset player hands, player tricks, player hasFolded, player hasExchangedCards, player isDealer, player isSmallBlind, declarer
            state.players = state.players.map(player => {
                return {
                    ...player,
                    hand: [],
                    tricks: 0,
                    hasFolded: false,
                    hasExchangedCards: false,
                    isDealer: false,
                    isSmallBlind: false,
                    isDeclarer: false,
                }
            });
            state.rounds.push(newRoundState);
        },
        setDealer(state, action: PayloadAction<number>) {
            //remove current dealer
            const currentDealer = state.players.find(player => player.isDealer);
            if (currentDealer) {
                currentDealer.isDealer = false;
            }
            const player = state.players.find(player => player.id === action.payload);
            if (player) {
                player.isDealer = true;
                state.rounds[state.currentRound].dealer = action.payload;
            }

        },
        dealCards(state) {
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
           } else if (state.rounds[state.currentRound].roundState === '2Cards') {
               state.rounds[state.currentRound].roundState = '4Cards';
           }
        },
        setTrumoSuitHidden(state) {
            state.rounds[state.currentRound].trumpSuit = state.deck[0];
            state.deck = state.deck.slice(1);
            state.rounds[state.currentRound].hiddenTrumpSuit = true;
        },
        setTrumpSuit(state) {
            state.rounds[state.currentRound].trumpSuit = state.deck[0];
            state.deck = state.deck.slice(1);
        },
        selectCard(state, action: PayloadAction<{ card: Card }>) {
            const card = action.payload.card;
            const player = state.players.find(player => player.hand.find(cardf => cardf.id === card.id))

            if (player) {
                const newHand = player.hand.map(c => {
                    if (c.id === card.id) {
                        return { ...c, isSelected: !c.isSelected };
                    }
                    return c;
                });
                player.hand = newHand;
            }
        },
        exchangeCards(state, action: PayloadAction<Player>) {
            //swap all selected cards with new cards from the deck
            const player = action.payload;
            const newDeck = [...state.deck];
            const discardedCards = [...state.discardedCards]
            const newHand = player.hand.map(card => {
                if (card.isSelected) {
                    discardedCards.push({...card, isDiscarded: true});
                    const drawnCard = newDeck.pop();
                    if (drawnCard) {
                        return drawnCard;
                    }
                    return card;
                }
                return card;
            });
        
            // Find the index of the player in the state
            const playerIndex = state.players.findIndex(p => p.id === player.id);
        
            // Replace the player with a new object, with the updated hand
            if (playerIndex !== -1) {
                state.players[playerIndex] = { ...player, hand: newHand, hasExchangedCards: true};
            }
            // Replace the deck with the updated deck
            state.deck = newDeck;
            //If all players have exchanged cards, initialize turn
            if (state.players.every(player => player.hasExchangedCards)) {
                state.rounds[state.currentRound].roundState = 'Showdown';
                const turn = {
                    startingPlayer: state.players[0],
                    currentPlayer: state.players[0],
                    nextPlayer: state.players[0],
                    winner: undefined,
                    cardsPlayed: [],
                    turnNumber: 1,
                    suit: undefined,
                }
                state.rounds[state.currentRound].turns.push(turn);
            }
        },
        addWager(state, action: PayloadAction<{player: Player, amount: number }>) {
            const { player, amount } = action.payload;
            const playerIndex = state.players.findIndex(p => p.id === player.id);
        
            // Replace the player with a new object, with the updated bank
            if (playerIndex !== -1) {
                state.players[playerIndex] = { ...player, bank: player.bank - amount, isSmallBlind: true};
            }
        
            state.rounds[state.currentRound].roundPot += amount;
        },
        setStartingPlayer(state, action: PayloadAction<Player>) {
            const currentRound = state.rounds[state.currentRound];
            const startingPlayer = action.payload;
            const currentTurn = currentRound.turns[currentRound.currentTurn]
            if (currentTurn) {
                currentTurn.startingPlayer = startingPlayer;
                currentTurn.currentPlayer = startingPlayer;
            }
        },
        takeTrumpEarly(state, action: PayloadAction<{player: Player}>) {
            state.rounds[state.currentRound].dealerTookTrump = true;
            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id && state.rounds[state.currentRound].trumpSuit !== undefined) {
                    //add trump card to player hand
                    const trumpCard = state.rounds[state.currentRound].trumpSuit;
                    if (trumpCard) {
                        player.hand.push(trumpCard);
                        player.hasTakenTrumpEarly = true;
                        player.hasTakenTrump = true;
                    }
                }
                return player;
            }
            )
        },
        takeTrump(state, action: PayloadAction<{player: Player}>) {
            state.rounds[state.currentRound].playerTookTrump = action.payload.player;
            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id && state.rounds[state.currentRound].trumpSuit !== undefined) {
                    //add trump card to player hand
                    const trumpCard = state.rounds[state.currentRound].trumpSuit;
                    if (trumpCard) {
                        player.hand.push(trumpCard);
                        player.hasTakenTrump = true;
                    }
                }
                return player;
            }
            )
        },
        playCard(state, action: PayloadAction<{ card: Card, player: Player }>) {
            const { card, player } = action.payload;
            //set isPlayed on card in state to true
            const playerIndex = state.players.findIndex(p => p.id === player.id);
            if (playerIndex !== -1) {
                const newHand = state.players[playerIndex].hand.map(c => {
                    if (c.id === card.id) {
                        return { ...c, isPlayed: true };
                    }
                    return c;
                });
                state.players[playerIndex].hand = newHand;
            }
            const currentRound = state.rounds[state.currentRound];
            const currentTurn = currentRound.turns[currentRound.currentTurn];

            //A card can only be played if state is "Showdown" and all players have exchanged cards
            if (currentRound.roundState !== 'Showdown' || !state.players.every(player => player.hasExchangedCards)) {
                console.warn('round state not showdown or players have not exchanged cards. Cant play card');
                return;
            }
            if (currentTurn && currentTurn.turnNumber > state.numberOfPlayers) {
                console.log('too many cards played');
                //Error state too many cards played
                return
            }
            if (currentTurn && currentTurn.turnNumber <= state.numberOfPlayers) {
                if (currentTurn.turnNumber === 1) {
                    currentRound.suitLed = card.suit;
                    currentTurn.suit = card.suit;
                }
                currentTurn.cardsPlayed.push({ card, player });
                currentTurn.currentPlayer = player
                currentTurn.nextPlayer = state.players[(player.id + 1) % state.numberOfPlayers];
                currentTurn.turnNumber++;
            } else if (!currentTurn){
                currentRound.turns.push({
                    startingPlayer: player,
                    currentPlayer: player,
                    nextPlayer: state.players[(player.id + 1) % state.numberOfPlayers],
                    winner: undefined,
                    cardsPlayed: [{ card, player }],
                    turnNumber: 1,
                    suit: card.suit,
                });
            } 

            if (currentTurn?.turnNumber > state.numberOfPlayers) {
                //End turn
                //Find winner. Winning card is the highest card of the suit led or the highest trump card
                const winner = currentTurn.cardsPlayed.reduce((acc: { card: Card; player: Player},  { card, player }: { card: Card; player: Player }) => {
                    if (acc.card.suit === currentRound.trumpSuit?.suit && card.suit === currentRound.trumpSuit.suit) {
                        if (card.value === 'Jack') {
                            return { card, player };
                        }
                        if (acc.card.value === 'Jack') {
                            return acc;
                        }
                        if (card.value === 'Ace') {
                            return { card, player };
                        }
                        if (acc.card.value === 'Ace') {
                            return acc;
                        }
                        if (card.value === 'King') {
                            return { card, player };
                        }
                        if (acc.card.value === 'King') {
                            return acc;
                        }
                        if (card.value === 'Queen') {
                            return { card, player };
                        }
                        if (acc.card.value === 'Queen') {
                            return acc;
                        }
                        if (card.value === 10) {
                            return { card, player };
                        }
                        if (acc.card.value === 10) {
                            return acc;
                        }
                        if (card.value === 9) {
                            return { card, player };
                        }
                        if (acc.card.value === 9) {
                            return acc;
                        }
                        if (card.value === 8) {
                            return { card, player };
                        }
                        if (acc.card.value === 8) {
                            return acc;
                        }
                        if (card.value === 7) {
                            return { card, player };
                        }
                        if (acc.card.value === 7) {
                            return acc;
                        }
                        if (card.value === 6) {
                            return { card, player };
                        }
                        if (acc.card.value === 6) {
                            return acc;
                        }
                        if (card.value === 5) {
                            return { card, player };
                        }
                        if (acc.card.value === 5) {
                            return acc;
                        }
                    } else if (acc.card.suit === currentRound.trumpSuit?.suit && card.suit !== currentRound.trumpSuit.suit) {
                        return acc;
                    } else if (card.suit === currentRound.trumpSuit?.suit && acc.card.suit !== currentRound.trumpSuit.suit) {
                        return { card, player };
                    } else if (acc.card.suit === currentRound.suitLed && card.suit === currentRound.suitLed) {
                        if (card.value === 'Jack') {
                            return { card, player };
                        }
                        if (
                            acc.card.value === 'Jack') {
                            return acc;
                        }
                        if (card.value === 'Ace') {
                            return { card, player };
                        }
                        if (acc.card.value === 'Ace') {
                            return acc;
                        }
                        if (card.value === 'King') {
                            return { card, player };
                        }
                        if (acc.card.value === 'King') {
                            return acc;
                        }
                        if (card.value === 'Queen') {
                            return { card, player };
                        }
                        if (acc.card.value === 'Queen') {
                            return acc;
                        }
                        if (card.value === 10) {
                            return { card, player };
                        }
                        if (acc.card.value === 10) {
                            return acc;
                        }
                        if (card.value === 9) {
                            return { card, player };
                        }
                        if (acc.card.value === 9) {
                            return acc;
                        }
                        if (card.value === 8) {
                            return { card, player };
                        }
                        if (acc.card.value === 8) {
                            return acc;
                        }
                        if (card.value === 7) {
                            return { card, player };
                        }
                        if (acc.card.value === 7) {
                            return acc;
                        }
                        if (card.value === 6) {
                            return { card, player };
                        }
                        if (acc.card.value === 6) {
                            return acc;
                        }
                        if (card.value === 5) {
                            return { card, player };
                        }
                        if (acc.card.value === 5) {
                            return acc;
                        }
                    } else if (acc.card.suit === currentRound.suitLed && card.suit !== currentRound.suitLed) {
                        return acc;
                    }
                    return { card, player };
                });

                currentTurn.winner = winner.player;
                currentRound.roundWinner = winner.player;
                currentRound.roundNumber ++
            }
            
        }
    },
});


export const {setDealer , setTrumpSuit, initializeGame, dealCards, selectCard , setTrumoSuitHidden, newRound, exchangeCards, addWager, playCard, takeTrump, takeTrumpEarly } = gameSlice.actions;

export const selectGame = (state: { game: Game }) => state.game;
export const selectPlayers = (state: { game: Game }) => state.game.players;
export const selectPlayer = (state: { game: Game }, playerId: number) => {
    return state.game.players.find(player => player.id === playerId);
}

export const gameInitialized = (state: { game: Game }) => state.game.initialized;
export const roundInitialized = (state: { game: Game }) => state.game.rounds[state.game.currentRound].initialized;
export const selectTrumpSuit = (state: { game: Game }) => state.game.rounds[state.game.currentRound].trumpSuit;
export const selectTrumpSuitHidden = (state: { game: Game }) => state.game.rounds[state.game.currentRound].hiddenTrumpSuit;
export const selectRound = (state: { game: Game }) => state.game.rounds[state.game.currentRound];
export const selectDealer = (state: { game: Game }) => state.game.players.find(player => player.isDealer);
export const selectCurrentTurnNumber = (state: { game: Game }) => state.game.rounds[state.game.currentRound].currentTurn;
export const selectRoundPot = (state: { game: Game }) => state.game.rounds[state.game.currentRound].roundPot;
export const selectTrumpForSale = (state: { game: Game }) => state.game.rounds[state.game.currentRound].trumpForSale;
export const selectDealerTookTrump = (state: { game: Game }) => state.game.rounds[state.game.currentRound].dealerTookTrump;
export const selectPlayerTookTrump = (state: { game: Game }) => state.game.rounds[state.game.currentRound].playerTookTrump;
export const selectCurrentTurn = (state: { game: Game }) => {
    const currentRound = state.game.rounds[state.game.currentRound];
    return currentRound.turns[currentRound.currentTurn];
}
export const isPlayersTurn = (state: { game: Game }, playerId: number) => {
    const currentRound = state.game.rounds[state.game.currentRound];
    const currentTurn = currentRound.turns[currentRound.currentTurn];
    if (!currentTurn) {
        return false;
    }
    return currentTurn.nextPlayer.id === playerId;
}
export const isCardPlayable = (state: { game: Game }, card: Card) => {
    const currentRound = state.game.rounds[state.game.currentRound];
    const currentTurn = currentRound.turns[currentRound.currentTurn];
    if (!currentTurn) {
        return false;
    }
    //Card can be played if it is the players turn. The card should follow the suit led if the player has a card of the suit led. If the player does not have a card of the suit led, the player can play any card. But must try to win the trick if possible. For example, if the player has a trump card, the player cant play other cards if the trump is higher than other trumps played.
    if (currentTurn.nextPlayer.hand.find(c => c.id === card.id)) {
        if (currentTurn.cardsPlayed.length === 0) {
            return true;
        }
        const suitLed = currentRound.suitLed;
        const player = currentTurn.nextPlayer;
        const cardOfSuitLed = player.hand.find(c => c.suit === suitLed);
        if (cardOfSuitLed && card.suit !== suitLed) {
            return false;
        }
        if (cardOfSuitLed && card.suit === suitLed) {
            return true;
        }
        if (!cardOfSuitLed) {
            return true;
        }
    }

}
export const selectPlayerWhoShouldExchangeCards = (state: { game: Game }) => {
    const dealer = state.game.players.find(player => player.isDealer);
    if (dealer === undefined) {
        return;
    }
    if (dealer?.hasExchangedCards === false) {
        return dealer;
    }

    const numberOfPlayers = state.game.numberOfPlayers;
    for (let i = 0; i < numberOfPlayers; i++) {
        const index = (dealer?.id + i) % numberOfPlayers;
        const player = state.game.players.find(player => player.id === index);
        if (player?.hasExchangedCards === false && player.hand.length === 4) {
            return player;
        }
    }
}


export default gameSlice.reducer;
