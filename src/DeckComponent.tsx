import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectDeck, selectRound, selectGame } from "./state/gameSlice";
import { Card } from "@chakra-ui/react";
import {
  TRUMP_SHAKE_DURATION,
  CARD_DEAL_DELAY,
  CARD_DEAL_ANIMATION_DURATION,
} from "./constants";
import { Card as CardType } from "./Types";

type DeckComponentProps = {
  isDealing?: boolean;
  numberOfPlayers?: number;
  cardsToDeal?: number;
  onComplete?: () => void;
};

const DeckComponent: React.FC<DeckComponentProps> = ({
  isDealing = false,
  numberOfPlayers = 0,
  cardsToDeal = 0,
  onComplete,
}) => {
  const deck = useSelector(selectDeck);
  const round = useSelector(selectRound);
  const game = useSelector(selectGame);
  const [isShaking, setIsShaking] = useState(false);
  const previousTrumpCard = useRef<number | undefined>();
  const [dealingCards, setDealingCards] = useState<
    Array<{ card: CardType; playerIndex: number; delay: number }>
  >([]);
  const [hiddenCardIds, setHiddenCardIds] = useState<Set<number>>(new Set());
  const onCompleteRef = useRef(onComplete);

  // Get actual cards remaining in deck (not dealt, not played, not discarded)
  const cardsInDeck = deck.filter(
    (card) => !card.isPlayed && !card.isDiscarded && !card.isDealt,
  );

  // Keep onCompleteRef up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Reset hidden cards when a new round starts
  useEffect(() => {
    setHiddenCardIds(new Set());
  }, [game.currentRound]);

  // Trigger dealing animation
  useEffect(() => {
    if (!isDealing || numberOfPlayers === 0 || cardsToDeal === 0) {
      setDealingCards([]);
      return;
    }

    // Get the cards that should be dealt from the top of the deck (highest indices)
    const totalCardsToDeal = numberOfPlayers * cardsToDeal;
    const startIndex = cardsInDeck.length - totalCardsToDeal;
    const cardsToDealArray = cardsInDeck.slice(startIndex);

    // Assign each card to a player with a delay and starting position
    // Deal from highest index down - reverse the array so we deal from top
    const dealingCardsArray: Array<{
      card: CardType;
      playerIndex: number;
      delay: number;
      startX: number;
      startY: number;
    }> = [];
    let dealOrder = 0;

    // Reverse the order so we deal from highest index first
    for (let round = 0; round < cardsToDeal; round++) {
      for (let playerIndex = 0; playerIndex < numberOfPlayers; playerIndex++) {
        // Deal from the end of cardsToDealArray backwards
        const cardIndex = cardsToDealArray.length - 1 - dealOrder;
        const card = cardsToDealArray[cardIndex];
        if (card) {
          // Calculate this card's current position in the deck
          const deckIndex = startIndex + cardIndex;
          const startX = deckIndex * 0.5;
          const startY = deckIndex * 2;

          dealingCardsArray.push({
            card,
            playerIndex,
            delay: dealOrder * CARD_DEAL_DELAY,
            startX,
            startY,
          });
        }
        dealOrder++;
      }
    }

    setDealingCards(dealingCardsArray);

    const timers: NodeJS.Timeout[] = [];

    // Hide each card as its animation starts
    dealingCardsArray.forEach((dc) => {
      const hideTimer = setTimeout(() => {
        setHiddenCardIds((prev) => new Set(prev).add(dc.card.id));
      }, dc.delay);
      timers.push(hideTimer);
    });

    // Call onComplete after all animations finish
    const totalDuration =
      (dealingCardsArray.length - 1) * CARD_DEAL_DELAY +
      CARD_DEAL_ANIMATION_DURATION;
    const completeTimer = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
      setDealingCards([]);
      // Don't clear hiddenCardIds - cards should stay hidden since they're dealt
    }, totalDuration);
    timers.push(completeTimer);

    return () => timers.forEach((t) => clearTimeout(t));
  }, [isDealing, numberOfPlayers, cardsToDeal]);

  // Trigger shake animation when trump card is set
  useEffect(() => {
    const currentTrumpCard = round?.trumpSuit?.id;
    const prevTrumpCard = previousTrumpCard.current;

    if (currentTrumpCard !== undefined && prevTrumpCard === undefined) {
      console.log("🎴 Triggering trump card shake animation!");
      setIsShaking(true);
      const timer = setTimeout(() => {
        console.log("🎴 Stopping trump card shake animation");
        setIsShaking(false);
      }, TRUMP_SHAKE_DURATION);
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

  if (!showDeck) {
    return null;
  }

  // Show all cards in the deck - no reversing needed
  const visibleCards = cardsInDeck;

  return (
    <>
      <div className="deck-container">
        <div className="deck-stack">
          {visibleCards.map((card, index) => {
            const isTrumpCard = card.id === round?.trumpSuit?.id;
            const isBeingDealt = hiddenCardIds.has(card.id);

            // Calculate position based on visible index (excluding hidden cards)
            const visibleIndex =
              visibleCards
                .slice(0, index + 1)
                .filter((c) => !hiddenCardIds.has(c.id)).length - 1;
            const xOffset = visibleIndex * 0.5;
            const yOffset = visibleIndex * 2;

            return (
              <Card
                key={card.id}
                className={`deck-card ${isTrumpCard && isShaking ? "trump-shake" : ""} ${isBeingDealt ? "being-dealt" : ""}`}
                backgroundColor="blue.500"
                style={{
                  transform: `translate(${xOffset}px, ${yOffset}px)`,
                  zIndex: visibleIndex,
                  // CSS variables for shake animation
                  ["--shake-x" as string]: `${xOffset}px`,
                  ["--shake-y" as string]: `${yOffset}px`,
                }}
              >
                <div className="card-back">🂠</div>
              </Card>
            );
          })}
        </div>
        <div className="deck-count">
          {cardsInDeck.length} card{cardsInDeck.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Render dealing animation cards */}
      <div className="dealing-animation-container">
        {dealingCards.map((dc, idx) => {
          // Use the pre-calculated starting position stored with each card
          // Reverse z-index so first card dealt (idx 0) appears on top
          const zIndex = dealingCards.length - idx;
          return (
            <Card
              key={`dealing-${dc.card.id}-${idx}`}
              className={`animated-dealing-card dealing-animation-${dc.playerIndex}`}
              backgroundColor="blue.500"
              style={{
                animationDelay: `${dc.delay}ms`,
                zIndex,
                // @ts-expect-error - CSS custom properties
                "--start-x": `${dc.startX}px`,
                "--start-y": `${dc.startY}px`,
              }}
            >
              <div className="card-back">🂠</div>
            </Card>
          );
        })}
      </div>
    </>
  );
};

export default DeckComponent;
