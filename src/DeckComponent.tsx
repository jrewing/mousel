import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { selectDeck, selectRound, selectGame } from "./state/gameSlice";
import { Card } from "@chakra-ui/react";
import { TRUMP_SHAKE_DURATION } from "./constants";
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

    // Get the cards that should be dealt (top cards from deck)
    const totalCardsToDeal = numberOfPlayers * cardsToDeal;
    const cardsToDealArray = cardsInDeck.slice(-totalCardsToDeal).reverse();

    // Assign each card to a player with a delay
    const dealingCardsArray: Array<{
      card: CardType;
      playerIndex: number;
      delay: number;
    }> = [];
    let cardIndex = 0;

    for (let round = 0; round < cardsToDeal; round++) {
      for (let playerIndex = 0; playerIndex < numberOfPlayers; playerIndex++) {
        const card = cardsToDealArray[cardIndex];
        if (card) {
          dealingCardsArray.push({
            card,
            playerIndex,
            delay: cardIndex * 100, // 100ms delay between cards
          });
        }
        cardIndex++;
      }
    }

    setDealingCards(dealingCardsArray);

    // Hide each card in the deck as its animation starts
    const timers: NodeJS.Timeout[] = [];
    dealingCardsArray.forEach((dc) => {
      const timer = setTimeout(() => {
        setHiddenCardIds((prev) => new Set(prev).add(dc.card.id));
      }, dc.delay);
      timers.push(timer);
    });

    // Call onComplete after all animations finish
    const totalDuration = (dealingCardsArray.length - 1) * 100 + 500; // 100ms delay * cards + 500ms animation
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

  if (!showDeck) {
    return null;
  }

  // Show all cards in the deck
  const visibleCards = cardsInDeck;

  return (
    <>
      <div className="deck-container">
        <div className="deck-stack">
          {visibleCards.map((card, index) => {
            const isTopCard = index === visibleCards.length - 1;
            const xOffset = index * 0.5;
            const yOffset = index * 2;
            const isBeingDealt = hiddenCardIds.has(card.id);

            return (
              <Card
                key={card.id}
                className={`deck-card ${isTopCard && isShaking ? "trump-shake" : ""} ${isBeingDealt ? "being-dealt" : ""}`}
                backgroundColor="blue.500"
                style={{
                  transform: `translate(${xOffset}px, ${yOffset}px)`,
                  zIndex: index,
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
          // Calculate starting position from the card's position in visible deck
          const cardIndexInDeck = visibleCards.findIndex(
            (c) => c.id === dc.card.id,
          );
          const startX = cardIndexInDeck >= 0 ? cardIndexInDeck * 0.5 : 0;
          const startY = cardIndexInDeck >= 0 ? cardIndexInDeck * 2 : 0;

          return (
            <Card
              key={`dealing-${dc.card.id}-${idx}`}
              className={`animated-dealing-card dealing-animation-${dc.playerIndex}`}
              backgroundColor="blue.500"
              style={{
                animationDelay: `${dc.delay}ms`,
                // @ts-expect-error - CSS custom properties
                "--start-x": `${startX}px`,
                "--start-y": `${startY}px`,
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
