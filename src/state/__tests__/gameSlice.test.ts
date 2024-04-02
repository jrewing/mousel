import { configureStore, Store } from '@reduxjs/toolkit';
import gameReducer, { initializeGame, setDealer, dealCards, setTrumpSuit, selectCard, exchangeCards, addWager, playCard, selectPlayerWhoShouldExchangeCards } from '../gameSlice';
import { RootState } from '../store';
import { Card, Player } from '../../Types';
import { waitFor } from '@testing-library/react';
import exp from 'constants';

describe('game reducer', () => {
  let store: Store<RootState>;

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
    expect(state.deck.length).toEqual(40); // assuming a standard deck
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

    it('should handle dealing cards', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        store.dispatch(setDealer(1));
        store.dispatch(dealCards());
        const state = store.getState().game;
        expect(state.deck.length).toEqual(30);
        state.players.forEach(player => {
            expect(player.hand.length).toEqual(2);
        })
        expect(state.rounds[state.currentRound].roundState).toEqual('2Cards');
    })

    it('should handle dealing cards when there are already 2 cards dealt', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        store.dispatch(setDealer(1));
        store.dispatch(dealCards());
        store.dispatch(dealCards());
        const state = store.getState().game;
        expect(state.deck.length).toEqual(20);
        state.players.forEach(player => {
            expect(player.hand.length).toEqual(4);
        })
        expect(state.rounds[state.currentRound].roundState).toEqual('4Cards');
    })

    it('should handle setting the trump suit', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        store.dispatch(setDealer(1));
        store.dispatch(dealCards());
        store.dispatch(dealCards());
        store.dispatch(setTrumpSuit());
        const state = store.getState().game;
        expect(state.deck.length).toEqual(19);
        expect(state.rounds[state.currentRound].trumpSuit).toBeDefined();
    })

    it('should handle selecting a card', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        store.dispatch(setDealer(1));
        store.dispatch(dealCards());
        store.dispatch(dealCards());
        const state = store.getState().game;
        const player = state.players[0];
        const card = player.hand[0];
        store.dispatch(selectCard({ card }));
        const newState = store.getState().game;
        const newCard = newState.players[0].hand.find(c => c.id === card.id);
        expect(newCard?.isSelected).toEqual(true);
    })

    it('should handle exchanging cards', async () => {    
        store.dispatch(initializeGame(numberOfPlayers));
        let state = store.getState().game;
        
        store.dispatch(setDealer(1));
        state = store.getState().game;
    
        store.dispatch(dealCards());
        state = store.getState().game;
    
        store.dispatch(dealCards());
        state = store.getState().game;
    
        let player = state.players[0];
        let card = player.hand[0];
        
        store.dispatch(selectCard({ card }));
        state = store.getState().game;
        player = state.players[0];
        card = player.hand.find(c => c.id === card.id) as Card; // Add type assertion
        expect(card?.isSelected).toEqual(true);
        
        store.dispatch(exchangeCards(player));
        state = store.getState().game;
        player = state.players[0];
        card = player.hand.find(c => c.id === card.id) as Card; // Add type assertion
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

    it('should start a round and exchange 3 players cards and check who is next to exchange cards', () => {
        store.dispatch(initializeGame(numberOfPlayers));
        let state = store.getState().game;
        store.dispatch(setDealer(1));
        state = store.getState().game;
        store.dispatch(dealCards());
        state = store.getState().game;
        store.dispatch(dealCards());
        state = store.getState().game;
        store.dispatch(setTrumpSuit());
        state = store.getState().game;
        const dealer = state.players[1];
        const exchanger = selectPlayerWhoShouldExchangeCards(store.getState());
        expect(exchanger).toBeDefined();
        expect(exchanger?.id).toEqual(dealer.id);
        store.dispatch(exchangeCards(dealer));

        const exchanger2 = selectPlayerWhoShouldExchangeCards(store.getState());
        expect(exchanger2).toBeDefined();
        expect(exchanger2?.id).toEqual(state.players[2].id);

       
    })

    it('should play the first card in a round', async() => {
        store.dispatch(initializeGame(numberOfPlayers));
        let state = store.getState().game;
        store.dispatch(setDealer(1));
        state = store.getState().game;
        store.dispatch(dealCards());
        state = store.getState().game;
        store.dispatch(dealCards());
        state = store.getState().game;
        store.dispatch(setTrumpSuit());
        state = store.getState().game;
        const player = state.players[0];
        const card = player.hand[0];
        store.dispatch(selectCard({ card }));
        state = store.getState().game;
        await waitFor(() => {
            for (let i = 0; i < state.numberOfPlayers; i++) {
                const player = state.players[i];
                store.dispatch(exchangeCards(player));
            }
        }
        )
        store.dispatch(playCard({ player: state.players[0], card: state.players[1].hand[0] }));
        state = store.getState().game;
        expect(state.rounds[state.currentRound].turns.length).toEqual(1);
    })

    it('should play all the cards (5 cards equal to number of players) in a round and announce the winner', async () => {
        store.dispatch(initializeGame(numberOfPlayers));
        let state = store.getState().game;
        store.dispatch(setDealer(1));
        state = store.getState().game;
        store.dispatch(dealCards());
        state = store.getState().game;
        store.dispatch(dealCards());
        state = store.getState().game;
        store.dispatch(setTrumpSuit());
        state = store.getState().game;
        const player = state.players[0];
        const card = player.hand[0];
        store.dispatch(selectCard({ card }));
        state = store.getState().game;
        await waitFor(() => {
            for (let i = 0; i < state.numberOfPlayers; i++) {
                const player = state.players[i];
                store.dispatch(exchangeCards(player));
            }
        }
        )
        await waitFor(() => {
            for (let i = 0; i < state.numberOfPlayers; i++) {
                const player = state.players[i % state.players.length];
                store.dispatch(playCard({ player: player, card: player.hand[0] }));
            }
            state = store.getState().game;
            expect(state.rounds[state.currentRound].turns[0].cardsPlayed.length).toEqual(5);
        })
        
        // Wait for the winner to be set
        await waitFor(() => {
            state = store.getState().game;
            expect(state.rounds[state.currentRound].roundWinner).toBeDefined();
        })
        

    })
})


