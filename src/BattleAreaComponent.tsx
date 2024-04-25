import React, { useEffect, useRef, useState } from "react";
import { motion, Reorder } from "framer-motion";
import {
  calculateWinner,
  endRound,
  selectCurrentTurn,
  selectCurrentTurnNumber,
  selectGame,
  selectRound,
  selectTrumpSuit,
} from "./state/gameSlice";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, VStack, Tag, transition } from "@chakra-ui/react";
import { Card, PlayedCard, CardInTurn } from "./Types";

interface BattleAreaComponentProps {
  // Add any props you need for your component here
  playedCard: PlayedCard | undefined;
  cardPlayedHandler: Function;
}

const BattleAreaComponent: React.FC<BattleAreaComponentProps> = ({
  playedCard,
  cardPlayedHandler,
}) => {
  const dispatch = useDispatch();
  const currentTurn = useSelector(selectCurrentTurn);
  const currentRound = useSelector(selectRound);
  const turnNumber = useSelector(selectCurrentTurnNumber);
  const trumpSuit = useSelector(selectTrumpSuit);
  const game = useSelector(selectGame);
  const players = game.players;
  const winner = players.find((player) => player.id === currentTurn?.winner);
  const deck = game.deck;
  const cardsInTurnRef = useRef<HTMLDivElement>(null);
  const [cardsInTurnRect, setCardsInTurnRect] = useState<DOMRect | null>(null);
  const [orderedCardsOnTable, setOrderedCardsInTurn] = useState<CardInTurn[]>(
    [],
  );

  useEffect(() => {
    if (cardsInTurnRef.current) {
      setCardsInTurnRect(cardsInTurnRef.current.getBoundingClientRect());
    }

    const handleResize = () => {
      if (cardsInTurnRef.current) {
        setCardsInTurnRect(cardsInTurnRef.current.getBoundingClientRect());
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const newRoundHandler = () => {
    dispatch(endRound());
  };

  const allPlayersAreReady = players.every(
    (player) => player.hasFolded || player.isIn,
  );

  const currentWinnerCard =
    trumpSuit && currentTurn && currentTurn.cardsPlayed.length > 0
      ? calculateWinner(trumpSuit?.suit, currentTurn, deck)
      : undefined;

  const newRoundButtonStyle =
    currentRound?.roundState === "RoundOver" ||
    currentRound?.roundState === "GameOver"
      ? {
          backgroundColor: "green",
        }
      : {
          backgroundColor: "grey",
        };

  useEffect(() => {
    console.log("useffect is run");
    if (playedCard) {
      /*
      setOrderedCardsInTurn([
        ...(currentTurn?.cardsPlayed ?? []),
      ]);*/
      const orderedCards =
        currentTurn?.cardsPlayed && currentRound?.turns.at(-1)?.suit
          ? orderCards(
              currentTurn?.cardsPlayed,
              currentRound?.turns.at(-1)?.suit ?? "",
              trumpSuit?.suit ?? "",
            )
          : [];
      setOrderedCardsInTurn(orderedCards);
      setTimeout(() => {
        cardPlayedHandler(undefined);
      }, 1000);
    }
  }, [playedCard]);

  const cardItems =
    orderedCardsOnTable.map((cardInTurn, index) => {
      const card = game.deck.find((c) => c.id === cardInTurn.cardId);
      let animation = {} as any;
      if (
        card?.id === playedCard?.cardId &&
        playedCard?.rectRef &&
        cardsInTurnRect
      ) {
        animation = {
          inital: {
            x: playedCard?.rectRef.left - cardsInTurnRect.left,
            y: playedCard?.rectRef.top - cardsInTurnRect.top,
          },
          animate: { x: 0, y: 0 },
          transition: { duration: 1 },
        };
      } else {
        animation = {
          inital: { x: 0, y: 0 },
          animate: { x: 0, y: 0 },
          transition: { duration: 0 },
        };
      }
      return (
        <motion.div
          key={cardInTurn.sequence}
          initial={animation.inital}
          animate={animation.animate}
          transition={animation.transition}
        >
          <Tag
            id={`card-${card?.id.toString()}`}
            key={index}
            className={
              card?.id === currentWinnerCard?.cardId ? "winning-card" : ""
            }
          >
            {card?.name} of {card?.suit}
          </Tag>
        </motion.div>
      );
    }) ?? [];

  function orderCards(
    cards: CardInTurn[],
    leadSuit: string,
    trumpSuit: string,
  ) {
    //Copy cards to avoid mutating the original array
    const copy = [...cards];
    //Sort cards played by value and suit. If suit is the same, sort by value. Highest value first. Trump suit first, then suit led
    copy.sort((a, b) => {
      const cardA = deck.find((c) => c.id === a.cardId);
      const cardB = deck.find((c) => c.id === b.cardId);
      if (cardA && cardB) {
        if (cardA.suit === trumpSuit) {
          if (cardB.suit === trumpSuit) {
            return cardB.value - cardA.value;
          }
          return -1;
        }
        if (cardB.suit === trumpSuit) {
          return 1;
        }
        if (cardA.suit === leadSuit) {
          if (cardB.suit === leadSuit) {
            return cardB.value - cardA.value;
          }
          return -1;
        }
        if (cardB.suit === leadSuit) {
          return 1;
        }
        return cardB.value - cardA.value;
      }
      return 0;
    });
    return copy;
  }

  return (
    <Box id="battleArea">
      <VStack id="cardsInTurn" ref={cardsInTurnRef}>
        {currentTurn && (
          <Reorder.Group
            layout
            values={cardItems}
            onReorder={() => console.log("reorder")}
          >
            {cardItems.map((item, index) => (
              <Reorder.Item key={`item-${item.key}`} value={item}>
                {item}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </VStack>
      <div id="roundInfo">
        <>
          <h3>Round number {currentRound?.roundNumber}</h3>
          <h3>Winner: {winner?.name}</h3>
          <h4>Turn number: {turnNumber}</h4>
          <h3>
            Trump Suit{" "}
            {currentRound?.hiddenTrumpSuit && !allPlayersAreReady
              ? "FORDEKT"
              : trumpSuit?.suit}
          </h3>
          <div>Round pot {currentRound?.roundPot}</div>
          <div>Round state {currentRound?.roundState}</div>
          <div>Lead suit: {currentRound?.turns.at(-1)?.suit} </div>
          <div>
            <Button
              style={newRoundButtonStyle}
              disabled={
                !(
                  currentRound?.roundState === "RoundOver" ||
                  currentRound?.roundState === "GameOver"
                )
              }
              onClick={() => newRoundHandler()}
            >
              New Round
            </Button>
          </div>
        </>
      </div>
    </Box>
  );
};

export default BattleAreaComponent;
