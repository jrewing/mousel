import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Card,
  Player,
  Suit,
  Game,
  SuitSymbol,
  Value,
  Round,
  Turn,
} from "../Types";

// Step 1: Define the initial state
const initialState: Game = {
  players: [],
  deck: [],
  discardedCards: [],
  currentRound: 0,
  currentTurn: undefined,
  numberOfPlayers: 0,
  rounds: [],
  initialized: false,
  canFlipTrump: false,
};

const initialRoundState: Round = {
  roundNumber: 0,
  roundPot: 0,
  dealer: undefined,
  playersInRound: [],
  hiddenTrumpSuit: false,
  firstTwoCards: false,
  secondTwoCards: false,
  roundState: "Initial",
  initialized: false,
  trumpSuit: undefined,
  turns: [],
  trumpForSale: true,
  dealerTookTrump: false,
  playerTookTrump: undefined,
};

const createPlayers = (numberOfPlayers: number) => {
  const players = [] as Player[];
  for (let i = 0; i < numberOfPlayers; i++) {
    const player = {
      id: i,
      name: `Player ${i}`,
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
      hasFlippedTrump: false,
      hasRefusedToFlipTrump: false,
      hasTakenTrump: false,
      hasTakenTrumpEarly: false,
      hasRefusedTrump: false,
      hasRefusedTrumpEarly: false,
      isIn: false,
    } as Player;
    players.push(player);
  }
  return players;
};
const createDeck = () => {
  const suits: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const suitsSymbols: SuitSymbol[] = ["♥", "♦", "♣", "♠"];
  const names: Value[] = [
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "Jack",
    "Queen",
    "King",
    "Ace",
  ];

  const newDeck: Card[] = [];
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < names.length; j++) {
      newDeck.push({
        id: i * names.length + j,
        suit: suits[i],
        name: names[j],
        suitSymbol: suitsSymbols[i],
        color:
          suits[i] === "Hearts" || suits[i] === "Diamonds" ? "Red" : "Black",
        isSelected: false,
        isPlayed: false,
        isDiscarded: false,
        isDealt: false,
        isFresh: true,
        isTrump: false,
        value: j + 5,
      });
    }
  }
  return newDeck;
};

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

export function compareCardValues(card1: Card, card2: Card) {
  if (card1.value === card2.value) {
    return false;
  }
  return card1.value > card2.value;
}

export function calculateWinner(
  trumpSuit: Suit,
  currentTurn: Turn,
  deck: Card[],
) {
  if (currentTurn.cardsPlayed === undefined) {
    console.error("currentTurn.cardsPlayed is undefined");
    return;
  }

  //Find winner. Winning card is the highest card of the suit led or the highest trump card
  const winner = currentTurn.cardsPlayed.reduce((prev, current) => {
    const prevCard = deck.find((card) => card.id === prev.cardId);
    const currentCard = deck.find((card) => card.id === current.cardId);

    if (prevCard && currentCard) {
      // Check if both cards are trumps
      if (prevCard.suit === trumpSuit && currentCard.suit === trumpSuit) {
        // Compare the values of the trump cards
        return prevCard.value > currentCard.value ? prev : current;
      }

      // Check if the current card is a trump and the previous card is not
      if (currentCard.suit === trumpSuit && prevCard.suit !== trumpSuit) {
        return current;
      }

      // Check if the previous card is a trump and the current card is not
      if (prevCard.suit === trumpSuit && currentCard.suit !== trumpSuit) {
        return prev;
      }

      // If both cards are of the suit led, compare their values
      if (
        prevCard.suit === currentTurn.suit &&
        currentCard.suit === currentTurn.suit
      ) {
        return prevCard.value > currentCard.value ? prev : current;
      }
    }
    return prev;
  }, currentTurn.cardsPlayed[0]);

  return winner;
}

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    initializeGame(state: Game, action: PayloadAction<number>) {
      const { payload: numberOfPlayers } = action;
      if (numberOfPlayers < 2) {
        throw new Error(
          "A minimum of two players is required to start the game.",
        );
      }
      state.numberOfPlayers = numberOfPlayers;
      state.players = createPlayers(numberOfPlayers);
      state.deck = shuffleDeck(createDeck());
      state.currentRound = 0;
      state.rounds = [initialRoundState];
      state.initialized = true;
    },
    setGameCanFlipTrump(state, action: PayloadAction<boolean>) {
      state.canFlipTrump = action.payload;
    },
    newRound(state, action: PayloadAction<{ pot: number }>) {
      state.currentRound++;
      const newRoundState = {
        ...initialRoundState,
        roundNumber: state.currentRound,
      };
      //Reset player hands, player tricks, player hasFolded, player hasExchangedCards, player isDealer, player isSmallBlind, declarer
      state.players = state.players.map((player) => {
        return {
          ...player,
          hand: [],
          tricks: 0,
          hasFolded: false,
          hasExchangedCards: false,
          isDealer: false,
          isSmallBlind: false,
          isDeclarer: false,
        };
      });
      state.rounds.push(newRoundState);
      state.deck = shuffleDeck(createDeck());
    },
    setDealer(state, action: PayloadAction<number>) {
      //remove current dealer
      const currentDealer = state.players.find((player) => player.isDealer);
      if (currentDealer) {
        currentDealer.isDealer = false;
      }
      const player = state.players.find(
        (player) => player.id === action.payload,
      );
      if (player) {
        player.isDealer = true;
        state.rounds[state.currentRound].dealer = action.payload;
      }
    },
    dealCards(state) {
      //if roundState is Initial or 0Cards, but all players except dealer have not set small blind. Issue warning and return
      if (
        state.currentRound === 0 &&
        (state.rounds[state.currentRound].roundState === "Initial" ||
          state.rounds[state.currentRound].roundState === "0Cards")
      ) {
        if (
          state.players
            .filter((player) => !player.isDealer)
            .every((player) => player.isSmallBlind) === false
        ) {
          console.warn(
            "DealCards: All players have not set small blind. Can´t deal cards",
          );
          return;
        }
      }
      //If roundState is 2Cards, but trumpsuit is not set, issue warning and return
      if (
        state.rounds[state.currentRound].roundState === "2Cards" &&
        state.rounds[state.currentRound].trumpSuit === undefined
      ) {
        console.warn(
          "DealCards: Can not deal next two cards until trump suit is set.",
        );
        return;
      }

      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < state.players.length; j++) {
          //Find the first card in the deck not dealt or discarded or played
          const card = state.deck.find((card) => card.isFresh);
          if (card) {
            state.players[j].hand.push(card.id);
            card.isDealt = true;
            card.isFresh = false;
          }
        }
      }
      if (
        state.rounds[state.currentRound].roundState === "Initial" ||
        state.rounds[state.currentRound].roundState === "0Cards"
      ) {
        state.rounds[state.currentRound].roundState = "2Cards";
      } else if (state.rounds[state.currentRound].roundState === "2Cards") {
        state.rounds[state.currentRound].roundState = "4Cards";
      }
    },
    setTrumpSuit(state, action: PayloadAction<{ hidden: boolean }>) {
      //If roundState is 2Cards, set trump suit to the first card in the deck else issue warning and return
      if (state.rounds[state.currentRound].roundState !== "2Cards") {
        console.warn(
          "SetTrumpSuit: Can not set trump suit if roundState is not 2Cards",
        );
        return;
      }
      //If trump suit is already set, issue warning and return
      if (state.rounds[state.currentRound].trumpSuit !== undefined) {
        console.warn("SetTrumpSuit: Trump suit is already set");
        return;
      }
      const firstFreshCardIndex = state.deck.findIndex(
        (card) => !card.isDiscarded && !card.isPlayed && !card.isDealt,
      );
      state.rounds[state.currentRound].trumpSuit =
        state.deck[firstFreshCardIndex];
      state.deck[firstFreshCardIndex].isTrump = true;
      state.deck[firstFreshCardIndex].isFresh = false;
      // If hidden is not provided in the payload, default to false
      state.rounds[state.currentRound].hiddenTrumpSuit = action.payload?.hidden;
    },
    toggleSelectCard(state, action: PayloadAction<number>) {
      //Can only select card if roundState is 4Cards and player has not changed cards or folded
      const cardIndex = state.deck.findIndex(
        (card) => card.id === action.payload,
      );
      const player = state.players.find(
        (player) => player.hand.find((c) => c === action.payload) !== undefined,
      );
      if (
        state.deck[cardIndex] &&
        player &&
        !player.hasExchangedCards &&
        !player.hasFolded &&
        player.isIn
      ) {
        state.deck[cardIndex].isSelected = !state.deck[cardIndex].isSelected;
      } else {
        console.warn(
          "Can not select card. Player has exchanged cards or has folded or card not found",
        );
      }
    },
    exchangeCards(state, action: PayloadAction<Player>) {
      //players can only exchange cards if roundstate is 4Cards and player has not folded or has exchanged cards
      if (state.rounds[state.currentRound].roundState !== "4Cards") {
        console.warn("Roundstate is not 4Cards. Cant exchange cards");
        return;
      }

      const player = action.payload;
      if (player.hasFolded || !player.isIn) {
        console.warn("Player has folded or is not in. Cant exchange cards");
        return;
      }

      const playerTookTrump = state.players.find(
        (player) => player.hasTakenTrump,
      );
      if (playerTookTrump === undefined) {
        console.warn("no player took trump.  Cant exchange cards");
        return;
      }

      const newHand = player.hand.map((cardId) => {
        const playerCard = state.deck.find((c) => c.id === cardId);
        if (playerCard?.isSelected) {
          playerCard.isSelected = false;
          playerCard.isDiscarded = true;
          playerCard.isFresh = false;
          const drawnCard = state.deck.find((card) => card.isFresh);
          if (drawnCard) {
            drawnCard.isDealt = true;
            drawnCard.isFresh = false;
            return drawnCard.id;
          }
          return cardId;
        }
        return cardId;
      });

      // Find the index of the player in the state
      const playerIndex = state.players.findIndex((p) => p.id === player.id);

      // Replace the player with a new object, with the updated hand
      if (playerIndex !== -1) {
        state.players[playerIndex] = {
          ...player,
          hand: newHand,
          hasExchangedCards: true,
        };
      }

      //If all players who is in and not folded have exchanged cards, set roundState to Showdown
      if (
        state.players
          .filter((p) => p.isIn && !p.hasFolded)
          .every((player) => player.hasExchangedCards) &&
        playerTookTrump !== undefined
      ) {
        state.rounds[state.currentRound].roundState = "Showdown";
        //Set hidde trump suit to false
        state.rounds[state.currentRound].hiddenTrumpSuit = false;
        //Reload the player who took trump because it seems playerTookTrump is outdated
        const playerTookTrump = state.players.find(
          (player) => player.hasTakenTrump,
        );
        const turn = {
          startingPlayer: playerTookTrump?.id,
          currentPlayer: playerTookTrump?.id,
          nextPlayer: playerTookTrump?.id,
          winner: undefined,
          cardsPlayed: [],
          turnNumber: 1,
          suit: undefined,
        };
        state.rounds[state.currentRound].turns.push(turn);
      }
    },
    addWager(state, action: PayloadAction<{ player: Player; amount: number }>) {
      const { player, amount } = action.payload;
      const playerIndex = state.players.findIndex((p) => p.id === player.id);

      // Replace the player with a new object, with the updated bank
      if (playerIndex !== -1) {
        //TODO: Check if player has enough money to add wager and rethink isSmallBlind? And add automatic wager after round ends
        state.players[playerIndex] = {
          ...player,
          bank: player.bank - amount,
          isSmallBlind: true,
        };
      }

      state.rounds[state.currentRound].roundPot += amount;
    },
    takeTrumpEarly(state, action: PayloadAction<number>) {
      const player = state.players.find(
        (player) => player.id === action.payload,
      );
      if (player === undefined) {
        console.warn("Player not found");
        return;
      }
      //Can only take trump early if roundstate is 2Cards and player has not taken trump early and player has not folded and player is dealer
      if (state.rounds[state.currentRound].roundState !== "2Cards") {
        console.warn("Roundstate is not 2Cards. Cant take trump early");
        return;
      }

      if (player.hasTakenTrumpEarly) {
        console.warn("Player has already taken trump early");
        return;
      }

      if (player.hasFolded) {
        console.warn("Player has folded. Cant take trump early");
        return;
      }

      if (!player.isDealer) {
        console.warn("Player is not dealer. Cant take trump early");
        return;
      }

      state.rounds[state.currentRound].trumpForSale = false;
      state.rounds[state.currentRound].dealerTookTrump = true;
      state.players = state.players.map((player) => {
        if (
          player.id === action.payload &&
          state.rounds[state.currentRound].trumpSuit !== undefined
        ) {
          //add trump card to player hand
          const trumpCard = state.rounds[state.currentRound].trumpSuit;
          if (trumpCard) {
            player.hand.push(trumpCard.id);
            player.hasTakenTrumpEarly = true;
            player.hasTakenTrump = true;
            player.isIn = true;
          }
        }
        return player;
      });
    },
    takeTrump(state, action: PayloadAction<number>) {
      //Can only take trump if roundstate is 4Cards and player has not taken trump and player has not folded
      if (state.rounds[state.currentRound].roundState !== "4Cards") {
        console.warn("Roundstate is not 4Cards. Cant take trump");
        return;
      }
      if (state.rounds[state.currentRound].trumpSuit === undefined) {
        console.warn("Trump suit is not set. Cant take trump");
        return;
      }

      if (state.rounds[state.currentRound].trumpForSale === false) {
        console.warn("Trump is not for sale. Cant take trump");
        return;
      }

      const player = state.players.find(
        (player) => player.id === action.payload,
      );
      if (player?.hasTakenTrump) {
        console.warn("Player has already taken trump");
        return;
      }

      if (player?.hasFolded) {
        console.warn("Player has folded. Cant take trump");
        return;
      }

      state.rounds[state.currentRound].trumpForSale = false;
      state.rounds[state.currentRound].playerTookTrump = action.payload;
      state.players = state.players.map((player) => {
        if (
          player.id === action.payload &&
          state.rounds[state.currentRound].trumpSuit !== undefined
        ) {
          player.hasTakenTrump = true;
          player.isIn = true;
        }
        return player;
      });
      //When a player takes the trump, that player is the starting player
    },
    refuseTrump(state, action: PayloadAction<number>) {
      if (state.rounds[state.currentRound].roundState !== "4Cards") {
        console.warn("Roundstate is not 4Cards. Cant take trump");
        return;
      }
      if (state.rounds[state.currentRound].trumpSuit === undefined) {
        console.warn("Trump suit is not set. Cant take trump");
        return;
      }

      if (state.rounds[state.currentRound].trumpForSale === false) {
        console.warn("Trump is not for sale. Cant take trump");
        return;
      }

      const player = state.players.find(
        (player) => player.id === action.payload,
      );
      if (player?.hasTakenTrump) {
        console.warn("Player has already taken trump");
        return;
      }

      if (player?.hasFolded) {
        console.warn("Player has folded. Cant take trump");
        return;
      }

      state.players = state.players.map((player) => {
        if (player.id === action.payload) {
          player.hasRefusedTrump = true;
        }
        return player;
      });
    },
    refuseToFlipTrump(state, action: PayloadAction<number>) {
      if (state.rounds[state.currentRound].roundState !== "4Cards") {
        console.warn("Roundstate is not 4Cards. Cant flip trump");
        return;
      }
      if (state.rounds[state.currentRound].trumpSuit === undefined) {
        console.warn("Trump suit is not set. Cant flip trump");
        return;
      }

      if (state.rounds[state.currentRound].trumpForSale === true) {
        console.warn("Trump is for sale. Cant flip trump");
        return;
      }

      const player = state.players.find(
        (player) => player.id === action.payload,
      );
      if (player?.hasFlippedTrump) {
        console.warn("Player has already taken trump");
        return;
      }

      if (player?.hasRefusedToFlipTrump) {
        console.warn("Player has already refused to flip trump");
        return;
      }

      if (player?.hasFolded) {
        console.warn("Player has folded. Cant take trump");
        return;
      }

      state.players = state.players.map((player) => {
        if (player.id === action.payload) {
          player.hasRefusedToFlipTrump = true;
        }
        return player;
      });
    },
    flipTrump(state, action: PayloadAction<number>) {
      if (state.rounds[state.currentRound].roundState !== "4Cards") {
        console.warn("Roundstate is not 4Cards. Cant flip trump");
        return;
      }
      if (state.rounds[state.currentRound].trumpSuit === undefined) {
        console.warn("Trump suit is not set. Cant flip trump");
        return;
      }

      if (state.rounds[state.currentRound].trumpForSale === true) {
        console.warn("Trump is for sale. Cant flip trump");
        return;
      }

      const player = state.players.find(
        (player) => player.id === action.payload,
      );
      if (player?.hasFlippedTrump) {
        console.warn("Player has already flipped trump");
        return;
      }

      if (player?.hasRefusedToFlipTrump) {
        console.warn("Player has refused to flip trump");
        return;
      }

      if (player?.hasFolded) {
        console.warn("Player has folded. Cant take trump");
        return;
      }

      state.players = state.players.map((player) => {
        if (player.id === action.payload) {
          player.hasFlippedTrump = true;
        }
        return player;
      });
    },
    playerFolds(state, action: PayloadAction<number>) {
      state.players = state.players.map((player) => {
        if (player.id === action.payload) {
          player.hasFolded = true;
          player.isIn = false;

          //set all cards in hand to isDiscarded
          player.hand.forEach((cardId) => {
            const card = state.deck.find((c) => c.id === cardId);
            if (card) {
              card.isDiscarded = true;
            }
          });
        }
        return player;
      });
      //If only one player is left in the game, set winner to that player
      //only 1 player isIn and the rest has folded
      if (
        state.players.filter((player) => player.isIn).length === 1 &&
        state.players.filter((player) => player.hasFolded).length ===
          state.players.length - 1
      ) {
        //set winner to the player who is still in, same as player who took trump
        const winner = state.players.find((player) => player.isIn);
        if (winner) {
          winner.tricks = 4;
          state.rounds[state.currentRound].roundState = "GameOver";
        }
      }
    },
    playerIsIn(state, action: PayloadAction<number>) {
      state.players = state.players.map((player) => {
        if (player.id === action.payload) {
          player.isIn = true;
          player.hasFolded = false;
        }
        return player;
      });
    },
    discardCard(state, action: PayloadAction<number>) {
      const card = state.deck.find((card) => card.id === action.payload);
      const player = state.players.find((player) =>
        player.hand.find((c) => c === card?.id),
      );

      if (card === undefined) {
        console.warn("Card not found");
        return;
      }

      if (player === undefined) {
        console.warn("Player not found");
        return;
      }
      if (player.hasFolded) {
        console.warn("Player has folded. Cant discard card");
        return;
      }
      if (!player.hasExchangedCards) {
        console.warn("Player has not exchanged cards. Cant discard card");
        return;
      }

      if (player.hand.length <= 4) {
        console.warn("Player has less than 4 cards. Cant discard card");
        return;
      }

      player.hand = player.hand.filter((c) => c !== card.id);
      card.isDiscarded = true;
    },
    playCard(
      state,
      action: PayloadAction<{
        cardId: number;
        playerId: number;
        //rectRef: DOMRect;
      }>,
    ) {
      const card = state.deck.find((card) => card.id === action.payload.cardId);
      const player = state.players.find(
        (player) => player.id === action.payload.playerId,
      );
      if (!card || !player) {
        console.warn("Card or player not found. Cant play card");
        return;
      }
      //playersInRound is an array of player
      const playersInRound = state.players.filter(
        (p) => p.isIn && !p.hasFolded,
      );

      const playerIndex = playersInRound.findIndex((p) => p.id === player.id);

      if (card.isPlayed) {
        console.warn("Card is already played. Cant play card");
        return;
      }

      if (playerIndex === -1) {
        console.warn("Player not found or has folded. Cant play card");
        return;
      }

      const currentRound = state.rounds[state.currentRound];
      const currentTurn = currentRound.turns.at(-1);

      if (!currentTurn) {
        //I think this is an error state
        console.warn("no current turn");
        return;
      }

      //Trump suit must have been set and a player must have taken trump before cards can be played
      if (currentRound.trumpSuit === undefined) {
        console.warn("Trump suit is not set. Cant play card");
        return;
      }

      if (
        currentRound.trumpSuit !== undefined &&
        !state.players.some((player) => player.hasTakenTrump)
      ) {
        console.warn("No player has taken trump. Cant play card");
        return;
      }

      //A card can only be played if state is "Showdown" and all players have exchanged cards
      if (
        currentRound.roundState !== "Showdown" ||
        !playersInRound.every((player) => player.hasExchangedCards)
      ) {
        console.warn(
          "round state not showdown or players have not exchanged cards. Cant play card",
        );
        return;
      }
      if (
        currentTurn &&
        currentTurn?.cardsPlayed.length > playersInRound.length
      ) {
        console.warn("too many cards played");
        //Error state too many cards played
        return;
      }

      state.deck = state.deck.map((c) => {
        if (c.id === card.id) {
          return { ...c, isPlayed: true };
        }
        return c;
      });

      if (
        currentTurn &&
        currentTurn?.cardsPlayed.length < playersInRound.length
      ) {
        if (currentTurn.cardsPlayed.length === 0) {
          if (state.rounds.at(-1) && state.rounds.at(-1)!.turns.at(-1)) {
            state.rounds.at(-1)!.turns.at(-1)!.suit = card.suit;
          }
        }
        currentTurn.cardsPlayed.push({
          cardId: card.id,
          playerId: player.id,
          sequence: currentTurn.cardsPlayed.length + 1,
          //rectRef: action.payload.rectRef,
        });
        /*
        //Sort cards played by value and suit. If suit is the same, sort by value. Highest value first. Trump suit first, then suit led
        currentTurn.cardsPlayed.sort((a, b) => {
          const cardA = state.deck.find((c) => c.id === a.cardId);
          const cardB = state.deck.find((c) => c.id === b.cardId);
          if (cardA && cardB) {
            if (cardA.suit === currentRound.trumpSuit?.suit) {
              if (cardB.suit === currentRound.trumpSuit.suit) {
                return cardB.value - cardA.value;
              }
              return -1;
            }
            if (cardB.suit === currentRound.trumpSuit?.suit) {
              return 1;
            }
            if (cardA.suit === currentTurn.suit) {
              if (cardB.suit === currentTurn.suit) {
                return cardB.value - cardA.value;
              }
              return -1;
            }
            if (cardB.suit === currentTurn.suit) {
              return 1;
            }
            return cardB.value - cardA.value;
          }
          return 0;
        });
*/
        //Set next player. Next player is the player after the current player in the playersInRound array which has not folded
        currentTurn.nextPlayer =
          playersInRound[(playerIndex + 1) % playersInRound.length].id;
      }

      //if all players who are in and not folded have played a card, end turn
      if (
        currentTurn &&
        currentTurn.cardsPlayed &&
        currentTurn?.cardsPlayed?.length >= playersInRound.length
      ) {
        const winner = calculateWinner(
          currentRound.trumpSuit.suit,
          currentTurn,
          state.deck,
        );
        //Add trick to winner
        const winnerIndex = state.players.findIndex(
          (p) => p.id === winner?.playerId,
        );
        if (winnerIndex !== -1) {
          state.players[winnerIndex].tricks++;
          //set winner on turn
          const currentTurn = state.rounds[state.currentRound].turns.at(-1);
          if (currentTurn && winner) {
            currentTurn.winner = winner.playerId;
          }
        }
        //there are only 4 turns in a round
        if (currentRound.turns.length < 4 && winner) {
          //After winner is found, start new turn
          currentRound.turns.push({
            nextPlayer: winner.playerId,
            winner: undefined,
            cardsPlayed: [],
            suit: undefined,
          });
        } else if (winner) {
          //Check if Game is over. Game is over if player who took trump has at least 2 tricks and all other players in round have at least 1 tricks
          const playerWhoTookTrump = state.players.find(
            (player) => player.hasTakenTrump,
          );
          const isGameOver =
            (playerWhoTookTrump?.tricks ?? 0) >= 2 &&
            playersInRound.every((player) => player.tricks >= 1);
          if (isGameOver) {
            state.rounds[state.currentRound].roundState = "GameOver";
          } else {
            state.rounds[state.currentRound].roundState = "RoundOver";
          }
        } else {
          console.warn("Round over but no winner found");
        }
      }
    },
    endRound(state) {
      const currentRound = state.rounds[state.currentRound];
      const isGameOver = currentRound.roundState === "GameOver";
      if (currentRound.roundState === "RoundOver" || isGameOver) {
        //End round
        let newRoundPot = 0;
        //Calculate points and add to winner
        // if player who took trump got less than 2 tricks, the player must add the amount of the round pot (times 2 if 0 tricks) to the new round pot
        const playerWhoTookTrump = state.players.find(
          (player) => player.hasTakenTrump,
        );
        if (playerWhoTookTrump && playerWhoTookTrump.tricks < 2) {
          newRoundPot +=
            (2 - playerWhoTookTrump.tricks) *
            (state.rounds.at(-1)?.roundPot ?? 0);
          playerWhoTookTrump.bank -=
            (2 - playerWhoTookTrump.tricks) *
            (state.rounds.at(-1)?.roundPot ?? 0);
        }
        //all other players who did not fold and got 0 tricks must add the amount of the round pot to the new round pot
        state.players
          .filter(
            (player) =>
              player.tricks === 0 &&
              player.id !== playerWhoTookTrump?.id &&
              !player.hasFolded,
          )
          .forEach((player) => {
            newRoundPot += state.rounds.at(-1)?.roundPot ?? 0;
            player.bank -= state.rounds.at(-1)?.roundPot ?? 0;
          });

        const newRound: Round = {
          roundNumber: isGameOver ? 0 : currentRound.roundNumber + 1,
          roundPot: isGameOver ? 0 : newRoundPot,
          //dealer is next id in players array after current dealer:
          dealer:
            state.players[
              (state.players.findIndex((p) => p.isDealer) + 1) %
                state.players.length
            ].id,
          playersInRound: state.rounds[state.currentRound].playersInRound,
          hiddenTrumpSuit: false,
          firstTwoCards: false,
          secondTwoCards: false,
          roundState: "Initial",
          initialized: false,
          trumpSuit: undefined,
          turns: [],
          trumpForSale: true,
          dealerTookTrump: false,
          playerTookTrump: undefined,
        };
        state.players.forEach((player) => {
          player.bank +=
            (state.rounds[state.currentRound].roundPot / 4) * player.tricks;
          player.hand = [];
          player.tricks = 0;
          player.hasFolded = false;
          player.isDealer = false;
          player.isSmallBlind = false;
          player.hasExchangedCards = false;
          player.isDeclarer = false;
          player.hasTakenTrump = false;
          player.hasTakenTrumpEarly = false;
          player.hasRefusedTrump = false;
          player.isIn = false;
        });
        if (isGameOver) {
          state.rounds = [];
        }
        //Add new round to rounds
        state.rounds.push(newRound);
        state.currentRound = isGameOver ? 0 : state.currentRound + 1;
        const newCurrentRound = state.rounds[state.currentRound];
        state.deck = shuffleDeck(createDeck());
        newCurrentRound.initialized = true;
      }
    },
  },
});

export const {
  setDealer,
  setTrumpSuit,
  initializeGame,
  dealCards,
  toggleSelectCard,
  newRound,
  exchangeCards,
  addWager,
  playCard,
  takeTrump,
  takeTrumpEarly,
  refuseTrump,
  playerFolds,
  playerIsIn,
  discardCard,
  endRound,
  flipTrump,
  refuseToFlipTrump,
  setGameCanFlipTrump,
} = gameSlice.actions;

export const selectGame = (state: { game: Game }) => state.game;
export const selectPlayers = (state: { game: Game }) => state.game.players;
export const selectPlayer = (state: { game: Game }, playerId: number) => {
  return state.game.players.find((player) => player.id === playerId);
};
export const selectDeck = (state: { game: Game }) => state.game.deck;
export const selectDiscardedCards = (state: { game: Game }) =>
  state.game.discardedCards;
export const selectCard = (state: { game: Game }, cardId: number) => {
  return state.game.deck.find((card) => card.id === cardId);
};
export const isCardSelectable = (state: { game: Game }, cardId: number) => {
  const cardIndex = state.game.deck.findIndex((card) => card.id === cardId);
  const player = state.game.players.find(
    (player) => player.hand.find((c) => c === cardId) !== undefined,
  );
  if (
    state.game.deck[cardIndex] &&
    player &&
    !player.hasExchangedCards &&
    !player.hasFolded &&
    player.isIn
  ) {
    return true;
  } else {
    //console.warn("Can not select card. Player has exchanged cards or has folded or card not found");
    return false;
  }
};
export const gameInitialized = (state: { game: Game }) =>
  state.game.initialized;
export const roundInitialized = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].initialized;
export const selectTrumpSuit = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].trumpSuit;
export const selectTrumpSuitHidden = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].hiddenTrumpSuit;
export const selectRound = (state: { game: Game }) => state.game.rounds.at(-1);
export const selectDealer = (state: { game: Game }) =>
  state.game.players.find((player) => player.isDealer);
export const selectCurrentTurnNumber = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].turns.length;
export const selectRoundPot = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].roundPot;
export const selectTrumpForSale = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].trumpForSale;
export const selectDealerTookTrump = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].dealerTookTrump;
export const selectPlayerTookTrump = (state: { game: Game }) =>
  state.game.rounds[state.game.currentRound].playerTookTrump;
export const selectCurrentTurn = (state: { game: Game }) => {
  const currentRound = state.game.rounds[state.game.currentRound];
  return currentRound.turns.at(-1);
};
export const isPlayersTurn = (state: { game: Game }, playerId: number) => {
  const currentRound = state.game.rounds[state.game.currentRound];
  const currentTurn = currentRound.turns.at(-1);

  if (!currentTurn) {
    return false;
  }
  return currentTurn.nextPlayer === playerId;
};
export const isCardPlayable = (state: { game: Game }, cardId: number) => {
  const currentRound = state.game.rounds[state.game.currentRound];
  //Current turn might be empty if not all players have exchanged cards
  const currentTurn = currentRound.turns.at(-1);
  if (!currentTurn) {
    //console.warn("No current turn");
    return false;
  }
  const nextPlayer = state.game.players.find(
    (player) => player.id === currentTurn?.nextPlayer,
  );
  const card = state.game.deck.find((card) => card.id === cardId);

  if (!card) {
    console.warn("Card not found");
    return false;
  }

  //Find card in next players hand
  const cardInHand = nextPlayer?.hand.find((c) => c === cardId);
  if (cardInHand === undefined) {
    return false;
  }

  if (card?.isPlayed) {
    return false;
  }

  if (nextPlayer?.hasFolded) {
    return false;
  }

  //Card can be played if it is the players turn. The card should follow the suit led if the player has a card of the suit led. If the player does not have a card of the suit led, the player can play any card. But must try to win the trick if possible. For example, if the player has a trump card, the player cant play other cards if the trump is higher than other trumps played.
  if (nextPlayer?.hand.some((c) => c === cardId)) {
    if (currentTurn.cardsPlayed.length === 0) {
      return true;
    }
    const suitLed = currentTurn.suit;

    const hasCardOfSuitLed = nextPlayer.hand.some((cardinHandId) => {
      const card = state.game.deck.find((card) => card.id === cardinHandId);
      if (card && card.suit === suitLed && !card.isPlayed) {
        return true;
      }
      return false;
    });

    if (hasCardOfSuitLed && card?.suit !== suitLed) {
      return false;
    }
    if (hasCardOfSuitLed && card?.suit === suitLed) {
      return true;
    }
    if (hasCardOfSuitLed === false) {
      return true;
    }
  }
  //console log the players hand
  console.log("Player hand", nextPlayer?.hand, cardId);
  console.warn("Card is not in players hand");
  return false;
};
export const selectPlayerWhoShouldExchangeCards = (state: { game: Game }) => {
  //A player can only exchange cards if roundstate is 4Cards and all players have either folded or isIn
  if (state.game.rounds[state.game.currentRound].roundState !== "4Cards") {
    //console.warn("Roundstate is not 4Cards. Cant exchange cards");
    return;
  }

  if (!state.game.players.every((player) => player.hasFolded || player.isIn)) {
    console.warn("Not all players have folded or isIn. Cant exchange cards");
    return;
  }

  //the first player to exchange cards is the player who took the trump
  const playerTookTrump = state.game.players.find(
    (player) => player.hasTakenTrump,
  ) as Player | undefined;

  if (playerTookTrump && !playerTookTrump.hasExchangedCards) {
    console.warn("Player who took trump has not exchanged cards");
    return playerTookTrump;
  }

  //if no player has taken trump, return undefined
  if (playerTookTrump === undefined) {
    console.warn("No player has taken trump");
    return;
  }

  const numberOfPlayers = state.game.numberOfPlayers;
  for (let i = 0; i < numberOfPlayers; i++) {
    const index = (playerTookTrump.id + i) % numberOfPlayers;
    const player = state.game.players.find((player) => player.id === index);
    if (
      player?.hasExchangedCards === false &&
      player.hand.length === 4 &&
      !player.hasFolded &&
      player.isIn
    ) {
      return player;
    }
  }
  console.warn("No player found who should exchange cards");
};
export function selectPlayerWhoCanFlipTrump(state: { game: Game }) {
  //Find the next player who can flip the trump. No player can have taken trump. Game state must be in 4Cards, All players must have refused trump
  //Next player has not refused to flip trump or has not flipped trump. No player can hanve flipped trump
  if (state.game.rounds[state.game.currentRound].roundState !== "4Cards") {
    return;
  }
  if (!state.game.players.every((player) => player.hasRefusedTrump)) {
    return;
  }
  const numberOfPlayers = state.game.numberOfPlayers;
  const playerWhoTookTrump = state.game.players.find(
    (player) => player.hasTakenTrump,
  );
  if (playerWhoTookTrump) {
    return;
  }
  //Start from the player next to the dealer (isDealer === true) or the first who has not refused to flip trump
  const dealer = state.game.players.find((player) => player.isDealer);
  if (dealer === undefined) {
    return;
  }
  const startId = (dealer.id + 1) % numberOfPlayers;
  for (let i = 0; i < numberOfPlayers; i++) {
    const index = (startId + i) % numberOfPlayers;
    const player = state.game.players.find((player) => player.id === index);
    if (
      player?.hasFlippedTrump === false &&
      player?.hasRefusedToFlipTrump === false &&
      !player?.hasFolded
    ) {
      return player;
    }
  }
  return;
}
export const selectPlayerWhoCanTakeTrump = (state: { game: Game }) => {
  const dealer = state.game.players.find((player) => player.isDealer);
  if (dealer === undefined) {
    return;
  }

  //if trumpisforsale false, return undefined
  if (state.game.rounds[state.game.currentRound].trumpForSale === false) {
    return;
  }

  if (state.game.players.some((player) => player.hasTakenTrumpEarly)) {
    return;
  }

  if (state.game.players.some((player) => player.hasTakenTrump)) {
    return;
  }
  //if all players have refused trump, return undefined
  if (state.game.players.every((player) => player.hasRefusedTrump)) {
    return;
  }

  const numberOfPlayers = state.game.numberOfPlayers;
  if (
    dealer?.hasTakenTrump === false &&
    dealer?.hasRefusedTrump === false &&
    !dealer?.hasFolded &&
    state.game.rounds[state.game.currentRound].roundState === "2Cards"
  ) {
    return dealer;
  }

  //If roundstate is 4Cards, and dealer has not taken trump, return first player who has not taken trump and not folded
  if (
    state.game.rounds[state.game.currentRound].roundState === "4Cards" &&
    dealer?.hasTakenTrumpEarly === false
  ) {
    const startId = (dealer?.id + 1) % numberOfPlayers; // Start from the player next to the dealer
    for (let i = 0; i < numberOfPlayers; i++) {
      const index = (startId + i) % numberOfPlayers;
      const player = state.game.players.find((player) => player.id === index);
      if (
        player?.hasTakenTrump === false &&
        player?.hasRefusedTrump === false &&
        !player?.hasFolded
      ) {
        return player;
      }
    }
  }
  return;
};

export const selectPlayerWhoCanFoldOrStay = (state: { game: Game }) => {
  const playerWhoTookTrump = state.game.players.find(
    (player) => player.hasTakenTrump,
  );
  if (playerWhoTookTrump === undefined) {
    return;
  }
  if (state.game.rounds[state.game.currentRound].roundState !== "4Cards") {
    return;
  }
  const numberOfPlayers = state.game.numberOfPlayers;
  const playerWhoTookTrumpIndex = state.game.players.findIndex(
    (player) => player.id === playerWhoTookTrump.id,
  );
  for (let i = 0; i < numberOfPlayers; i++) {
    const index = (playerWhoTookTrumpIndex + i) % numberOfPlayers;
    const player = state.game.players[index];
    if (
      player?.hasFolded === false &&
      player?.isIn === false &&
      !player?.hasTakenTrump &&
      !player.hasExchangedCards
    ) {
      return player;
    }
  }
  return;
};

export default gameSlice.reducer;
