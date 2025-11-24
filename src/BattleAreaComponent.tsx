import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, Reorder, color } from "framer-motion";
import {
  calculateWinner,
  endRound,
  newTurn,
  selectCurrentTurn,
  selectCurrentTurnNumber,
  selectGame,
  selectRound,
  selectTrumpSuit,
} from "./state/gameSlice";
import { useDispatch, useSelector } from "react-redux";
import { Box, Button, VStack, Tag, Card } from "@chakra-ui/react";
import { PlayedCard, CardInTurn } from "./Types";

interface BattleAreaComponentProps {
  // Add any props you need for your component here
  playedCard: PlayedCard | undefined;
  onCardPlayed: Function;
}

const BattleAreaComponent: React.FC<BattleAreaComponentProps> = ({
  playedCard,
  onCardPlayed,
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

  const cardLookup = useMemo(() => {
    const lookup: { [id: string]: (typeof game.deck)[0] } = {};
    for (const card of game.deck) {
      lookup[card.id] = card;
    }
    return lookup;
  }, [game.deck]);

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

  const newTurnHandler = () => {
    dispatch(newTurn());
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
    if (playedCard) {
      // When a card is played, we just need to add it to the list.
      // The sorting will happen in the next step.
      const orderedCards =
        currentTurn?.cardsPlayed && currentRound?.turns.at(-1)?.suit
          ? sortCards(
              currentTurn?.cardsPlayed,
              currentRound?.turns.at(-1)?.suit ?? "",
              trumpSuit?.suit ?? "",
            )
          : [];
      setOrderedCardsInTurn(orderedCards);
      setTimeout(() => {
        onCardPlayed(undefined);
      }, 1000);
    }
  }, [playedCard]);

  useEffect(() => {
    const orderedCards = currentTurn?.cardsPlayed.length
      ? sortCards(
          currentTurn.cardsPlayed,
          currentTurn.suit ?? "",
          trumpSuit?.suit ?? "",
        )
      : [];
    setOrderedCardsInTurn(orderedCards);
  }, [currentTurn?.cardsPlayed, currentTurn?.suit, trumpSuit?.suit, cardLookup]);

  function sortCards(cards: CardInTurn[], leadSuit: string, trumpSuit: string) {
    //Copy cards to avoid mutating the original array
    const copy = [...cards];
    //Sort cards played by value and suit. If suit is the same, sort by value. Highest value first. Trump suit first, then suit led
    copy.sort((a, b) => {
      const cardA = cardLookup[a.cardId];
      const cardB = cardLookup[b.cardId];
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
      <VStack w="30%" alignItems="end" id="cardsInTurn">
        {currentTurn && (
          <Reorder.Group
            values={orderedCardsOnTable}
            onReorder={setOrderedCardsInTurn}
            ref={cardsInTurnRef}
          >
            {orderedCardsOnTable.map((cardInTurn) => {
              const card = cardLookup[cardInTurn.cardId];
              const isJustPlayed = card?.id === playedCard?.cardId;
              const initialAnimation =
                isJustPlayed && playedCard?.rectRef && cardsInTurnRect
                  ? {
                      x: playedCard.rectRef.left - cardsInTurnRect.left,
                      y: playedCard.rectRef.top - cardsInTurnRect.top,
                    }
                  : { x: 0, y: 0 };

              return (
                <Reorder.Item
                  key={cardInTurn.sequence}
                  value={cardInTurn}
                  initial={initialAnimation}
                  animate={{ x: 0, y: 0 }}
                  transition={{ duration: 1 }}
                >
                  <Tag
                    id={`card-${card?.id.toString()}`}
                    className={
                      card?.id === currentWinnerCard?.cardId
                        ? "winning-card"
                        : card?.suit === currentTurn?.suit
                          ? "suit-led-card"
                          : ""
                    }
                    color={card?.color === "Red" ? "red" : "black"}
                    backgroundColor="white"
                  >
                    {card?.name} of {card?.suitSymbol}
                  </Tag>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}
      </VStack>
      <Card padding={2} position="fixed" top="20px" right="20px" zIndex={1000}>
        <VStack align="start" id="roundInfo">
          <h3>Round number: {currentRound?.roundNumber}</h3>
          <h3>Winner: {winner?.name}</h3>
          <h4>Turn number: {turnNumber}</h4>
          <h3>
            Trump Suit:{" "}
            {currentRound?.hiddenTrumpSuit && !allPlayersAreReady
              ? "FORDEKT"
              : trumpSuit?.suit}
          </h3>
          <div>Round pot: {currentRound?.roundPot}</div>
          <div>Round state: {currentRound?.roundState}</div>
          <div>Lead suit: {currentRound?.turns.at(-1)?.suit} </div>
          {currentRound?.roundState === "TurnOver" && (
            <div>
              <Button onClick={() => newTurnHandler()}>New Turn</Button>
            </div>
          )}
          {(currentRound?.roundState === "RoundOver" ||
            currentRound?.roundState === "GameOver") && (
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
          )}
        </VStack>
      </Card>
    </Box>
  );
};

export default BattleAreaComponent;
