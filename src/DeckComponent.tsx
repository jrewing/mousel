import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectDeck, selectRound } from "./state/gameSlice";
import { Card } from "@chakra-ui/react";
import { TRUMP_SHAKE_DURATION } from "./constants";

const DeckComponent: React.FC = () => {
  const deck = useSelector(selectDeck);
  const round = useSelector(selectRound);
  const [isShaking, setIsShaking] = useState(false);
  const previousTrumpCard = useRef<number | undefined>();

  // Count cards remaining in deck (not dealt, not played, not discarded)
  const cardsInDeck = deck.filter(
    (card) => !card.isPlayed && !card.isDiscarded && !card.isDealt,
  ).length;

  // Trigger shake animation when trump card is set
  useEffect(() => {
    const currentTrumpCard = round?.trumpSuit?.id;
    const prevTrumpCard = previousTrumpCard.current;

    if (currentTrumpCard !== undefined && prevTrumpCard === undefined) {
      setIsShaking(true);
      const timer = setTimeout(() => setIsShaking(false), TRUMP_SHAKE_DURATION);
      return () => clearTimeout(timer);
    }

    previousTrumpCard.current = currentTrumpCard;
  }, [round?.trumpSuit?.id]);

  // Show deck during these states
  const showDeck =
    round?.roundState === "Initial" ||
    round?.roundState === "0Cards" ||
    round?.roundState === "2Cards" ||
    round?.roundState === "4Cards";

  if (!showDeck || cardsInDeck === 0) {
    return null;
  }

  return (
    <div className="deck-container">
      <div className="deck-stack">
        {/* Show 3 stacked cards to represent the deck */}
        <Card className="deck-card deck-card-bottom" backgroundColor="blue.700">
          <div className="card-back">🂠</div>
        </Card>
        <Card className="deck-card deck-card-middle" backgroundColor="blue.600">
          <div className="card-back">🂠</div>
        </Card>
        <Card
          className={`deck-card deck-card-top ${isShaking ? "trump-shake" : ""}`}
          backgroundColor="blue.500"
        >
          <div className="card-back">🂠</div>
        </Card>
      </div>
      <div className="deck-count">{cardsInDeck} card{cardsInDeck === 1 ? '' : 's'}</div>
    </div>
  );
};

export default DeckComponent;
