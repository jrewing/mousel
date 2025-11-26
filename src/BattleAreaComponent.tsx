import React, { useEffect, useMemo, useState } from "react";
import {
  calculateWinner,
  selectCurrentTurn,
  selectCurrentTurnNumber,
  selectGame,
  selectRound,
  selectTrumpSuit,
} from "./state/gameSlice";
import { useSelector } from "react-redux";
import { Box, VStack, Tag, Card } from "@chakra-ui/react";
import { PlayedCard, CardInTurn } from "./Types";

type BattleAreaComponentProps = {
  // Add any props you need for your component here
  playedCard: PlayedCard | undefined;
  onCardPlayed: (card: PlayedCard | undefined) => void;
};

const BattleAreaComponent: React.FC<BattleAreaComponentProps> = ({
  playedCard,
  onCardPlayed,
}) => {
  const currentTurn = useSelector(selectCurrentTurn);
  const currentRound = useSelector(selectRound);
  const turnNumber = useSelector(selectCurrentTurnNumber);
  const trumpSuit = useSelector(selectTrumpSuit);
  const game = useSelector(selectGame);
  const players = game.players;
  const winner = players.find((player) => player.id === currentTurn?.winner);
  const deck = game.deck;
  const [orderedCardsOnTable, setOrderedCardsInTurn] = useState<CardInTurn[]>(
    [],
  );

  const cardLookup = useMemo(() => {
    const lookup: Record<string, (typeof game.deck)[0]> = {};
    for (const card of game.deck) {
      lookup[card.id] = card;
    }
    return lookup;
  }, [game.deck]);

  const allPlayersAreReady = players.every(
    (player) => player.hasFolded || player.isIn,
  );

  const currentWinnerCard =
    trumpSuit && currentTurn && currentTurn.cardsPlayed.length > 0
      ? calculateWinner(trumpSuit?.suit, currentTurn, deck)
      : undefined;

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
  }, [
    playedCard,
    onCardPlayed,
    currentTurn?.cardsPlayed,
    currentRound?.turns,
    trumpSuit?.suit,
  ]);

  useEffect(() => {
    const orderedCards = currentTurn?.cardsPlayed.length
      ? sortCards(
          currentTurn.cardsPlayed,
          currentTurn.suit ?? "",
          trumpSuit?.suit ?? "",
        )
      : [];
    setOrderedCardsInTurn(orderedCards);
  }, [
    currentTurn?.cardsPlayed,
    currentTurn?.suit,
    trumpSuit?.suit,
    cardLookup,
  ]);

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

  const showTrumpCard =
    trumpSuit &&
    currentRound?.roundState === "2Cards" &&
    !currentRound?.hiddenTrumpSuit;

  return (
    <Box id="battleArea">
      {showTrumpCard && (
        <Card
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          padding={3}
          backgroundColor="white"
          borderWidth={3}
          borderColor="gold"
          boxShadow="0 0 20px 5px rgba(255, 215, 0, 0.6)"
          zIndex={999}
        >
          <VStack spacing={1}>
            <div
              style={{ fontSize: "0.8rem", fontWeight: "bold", color: "gray" }}
            >
              Trump Card
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: trumpSuit.color === "Red" ? "red" : "black",
              }}
            >
              {trumpSuit.name} {trumpSuit.suitSymbol}
            </div>
          </VStack>
        </Card>
      )}
      <Card padding={2} position="fixed" top="20px" right="20px" zIndex={1000}>
        <VStack align="start" id="roundInfo" spacing={1}>
          <h3 style={{ fontSize: "0.9rem", margin: 0 }}>
            Round: {currentRound?.roundNumber}
          </h3>
          <h3 style={{ fontSize: "0.9rem", margin: 0 }}>
            Winner: {winner?.name}
          </h3>
          <h4 style={{ fontSize: "0.85rem", margin: 0 }}>Turn: {turnNumber}</h4>
          <h3 style={{ fontSize: "0.9rem", margin: 0 }}>
            Trump:{" "}
            {currentRound?.hiddenTrumpSuit && !allPlayersAreReady
              ? "FORDEKT"
              : trumpSuit?.suit}
          </h3>
          <div style={{ fontSize: "0.85rem" }}>
            Pot: {currentRound?.roundPot}
          </div>
          <div style={{ fontSize: "0.85rem" }}>
            State: {currentRound?.roundState}
          </div>
          <div style={{ fontSize: "0.85rem" }}>
            Lead: {currentRound?.turns.at(-1)?.suit}{" "}
          </div>
          {currentTurn && orderedCardsOnTable.length > 0 && (
            <VStack align="start" spacing={0.5} width="100%">
              <div style={{ fontSize: "0.8rem", fontWeight: "bold" }}>
                Cards played:
              </div>
              {orderedCardsOnTable.map((cardInTurn) => {
                const card = cardLookup[cardInTurn.cardId];
                return (
                  <Tag
                    key={cardInTurn.sequence}
                    id={`card-${card?.id.toString()}`}
                    size="sm"
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
                    {card?.name} {card?.suitSymbol}
                  </Tag>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Card>
    </Box>
  );
};

export default BattleAreaComponent;
