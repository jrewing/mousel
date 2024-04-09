import { configureStore, Store } from '@reduxjs/toolkit';
import gameReducer, { initializeGame, setDealer, dealCards, setTrumpSuit, toggleSelectCard, exchangeCards, addWager, playCard, selectPlayerWhoShouldExchangeCards, selectPlayerWhoCanTakeTrump, refuseTrump, playerFolds, takeTrump, playerIsIn, selectCurrentTurn, endRound, isCardPlayable, takeTrumpEarly } from '../gameSlice';
import { RootState } from '../store';
import { Player } from '../../Types';
import exp from 'constants';




describe('game reducer', () => {
  let store: Store<RootState>;

async function dispatchAndGetState(action: any) {
    store.dispatch(action);
    // Wait for any async actions to complete
    await new Promise(resolve => setTimeout(resolve, 0));
    // Return the updated state
    return store.getState().game;
}

async function setSmallBlinds() {
    let state = await dispatchAndGetState({ type: '' }); // Get the current state
    for (let i = 0; i < state.numberOfPlayers; i++) {
        if (!state.players[i].isDealer) {
            state = await dispatchAndGetState(addWager({ player: state.players[i], amount: 1 }));
        }
    }
    return state;
}
async function setupAndDealCards() {
    let state = await dispatchAndGetState(setDealer(1));
    state = await setSmallBlinds();
    state = await dispatchAndGetState(dealCards());
    state = await dispatchAndGetState(setTrumpSuit({hidden: false}));
    state = await dispatchAndGetState(dealCards());
    return state;
}

  beforeEach(() => {
    store = configureStore({
      reducer: {
        game: gameReducer,
      },
    });
  });
  const numberOfPlayers = 5;
  it('should handle initial game setup', () => {
    const numberOfPlayers = 5;
    store.dispatch(initializeGame(numberOfPlayers));
    const state = store.getState().game;
    expect(state.numberOfPlayers).toEqual(numberOfPlayers);
    expect(state.players.length).toEqual(numberOfPlayers);
    expect(state.deck.filter(c => !c.isDealt && !c.isDiscarded && !c.isPlayed).length).toEqual(40); // assuming a standard deck
    expect(state.currentRound).toEqual(0);
    expect(state.rounds.length).toEqual(1);
    expect(state.initialized).toEqual(true);
  });

    it('should handle setting the dealer', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        const dealerId = 1;
        store.dispatch(setDealer(dealerId));
        const state = store.getState().game;
        const dealer = state.players.find(player => player.isDealer);
        expect(dealer).toBeDefined();
        expect((dealer as Player).id).toEqual(dealerId);
    })

    it('should handle setting the dealer when there is already a dealer', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        const dealerId = 1;
        store.dispatch(setDealer(dealerId));
        const state = store.getState().game;
        const dealer = state.players.find(player => player.isDealer);
        expect(dealer).toBeDefined();
        expect((dealer as Player).id).toEqual(dealerId);
        const newDealerId = 2;
        store.dispatch(setDealer(newDealerId));
        const newState = store.getState().game;
        const newDealer = newState.players.find(player => player.isDealer);
        expect(newDealer).toBeDefined();
        expect((newDealer as Player).id).toEqual(newDealerId);
    }
    )

    it('should handle dealing cards', async() => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await dispatchAndGetState(setDealer(1));
        state = await dispatchAndGetState(dealCards());
        //Cant deal cards until small blind is set
        expect(state.deck.filter(c => !c.isDealt && !c.isDiscarded && !c.isPlayed).length).toEqual(40);
        //Set small blind for all players except dealer
        for (let i = 0; i < state.numberOfPlayers; i++) {
            if (!state.players[i].isDealer) {
                state = await dispatchAndGetState(addWager({ player: state.players[i], amount: 10 }));
            }
        }
        state = await dispatchAndGetState(dealCards());
        expect(state.deck.filter(c => !c.isDealt).length).toEqual(30);
        state.players.forEach(player => {
            expect(player.hand.length).toEqual(2);
        })
        expect(state.rounds[state.currentRound].roundState).toEqual('2Cards');
    })

    it('should handle dealing cards when there are already 2 cards dealt', async () => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await dispatchAndGetState(setDealer(1));
        state = await dispatchAndGetState(dealCards());

        state = await dispatchAndGetState(dealCards());
        //cant deal cards until trump suit is set
        expect(state.rounds[state.currentRound].roundState).toEqual('Initial');
        expect(state.deck.filter(c => !c.isDealt && !c.isDiscarded && !c.isPlayed).length).toEqual(40);
        //Set trump suit
        state = await setSmallBlinds();
        state = await dispatchAndGetState(dealCards());
                expect(state.deck.filter(c => !c.isDealt).length).toEqual(30);
        state = await dispatchAndGetState(setTrumpSuit());
        state = await dispatchAndGetState(dealCards());

        expect(state.deck.filter(c => !c.isDealt && !c.isDiscarded).length).toEqual(20);
        //expect a card to be trump
        expect(state.deck.find(c => c.isTrump)).toBeDefined();
        state.players.forEach(player => {
            expect(player.hand.length).toEqual(4);
        })
        expect(state.rounds[state.currentRound].roundState).toEqual('4Cards');
    })

    it('should handle setting the trump suit', async () => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();

        expect(state.deck.filter(c => !c.isDealt && !c.isDiscarded && !c.isPlayed).length).toEqual(20);
        expect(state.rounds[state.currentRound].trumpSuit).toBeDefined();
    })

    it('should handle selecting a card', async () => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();
        expect(state.players.length).toEqual(5);
        const player = state.players[0];
        const cardId = player.hand[0];
        expect(cardId).toBeDefined();

        state = await dispatchAndGetState(toggleSelectCard( cardId ));
        const selectedCard = state.deck.find(card => card.id === cardId);
        expect(selectedCard).toBeDefined();
        expect(selectedCard?.isSelected).toEqual(true);
    })

    it('should handle exchanging cards', async () => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();
        //player 2 should take trump
        const leadPlayer = state.players[2];
        state = await dispatchAndGetState(takeTrump(leadPlayer.id));
        let player = state.players[0];
        let cardId = player.hand[0];

        state = await dispatchAndGetState(toggleSelectCard(cardId));
        player = state.players[0];
        const selectedCard = state.deck.find(card => card.id === cardId);
        expect(selectedCard?.isSelected).toEqual(true);

        state = await dispatchAndGetState(exchangeCards(player));
        player = state.players[0];
        const card = player.hand.find(c => c === selectedCard?.id)
        expect(card).toBeUndefined();
    });


    it('should add wager to the pot', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        let state = store.getState().game;
        const player = state.players[0];
        const wager = 10;
        store.dispatch(addWager({ player, amount: wager }));
        state = store.getState().game;
        expect(state.rounds[state.currentRound].roundPot).toEqual(wager);
        expect(state.players[0].bank).toEqual(190);
    })

    it('should start a round and exchange 3 players cards and check who is next to exchange cards', async () => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();

        const leadPlayer = state.players[2];
        state = await dispatchAndGetState(takeTrump(leadPlayer.id));
        const exchanger = selectPlayerWhoShouldExchangeCards(store.getState());

        expect(exchanger).toBeDefined();
        expect(exchanger?.id).toEqual(leadPlayer.id);
        const playerWhoTookTrump = state.players.find(player => player.hasTakenTrump === true);

        expect(playerWhoTookTrump).toBeDefined();

        state = await dispatchAndGetState(exchangeCards(playerWhoTookTrump as Player)); // Add type assertion

        const exchanger2 = selectPlayerWhoShouldExchangeCards(store.getState());

        expect(exchanger2).toBeDefined();
        //expect the next player to exchange cards to be the player after the player who took trump
        expect(exchanger2?.id).toEqual(state.players[3].id);
    })

    it('should play the first card in a round', async() => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();
        const leadPlayer = state.players[2];
        state = await dispatchAndGetState(takeTrump(leadPlayer.id));
        const player = state.players[0];
        const cardId = player.hand[0];
        state = await dispatchAndGetState(toggleSelectCard(cardId));

        for (const player of state.players) {
            state = await dispatchAndGetState(exchangeCards(player));
        }
        expect(cardId).not.toBe(state.players[0].hand[0])
        const firstCardPlayed = state.deck.find(c => c.id === state.players[2].hand[0]);
        state = await dispatchAndGetState(playCard({ playerId: state.players[2].id, cardId: firstCardPlayed?.id ?? 0 }));
        expect(state.rounds[state.currentRound].turns.length).toEqual(1);
        //expect lead suit to be the suit of the card played
        expect(state.rounds[state.currentRound].turns[0].suit).toEqual(firstCardPlayed?.suit);
    })
    it('should play all the cards (5 cards equal to number of players) in a round and announce the winner', async () => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();

        const whoCanTakeTrump = selectPlayerWhoCanTakeTrump({ game: state }) as Player; // Add type assertion
        expect(whoCanTakeTrump).toBeDefined();
        expect(whoCanTakeTrump?.id).toEqual(state.players[2].id);
        state = await dispatchAndGetState(takeTrump(whoCanTakeTrump?.id));
        const currentTurn = selectCurrentTurn({ game: state });
        for (const player of state.players) {
            state = await dispatchAndGetState(exchangeCards(player));
        }

        for (const player of state.players) {
            const card = state.deck.find(c => c.id === player.hand[0])
            state = await dispatchAndGetState(playCard({ playerId: player.id, cardId: card?.id ?? 0 }));
        }

        expect(state.rounds[state.currentRound].turns[0].cardsPlayed.length).toEqual(5);
        //expect current turn winner to be defined
        expect(state.rounds[state.currentRound].turns[0].winner).toBeDefined();

        //get the winning player from state current turn
        const winnerPlayer = state.players.find(player => player.id === state.rounds[state.currentRound].turns[0].winner);


        expect(winnerPlayer?.tricks).toBeDefined();
        expect(winnerPlayer?.tricks).toEqual(1);
    })
    it('should the 2 first players refuse trump, 3. folds and 4. takes the trump and 5. cant take trump', async() => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();

        const whoCanTakeTrump = selectPlayerWhoCanTakeTrump(store.getState()); // Provide the missing argument
        expect(whoCanTakeTrump).toBeDefined();
        expect(whoCanTakeTrump?.id).toEqual(state.players[2].id);

        if (whoCanTakeTrump) {
            state = await dispatchAndGetState(refuseTrump(whoCanTakeTrump.id));
        }

        //find player in state with player.id === whoCanTakeTrump.id and check if isTrumpRefused is true
        const playerWhoRefusedTrump = state.players.find(player => player.id === whoCanTakeTrump?.id);
        expect(playerWhoRefusedTrump?.hasRefusedTrump).toEqual(true);

        const whoCanTakeTrump3 = selectPlayerWhoCanTakeTrump(store.getState());
        expect(whoCanTakeTrump3).toBeDefined();
        expect(whoCanTakeTrump3?.id).toEqual(state.players[3].id);

            if (whoCanTakeTrump3) {
                state = await dispatchAndGetState(playerFolds( whoCanTakeTrump3.id));
            }


        const playerWhoFolded = state.players.find(player => player.id === whoCanTakeTrump3?.id);
        expect(playerWhoFolded?.hasFolded).toEqual(true);
        const whoCanTakeTrump4 = selectPlayerWhoCanTakeTrump(store.getState());
        expect(whoCanTakeTrump4).toBeDefined();
        expect(whoCanTakeTrump4?.id).toEqual(state.players[4].id);

        if (whoCanTakeTrump4) {
            state = await dispatchAndGetState(takeTrump( whoCanTakeTrump4.id ));
        }


        const playerWhoTookTrump = state.players.find(player => player.id === whoCanTakeTrump4?.id);
        expect(playerWhoTookTrump?.hasTakenTrump).toEqual(true);
        const whoCanTakeTrump5 = selectPlayerWhoCanTakeTrump(store.getState());
        expect(whoCanTakeTrump5).toBeUndefined();

        state = await dispatchAndGetState(playerIsIn(state.players[0].id ));

        expect(state.players[0].isIn).toEqual(true);

        const player = state.players[0];
        const cardId = player.hand[0];
        state = await dispatchAndGetState(toggleSelectCard( cardId ));

        for (const player of state.players) {
            state = await dispatchAndGetState(exchangeCards(player));
        }

        expect(selectCurrentTurn(store.getState())?.nextPlayer).toEqual(state.players[4].id);

        state = await dispatchAndGetState(playCard({ playerId: state.players[0].id, cardId: state.players[1].hand[0] }));
        state = store.getState().game;
        expect(state.rounds[state.currentRound].turns.length).toEqual(1);
    })
    it('should go through 4 turns and end the round dividing the pot to the players and', async() => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();
        const whoCanTakeTrump = selectPlayerWhoCanTakeTrump(store.getState()) as Player; // Add type assertion
        expect(whoCanTakeTrump).toBeDefined();
        expect(whoCanTakeTrump?.id).toEqual(state.players[2].id);//how do we know who should take trump?
        state = await dispatchAndGetState(takeTrump(whoCanTakeTrump.id));
        for (const player of state.players) {
            state = await dispatchAndGetState(exchangeCards(player));
        }
        //get current round because it changes after final turn
        const currentRound = state.currentRound;
        expect(state.rounds[currentRound].roundPot).toBe(4);
         //play 4 turns. Loop thorugh the following lines 4 times
        for (let i = 0; i < 4; i++) {
            const currentTurn = selectCurrentTurn(store.getState());

            //TODO: We need to set up the turns so that the player who won the last turn starts the next turn
            //the player who took the trump should start the first turn. then the winner of the last turn should start the next turn

            //const currentState = state; // Create a variable to store the value of 'state'
            const startingPlayer = currentTurn?.winner || state.players[whoCanTakeTrump.id].id;
            // Find the index of the startingPlayer
            const startIndex = state.players.findIndex(player => player.id === startingPlayer);
            // Split the array into two at the startIndex and concatenate the two parts in reverse order
            const orderedPlayers = state.players.slice(startIndex).concat(state.players.slice(0, startIndex));


            for (const player of orderedPlayers) {
                const cardId = player.hand[i];
                state = await dispatchAndGetState(playCard({ playerId: player.id, cardId: cardId }));
            }

            // Check the state after each full round of turns
            expect(state.rounds[currentRound].turns[i].cardsPlayed.length).toEqual(state.players.length);
            expect(state.rounds[currentRound].turns[i].cardsPlayed.length).toEqual(5);

            //expect current turn winner to be defined
            expect(state.rounds[currentRound].turns[i].winner).toBeDefined();

            //get the winning player from state current turn
            const winnerPlayer = state.players.find(player => player.id === state.rounds[currentRound].turns[i].winner);

            expect(winnerPlayer?.tricks).toBeDefined();
            //we expect the winner to have one more trick than the previous turn
            expect(winnerPlayer?.tricks).toBeGreaterThan(0);
        }
        expect(state.rounds[currentRound].turns.length).toEqual(4);
        expect(state.rounds[currentRound].roundState).toEqual('RoundOver');
        //dispatch endRound
        state = await dispatchAndGetState(endRound());
        //expect the round to be settled

        //expect the a new round to be created
        expect(state.rounds.length).toEqual(2);
        for (const player of state.players) {
            expect(player.hand.length).toEqual(0);
            expect(player.bank).toBeGreaterThan(190);
            expect(player.bank).toBeLessThan(205);
            expect(player.bank).not.toBe(Infinity);
        }

        const newRound = state.rounds[state.currentRound];
        expect(newRound.roundState).toEqual('Initial');
    })
    it('should go through 4 turns 1 player folds and end the round dividing the pot to the players and', async() => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
        state = await setupAndDealCards();
        const whoCanTakeTrump = selectPlayerWhoCanTakeTrump(store.getState()) as Player; // Add type assertion
        expect(whoCanTakeTrump).toBeDefined();
        expect(whoCanTakeTrump?.id).toEqual(state.players[2].id);//how do we know who should take trump?
        state = await dispatchAndGetState(takeTrump(whoCanTakeTrump.id));

        state = await dispatchAndGetState(exchangeCards(state.players[2]));
        state = await dispatchAndGetState(playerFolds(state.players[3].id));
        state = await dispatchAndGetState(exchangeCards(state.players[4]));
        state = await dispatchAndGetState(exchangeCards(state.players[0]));
        state = await dispatchAndGetState(exchangeCards(state.players[1]));
        //get current round because it changes after final turn
        const currentRound = state.currentRound;
        const playersInRound = state.players.filter(p => p.isIn && !p.hasFolded);
        expect(state.rounds[currentRound].roundPot).toBe(4);
         //play 4 turns. Loop thorugh the following lines 4 times
        for (let i = 0; i < 4; i++) {
            const currentTurn = selectCurrentTurn(store.getState());

            //the player who took the trump should start the first turn. then the winner of the last turn should start the next turn

            //const currentState = state; // Create a variable to store the value of 'state'
            const startingPlayerId = currentTurn?.nextPlayer //|| state.players[whoCanTakeTrump.id].id;
            expect(startingPlayerId).toBeDefined();
            const startingPlayer = state.players.find(player => player.id === startingPlayerId);

            expect(startingPlayer?.hasFolded).toBeFalsy();
                // Find the index of the startingPlayer
            const startIndex = playersInRound.findIndex(player => player.id === startingPlayer?.id);
            // rearrange players so that the starting player is first
            const orderedPlayers = playersInRound.slice(startIndex).concat(playersInRound.slice(0, startIndex));

            for (const player of orderedPlayers) {
                //find card that is playable
                let aCardPlayable = false;
                for (const cardId of player.hand) {
                    if (isCardPlayable(store.getState(), cardId)) {
                        aCardPlayable = true;
                        state = await dispatchAndGetState(playCard({ playerId: player.id, cardId: cardId }));
                        break;
                    }
                }
                //expect the lead suit to be set

                    expect(state.rounds[currentRound].turns[i].suit).toBeDefined();

                expect(aCardPlayable).toEqual(true);
            }
            // Check the state after each full round of turns
            expect(state.rounds[currentRound].turns[i].cardsPlayed.length).toEqual(playersInRound.length);
            //expect current turn winner to be defined
            expect(state.rounds[currentRound].turns[i].winner).toBeDefined();

            //get the winning player from state current turn
            const winnerPlayer = state.players.find(player => player.id === state.rounds[currentRound].turns[i].winner);

            expect(winnerPlayer?.tricks).toBeDefined();
            //we expect the winner to have one more trick than the previous turn
            expect(winnerPlayer?.tricks).toBeGreaterThan(0);
        }
        expect(state.rounds[currentRound].turns.length).toEqual(4);
        expect(state.rounds[currentRound].roundState).toEqual('RoundOver');
        //dispatch endRound
        state = await dispatchAndGetState(endRound());
        //expect the round to be settled

        //expect the a new round to be created
        expect(state.rounds.length).toEqual(2);
        for (const player of state.players) {
            expect(player.hand.length).toEqual(0);
            expect(player.bank).toBeGreaterThan(190);
            expect(player.bank).toBeLessThan(204);
            expect(player.bank).not.toBe(Infinity);
        }

        const newRound = state.rounds[state.currentRound];
        expect(newRound.roundState).toEqual('Initial');
    })
    it('should deal 2 cards. the dealer should take trump early, deal 2 more cards. the deealer should have 5 cards', async() => {
        let state = await dispatchAndGetState(initializeGame(numberOfPlayers));
            state = await dispatchAndGetState(setDealer(1));
            state = await setSmallBlinds();
            state = await dispatchAndGetState(dealCards());
            state = await dispatchAndGetState(setTrumpSuit({hidden: false}));
            const dealer = state.players.find(player => player.isDealer);
            expect(dealer).toBeDefined();
            state = await dispatchAndGetState(takeTrumpEarly({ player: dealer as Player }));
            state = await dispatchAndGetState(dealCards());
            const dealerAfter = state.players.find(player => player.isDealer);
            expect(dealerAfter?.hand.length).toEqual(5);

    })
})
