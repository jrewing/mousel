import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../state/store";
import {
  selectGame,
  selectRound,
  selectDeck,
  selectTrumpSuit,
  selectPlayerWhoCanTakeTrump,
  selectPlayerWhoCanFoldOrStay,
  selectPlayerWhoShouldExchangeCards,
  selectDealer,
  isPlayersTurn,
  playCard,
  takeTrump,
  takeTrumpEarly,
  refuseTrump,
  playerIsIn,
  playerFolds,
  exchangeCards,
  setTrumpSuit,
  discardCard,
  dealCards,
  addWager,
  toggleSelectCard,
} from "../state/gameSlice";
import {
  decideCardToPlay,
  decideTakeTrump,
  decideStayOrFold,
  decideHideTrump,
  selectCardsToDiscard,
} from "../ai/AIPlayer";

/**
 * Hook to manage AI player actions
 * Automatically triggers AI decisions when it's their turn
 */
export const useAIPlayer = () => {
  const dispatch = useDispatch();
  const game = useSelector(selectGame);
  const round = useSelector(selectRound);
  const deck = useSelector(selectDeck);
  const trumpSuit = useSelector(selectTrumpSuit);
  const dealer = useSelector(selectDealer);
  const playerWhoCanTakeTrump = useSelector(selectPlayerWhoCanTakeTrump);
  const playerWhoCanFoldOrStay = useSelector(selectPlayerWhoCanFoldOrStay);
  const playerWhoShouldExchangeCards = useSelector(
    selectPlayerWhoShouldExchangeCards,
  );

  const processingRef = useRef(false);

  // AI handles posting ante
  useEffect(() => {
    if (processingRef.current) return;

    if (!dealer || round?.roundState !== "Initial") return;

    // Check if any AI player needs to post ante
    for (const player of game.players) {
      if (
        player.isAI &&
        !player.isDealer &&
        !player.isSmallBlind &&
        round.roundPot < game.numberOfPlayers - 1
      ) {
        processingRef.current = true;
        setTimeout(() => {
          dispatch(addWager({ player, amount: 1 }));
          processingRef.current = false;
        }, 500);
        return; // Post one at a time
      }
    }
  }, [
    dealer,
    round?.roundState,
    round?.roundPot,
    game.players,
    game.numberOfPlayers,
    dispatch,
  ]);

  // AI handles dealer setting trump suit
  useEffect(() => {
    if (processingRef.current) return;

    if (
      dealer &&
      dealer.isAI &&
      round?.roundState === "2Cards" &&
      trumpSuit === undefined
    ) {
      processingRef.current = true;
      setTimeout(() => {
        const trumpCard = round.trumpSuit;
        const hideIt = decideHideTrump(dealer, deck, trumpCard || undefined);
        dispatch(setTrumpSuit({ hidden: hideIt }));
        if (hideIt) {
          dispatch(takeTrumpEarly(dealer.id));
        }
        processingRef.current = false;
      }, 800);
    }
  }, [dealer, round?.roundState, trumpSuit, deck, dispatch, round?.trumpSuit]);

  // AI handles dealer dealing cards
  useEffect(() => {
    if (processingRef.current) return;

    const readyToDeal =
      ((round?.roundState === "Initial" || round?.roundState === "0Cards") &&
        dealer !== undefined &&
        round.roundPot >= game.numberOfPlayers - 1) ||
      (round?.roundState === "2Cards" && trumpSuit !== undefined);

    if (dealer && dealer.isAI && readyToDeal) {
      processingRef.current = true;
      setTimeout(() => {
        dispatch(dealCards());
        processingRef.current = false;
      }, 800);
    }
  }, [
    dealer,
    round?.roundState,
    round?.roundPot,
    trumpSuit,
    game.numberOfPlayers,
    dispatch,
  ]);

  // AI handles taking trump
  useEffect(() => {
    if (processingRef.current) return;

    if (!playerWhoCanTakeTrump || !playerWhoCanTakeTrump.isAI) return;

    const canTakeEarly =
      round?.roundState === "2Cards" &&
      playerWhoCanTakeTrump.isDealer &&
      trumpSuit !== undefined;

    const canTakeNormal = round?.roundState === "4Cards";

    if (canTakeEarly || canTakeNormal) {
      processingRef.current = true;
      setTimeout(() => {
        const shouldTake = decideTakeTrump(
          playerWhoCanTakeTrump,
          deck,
          trumpSuit || undefined,
          canTakeEarly,
        );

        if (shouldTake) {
          if (canTakeEarly) {
            dispatch(takeTrumpEarly(playerWhoCanTakeTrump.id));
          } else {
            dispatch(takeTrump(playerWhoCanTakeTrump.id));
          }
        } else {
          dispatch(refuseTrump(playerWhoCanTakeTrump.id));
        }
        processingRef.current = false;
      }, 1000);
    }
  }, [playerWhoCanTakeTrump, round?.roundState, trumpSuit, deck, dispatch]);

  // AI handles fold or stay decision
  useEffect(() => {
    if (processingRef.current) return;

    if (!playerWhoCanFoldOrStay || !playerWhoCanFoldOrStay.isAI) return;

    processingRef.current = true;
    setTimeout(() => {
      const decision = decideStayOrFold(
        playerWhoCanFoldOrStay,
        deck,
        trumpSuit || undefined,
      );

      if (decision === "fold") {
        dispatch(playerFolds(playerWhoCanFoldOrStay.id));
      } else {
        dispatch(playerIsIn(playerWhoCanFoldOrStay.id));
      }
      processingRef.current = false;
    }, 1000);
  }, [playerWhoCanFoldOrStay, deck, trumpSuit, dispatch]);

  // AI handles exchanging cards
  useEffect(() => {
    if (processingRef.current) return;

    if (
      !playerWhoShouldExchangeCards ||
      !playerWhoShouldExchangeCards.isAI ||
      playerWhoShouldExchangeCards.hasExchangedCards ||
      round?.roundState !== "4Cards" ||
      !playerWhoShouldExchangeCards.isIn
    ) {
      return;
    }

    console.log(
      "AI exchanging cards for player:",
      playerWhoShouldExchangeCards.name,
    );
    processingRef.current = true;
    setTimeout(() => {
      // Select cards to discard using checkbox system
      const cardsToDiscard = selectCardsToDiscard(
        playerWhoShouldExchangeCards,
        deck,
        trumpSuit || undefined,
      );

      console.log(
        "Cards to discard:",
        cardsToDiscard,
        "from hand:",
        playerWhoShouldExchangeCards.hand,
      );

      // Toggle selection on the cards we want to discard
      cardsToDiscard.forEach((cardId) => {
        const card = deck.find((c) => c.id === cardId);
        if (card && !card.isSelected) {
          dispatch(toggleSelectCard(cardId));
        }
      });

      // Wait a bit for selections to register, then exchange
      setTimeout(() => {
        dispatch(exchangeCards(playerWhoShouldExchangeCards));
        processingRef.current = false;
      }, 300);
    }, 1000);
  }, [
    playerWhoShouldExchangeCards,
    deck,
    trumpSuit,
    dispatch,
    round?.roundState,
  ]);

  // AI handles playing cards
  useEffect(() => {
    if (processingRef.current) return;

    // Check each player to see if it's an AI's turn to play
    for (const player of game.players) {
      if (!player.isAI || player.hasFolded) continue;

      const isTheirTurn = isPlayersTurn({ game } as RootState, player.id);

      if (isTheirTurn) {
        const currentTurn = round?.turns[round.turns.length - 1];
        const card = decideCardToPlay(
          player,
          deck,
          currentTurn,
          trumpSuit || undefined,
        );

        if (card) {
          processingRef.current = true;
          setTimeout(() => {
            dispatch(playCard({ cardId: card.id, playerId: player.id }));
            processingRef.current = false;
          }, 1200);
          break; // Only process one at a time
        }
      }
    }
  }, [game.players, round?.turns, deck, trumpSuit, dispatch, game, round]);
};
