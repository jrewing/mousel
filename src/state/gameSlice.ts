import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Card, Player, Suit, Game, SuitSymbol, Value, Round } from '../Types'


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
    roundPot: 0,
    dealer: undefined,
    playersInRound: [],
    hiddenTrumpSuit: false,
    firstTwoCards: false,
    secondTwoCards: false,
    roundState: 'Initial',
    initialized: false,
    trumpSuit: undefined,
    turns: [],
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
            isIn: true,
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
            //if roundState is Initial or 0Cards, but all players except dealer have not set small blind. Issue warning and return
            if (state.rounds[state.currentRound].roundState === 'Initial' || state.rounds[state.currentRound].roundState === '0Cards') {
                if (!state.players.filter(player => !player.isDealer).every(player => player.isSmallBlind)) {
                    console.warn('DealCards: All players have not set small blind. Can´t deal cards');
                    return;
                }
            }

            //If roundState is 2Cards, but trumpsuit is not set, issue warning and return
            if (state.rounds[state.currentRound].roundState === '2Cards' && state.rounds[state.currentRound].trumpSuit === undefined) {
                console.warn('DealCards: Can not deal next two cards until trump suit is set.');
                return;
            }
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
        setTrumpSuit(state, action: PayloadAction<{ hidden?: boolean } | undefined>) {
            //If roundState is 2Cards, set trump suit to the first card in the deck else issue warning and return
            if (state.rounds[state.currentRound].roundState !== '2Cards') {
                console.warn('SetTrumpSuit: Can not set trump suit if roundState is not 2Cards');
                return;
            }
            //If trump suit is already set, issue warning and return
            if (state.rounds[state.currentRound].trumpSuit !== undefined) {
                console.warn('SetTrumpSuit: Trump suit is already set');
                return;
            }
            state.rounds[state.currentRound].trumpSuit = state.deck[0];
            state.deck = state.deck.slice(1);
            // If hidden is not provided in the payload, default to false
            state.rounds[state.currentRound].hiddenTrumpSuit = action.payload?.hidden !== undefined ? action.payload.hidden : false;
        },
        toggleSelectCard(state, action: PayloadAction<{ card: Card }>) {
            //Can only select card if roundState is 4Cards and player has not changed cards or folded

            const card = action.payload.card;
            const player = state.players.find(player => player.hand.find(cardf => cardf.id === card.id))


            if (player && !player.hasExchangedCards && !player.hasFolded && player.isIn) {
                const newHand = player.hand.map(c => {
                    if (c.id === card.id) {
                        return { ...c, isSelected: !c.isSelected };
                    }
                    return c;
                });
                player.hand = newHand;
            } else {
                console.warn('Can not select card. Player has exchanged cards or has folded');
            }

        },
        exchangeCards(state, action: PayloadAction<Player>) {
            //players can only exchange cards if roundstate is 4Cards and player has not folded or has exchanged cards
            if (state.rounds[state.currentRound].roundState !== '4Cards') {
                console.warn('Roundstate is not 4Cards. Cant exchange cards');
                return;
            }

            const player = action.payload;
            if (player.hasFolded || !player.isIn) {
                console.warn('Player has folded or is not in. Cant exchange cards');
                return;
            }

            const playerTookTrump = state.players.find(player => player.hasTakenTrump);
            if (playerTookTrump === undefined) {
                console.warn('no player took trump.  Cant exchange cards');
                return;
            }
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

            //If all players who is in and not folded have exchanged cards, set roundState to Showdown
            if (state.players.filter(p=>p.isIn&&!p.hasFolded).every(player => player.hasExchangedCards) && playerTookTrump !== undefined) {
                state.rounds[state.currentRound].roundState = 'Showdown';
                //Reload the player who took trump becuase it seems playerTookTrump is outdated
                const playerTookTrump = state.players.find(player => player.hasTakenTrump);
                const turn = {
                    startingPlayer: playerTookTrump ,
                    currentPlayer: playerTookTrump ,
                    nextPlayer: playerTookTrump  ,
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
                //TODO: Check if player has enough money to add wager and rethink isSmallBlind? And add automatic wager after round ends
                state.players[playerIndex] = { ...player, bank: player.bank - amount, isSmallBlind: true};
            }

            state.rounds[state.currentRound].roundPot += amount;
        },
        takeTrumpEarly(state, action: PayloadAction<{player: Player}>) {
            //Can only take trump early if roundstate is 2Cards and player has not taken trump early and player has not folded and player is dealer
            if (state.rounds[state.currentRound].roundState !== '2Cards') {
                console.warn('Roundstate is not 2Cards. Cant take trump early');
                return;
            }

            const player = action.payload.player;
            if (player.hasTakenTrumpEarly) {
                console.warn('Player has already taken trump early');
                return;
            }

            if (player.hasFolded) {
                console.warn('Player has folded. Cant take trump early');
                return;
            }

            if (!player.isDealer) {
                console.warn('Player is not dealer. Cant take trump early');
                return;
            }

            state.rounds[state.currentRound].trumpForSale = false;
            state.rounds[state.currentRound].dealerTookTrump = true;
            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id && state.rounds[state.currentRound].trumpSuit !== undefined) {
                    //add trump card to player hand
                    const trumpCard = state.rounds[state.currentRound].trumpSuit;
                    if (trumpCard) {
                        player.hand.push(trumpCard);
                        player.hasTakenTrumpEarly = true;
                        player.hasTakenTrump = true;
                        player.isIn = true;
                    }
                }
                return player;
            }
            )
        },
        takeTrump(state, action: PayloadAction<{player: Player}>) {
            //Can only take trump if roundstate is 4Cards and player has not taken trump and player has not folded
            if (state.rounds[state.currentRound].roundState !== '4Cards') {
                console.warn('Roundstate is not 4Cards. Cant take trump');
                return;
            }
            if (state.rounds[state.currentRound].trumpSuit === undefined) {
                console.warn('Trump suit is not set. Cant take trump');
                return;
            }

            if (state.rounds[state.currentRound].trumpForSale === false) {
                console.warn('Trump is not for sale. Cant take trump');
                return;
            }

            const player = action.payload.player;
            if (player.hasTakenTrump) {
                console.warn('Player has already taken trump');
                return;
            }

            if (player.hasFolded) {
                console.warn('Player has folded. Cant take trump');
                return;
            }

            state.rounds[state.currentRound].trumpForSale = false;
            state.rounds[state.currentRound].playerTookTrump = action.payload.player;
            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id && state.rounds[state.currentRound].trumpSuit !== undefined) {
                        player.hasTakenTrump = true;
                        player.isIn = true;
                }

                return player;
            }
            )
        },
        refuseTrump(state, action: PayloadAction<{player: Player}>) {
            if (state.rounds[state.currentRound].roundState !== '4Cards') {
                console.warn('Roundstate is not 4Cards. Cant take trump');
                return;
            }
            if (state.rounds[state.currentRound].trumpSuit === undefined) {
                console.warn('Trump suit is not set. Cant take trump');
                return;
            }

            if (state.rounds[state.currentRound].trumpForSale === false) {
                console.warn('Trump is not for sale. Cant take trump');
                return;
            }

            const player = action.payload.player;
            if (player.hasTakenTrump) {
                console.warn('Player has already taken trump');
                return;
            }

            if (player.hasFolded) {
                console.warn('Player has folded. Cant take trump');
                return;
            }

            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id) {
                    player.hasRefusedTrump = true;
                }
                return player;
            })
        },
        playerFolds(state, action: PayloadAction<{player: Player}>) {
            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id) {
                    player.hasFolded = true;
                    player.isIn = false;
                }
                return player;
            })
        },
        playerIsIn(state, action: PayloadAction<{player: Player}>) {
            state.players = state.players.map(player => {
                if (player.id === action.payload.player.id) {
                    player.isIn = true;
                    player.hasFolded = false;
                }
                return player;
            })
        },
        discardCard(state, action: PayloadAction<{card: Card}>) {

            const card = action.payload.card;

            const player = state.players.find(player => player.hand.find(c => c.id === card.id));

            if (!player) {
                console.warn('Player not found');
                return;
            }
            if (player.hasFolded) {
                console.warn('Player has folded. Cant discard card');
                return;
            }
            if (!player.hasExchangedCards) {
                console.warn('Player has not exchanged cards. Cant discard card');
                return;
            }

            if (player.hand.length <= 4) {
                console.warn('Player has less than 4 cards. Cant discard card');
                return;
            }

            if (player) {
                const newHand = player.hand.map(c => {
                    if (c.id === card.id) {
                        return { ...c, isDiscarded: true };
                    }
                    return c;
                });
                player.hand = newHand;
            }
        },
        playCard(state, action: PayloadAction<{ card: Card, player: Player }>) {
            const { card, player } = action.payload;
            const playersInRound = state.players.filter(p => p.isIn && !p.hasFolded);

            const playerIndex = playersInRound.findIndex(p => p.id === player.id);

            if (card.isPlayed) {
                console.warn('Card is already played. Cant play card');
                return;
            }

            if (playerIndex === -1) {
                console.warn('Player not found or has folded. Cant play card');
                return;
            }

            const currentRound = state.rounds[state.currentRound];
            // currentTurn is the last turn in the turns array
            const currentTurn = currentRound.turns.at(-1);

            //Trump suit must have been set and a player must have taken trump before cards can be played
            if (currentRound.trumpSuit === undefined) {
                console.warn('Trump suit is not set. Cant play card');
                return;
            }

            if (currentRound.trumpSuit !== undefined && !state.players.some(player => player.hasTakenTrump)) {
                console.warn('No player has taken trump. Cant play card');
                return;
            }

            //A card can only be played if state is "Showdown" and all players have exchanged cards
            if (currentRound.roundState !== 'Showdown' || !playersInRound.every(player => player.hasExchangedCards)) {
                console.warn('round state not showdown or players have not exchanged cards. Cant play card');
                return;
            }
            if (currentTurn && currentTurn?.cardsPlayed.length > playersInRound.length) {
                console.warn('too many cards played');
                //Error state too many cards played
                return
            }

                const newHand = state.players[playerIndex].hand.map(c => {
                    if (c.id === card.id) {
                        return { ...c, isPlayed: true };
                    }
                    return c;
                });
                playersInRound[playerIndex].hand = newHand;


            if (currentTurn && currentTurn?.cardsPlayed.length < playersInRound.length) {
                if (currentRound.turns.length === 1) {
                    currentTurn.suit = card.suit;
                }
                currentTurn.cardsPlayed.push({ card, player });
                currentTurn.nextPlayer = playersInRound[(playerIndex + 1) % playersInRound.length];
            } else if (!currentTurn){
                //I think this is an error state
                console.warn('no current turn');
                /*
                currentRound.turns.push({
                    startingPlayer: player,
                    currentPlayer: player,
                    nextPlayer: playersInRound[(playerIndex + 1) % playersInRound.length],
                    winner: undefined,
                    cardsPlayed: [{ card, player }],
                    turnNumber: 1,
                    suit: card.suit,
                });
                */
            }
                //if all players who are in and not folded have played a card, end turn

            if (currentTurn && currentTurn?.cardsPlayed?.length >= playersInRound.length) {
                console.log('end turn');
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
                    } else if (acc.card.suit === currentTurn.suit && card.suit === currentTurn.suit) {
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
                    } else if (acc.card.suit === currentTurn.suit && card.suit !== currentTurn.suit) {
                        return acc;
                    }
                    return { card, player };
                });

                //Add trick to winner
                const winnerIndex = state.players.findIndex(p => p.id === winner.player.id);
                if (winnerIndex !== -1) {
                    console.log('winner', winner.player.name, winner.player.id, winnerIndex);
                    state.players[winnerIndex].tricks++;
                    //set winner on turn
                    const currentTurn = state.rounds[state.currentRound].turns.at(-1);
                    if (currentTurn) {
                        currentTurn.winner = winner.player;
                    }
                }

                currentTurn.winner = winner.player;

                if (currentRound.turns.length > 3) {
                    //End round
                    let newRoundPot = 0;
                    //Calculate points and add to winner
                    // if player who took trump got less than 2 tricks, the player must add the amount of the round pot (times 2 if 0 tricks) to the new round pot
                    const playerWhoTookTrump = state.players.find(player => player.hasTakenTrump);
                    if (playerWhoTookTrump && playerWhoTookTrump.tricks < 2) {
                        newRoundPot += (2 - playerWhoTookTrump.tricks) * (state.rounds.at(-1)?.roundPot ?? 0);
                        playerWhoTookTrump.bank -= (2 - playerWhoTookTrump.tricks) * (state.rounds.at(-1)?.roundPot ?? 0);
                    }
                    //all other players who got 0 tricks must add the amount of the round pot to the new round pot
                    state.players.filter(player => player.tricks === 0).forEach(player => {
                        newRoundPot += (state.rounds.at(-1)?.roundPot ?? 0);
                        player.bank -= (state.rounds.at(-1)?.roundPot ?? 0);
                    });
                    // all players divide the amount of the round pot by the number of tricks they got and add to their bank
                    state.players.forEach(player => {
                        player.bank += state.rounds[state.currentRound].roundPot / player.tricks;
                    });
                    const newRound: Round = {
                        roundNumber: currentRound.roundNumber + 1,
                        roundPot: newRoundPot,
                        //dealer is next id in players array after current dealer:
                        dealer: state.players[(state.players.findIndex(p => p.isDealer) + 1) % state.players.length].id ,
                        playersInRound: state.rounds[state.currentRound].playersInRound,
                        hiddenTrumpSuit: false,
                        firstTwoCards: false,
                        secondTwoCards: false,
                        roundState: 'Initial',
                        initialized: false,
                        trumpSuit: undefined,
                        turns: [],
                        trumpForSale: true,
                        dealerTookTrump: false,
                        playerTookTrump: undefined,
                    }
                    //Add new round to rounds
                    state.rounds.push(newRound);
                    state.currentRound++;

                    const newCurrentRound = state.rounds[state.currentRound];

                    newCurrentRound.turns.push({
                        nextPlayer: state.players[newCurrentRound.dealer!], // Add '!' to assert that 'dealer' is not undefined
                        winner: undefined,
                        cardsPlayed: [],
                        suit: undefined,
                    });
                    newCurrentRound.initialized = true;

                } else {
                    //After winner is found, start new turn
                    currentRound.turns.push({
                        nextPlayer: winner.player,
                        winner: undefined,
                        cardsPlayed: [],
                        suit: undefined,
                    });
                }
            }

        }
    },

});


export const {setDealer , setTrumpSuit, initializeGame, dealCards, toggleSelectCard, newRound, exchangeCards, addWager, playCard, takeTrump, takeTrumpEarly, refuseTrump, playerFolds, playerIsIn, discardCard } = gameSlice.actions;

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
export const selectCurrentTurnNumber = (state: { game: Game }) => state.game.rounds[state.game.currentRound].turns.length;
export const selectRoundPot = (state: { game: Game }) => state.game.rounds[state.game.currentRound].roundPot;
export const selectTrumpForSale = (state: { game: Game }) => state.game.rounds[state.game.currentRound].trumpForSale;
export const selectDealerTookTrump = (state: { game: Game }) => state.game.rounds[state.game.currentRound].dealerTookTrump;
export const selectPlayerTookTrump = (state: { game: Game }) => state.game.rounds[state.game.currentRound].playerTookTrump;
export const selectCurrentTurn = (state: { game: Game }) => {
    const currentRound = state.game.rounds[state.game.currentRound];
    return currentRound.turns.at(-1);
}
export const isPlayersTurn = (state: { game: Game }, playerId: number) => {
    const currentRound = state.game.rounds[state.game.currentRound];
    const currentTurn = currentRound.turns.at(-1);

    if (!currentTurn) {
        return false;
    }
    return currentTurn.nextPlayer?.id === playerId;
}
export const isCardPlayable = (state: { game: Game }, card: Card) => {
    const currentRound = state.game.rounds[state.game.currentRound];
    const currentTurn = currentRound.turns.at(-1);
    if (!currentTurn) {
        return false;
    }
    //Card can be played if it is the players turn. The card should follow the suit led if the player has a card of the suit led. If the player does not have a card of the suit led, the player can play any card. But must try to win the trick if possible. For example, if the player has a trump card, the player cant play other cards if the trump is higher than other trumps played.
    if (currentTurn.nextPlayer?.hand.find(c => c.id === card.id)) {
        if (currentTurn.cardsPlayed.length === 0) {
            return true;
        }
        const suitLed = currentTurn.suit;
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
    //the first player to exchange cards is the player who took the trump
    const playerTookTrump = state.game.players.find(player => player.hasTakenTrump) as Player | undefined;
    state.game.players.forEach(player => console.log('player', player.id, player.hasTakenTrump, player.hasExchangedCards));
    if (playerTookTrump && !playerTookTrump.hasExchangedCards) {
        return playerTookTrump;
    }

    //if no player has taken trump, return undefined
    if (!playerTookTrump) {
        return;
    }

    const numberOfPlayers = state.game.numberOfPlayers;
    for (let i = 0; i < numberOfPlayers; i++) {
        const index = (playerTookTrump.id + i) % numberOfPlayers;
        const player = state.game.players.find(player => player.id === index);
        if (player?.hasExchangedCards === false && player.hand.length === 4 && !player.hasFolded && player.isIn) {
            return player;
        }
    }
}
export const selectPlayerWhoCanTakeTrump = (state: { game: Game }) => {
    const dealer = state.game.players.find(player => player.isDealer);
    if (dealer === undefined) {
        return;
    }

    //if trumpisforsale false, return undefined
    if (state.game.rounds[state.game.currentRound].trumpForSale === false) {
        return;
    }

    if (state.game.players.some(player => player.hasTakenTrumpEarly)) {
        return;
    }

    if (state.game.players.some(player => player.hasTakenTrump)) {
        return;
    }
    //if all players have refused trump, return undefined
    if (state.game.players.every(player => player.hasRefusedTrump)) {
        return;
    }

    const numberOfPlayers = state.game.numberOfPlayers;
    if (dealer?.hasTakenTrump === false && dealer?.hasRefusedTrump === false && !dealer?.hasFolded && state.game.rounds[state.game.currentRound].roundState === '2Cards' ) {
        return dealer;
    }

    //If roundstate is 4Cards, and dealer has not taken trump, return first player who has not taken trump and not folded
    if (state.game.rounds[state.game.currentRound].roundState === '4Cards' && dealer?.hasTakenTrumpEarly === false ) {
        const startId = (dealer?.id + 1) % numberOfPlayers; // Start from the player next to the dealer
        for (let i = 0; i < numberOfPlayers; i++) {
            const index = (startId + i) % numberOfPlayers;
            const player = state.game.players.find(player => player.id === index);
            if (player?.hasTakenTrump === false && player?.hasRefusedTrump === false && !player?.hasFolded) {
                return player;
            }
        }
    }
    return;
}


export default gameSlice.reducer;
