import React, { useEffect, useState, useRef } from "react";
import { Card as CardUI } from "@chakra-ui/react";
import { CARD_DEAL_DELAY, CARD_DEAL_ANIMATION_DURATION } from "./constants";

type AnimatedCard = {
  id: string;
  playerIndex: number;
  delay: number;
};

type DealingAnimationComponentProps = {
  isDealing: boolean;
  numberOfPlayers: number;
  cardsPerPlayer: number;
  deckCount: number;
  onComplete: () => void;
};

/**
 * DealingAnimationComponent animates cards flying from the deck to each player.
 *
 * - Creates one animated card per player per round, for a total of `numberOfPlayers * cardsPerPlayer` cards.
 * - Each card's animation is staggered by 100ms (`delay`), so cards are dealt sequentially.
 * - The animation duration for each card is 500ms (handled via CSS).
 * - Calls `onComplete` after all animations have finished (last card's delay + animation duration).
 *
 * Props:
 * - isDealing: Whether to show the dealing animation.
 * - numberOfPlayers: Number of players to deal cards to.
 * - cardsPerPlayer: Number of cards each player receives.
 * - onComplete: Callback invoked after all animations finish.
 */
const DealingAnimationComponent: React.FC<DealingAnimationComponentProps> = ({
  isDealing,
  numberOfPlayers,
  cardsPerPlayer,
  deckCount,
  onComplete,
}) => {
  const [animatedCards, setAnimatedCards] = useState<AnimatedCard[]>([]);
  const onCompleteRef = useRef(onComplete);

  // Keep onCompleteRef up to date
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    if (!isDealing) {
      setAnimatedCards([]);
      return;
    }

    console.log(
      `Dealing animation triggered: ${cardsPerPlayer} cards to ${numberOfPlayers} players`,
    );

    // Generate animated cards with delays
    const cards: AnimatedCard[] = [];
    let cardIndex = 0;

    for (let round = 0; round < cardsPerPlayer; round++) {
      for (let playerIndex = 0; playerIndex < numberOfPlayers; playerIndex++) {
        cards.push({
          id: `card-${cardIndex}`,
          playerIndex,
          delay: cardIndex * CARD_DEAL_DELAY,
        });
        cardIndex++;
      }
    }

    console.log(`Generated ${cards.length} animated cards`);
    setAnimatedCards(cards);

    // Call onComplete after all animations finish
    const totalDuration =
      (cards.length - 1) * CARD_DEAL_DELAY + CARD_DEAL_ANIMATION_DURATION;
    const timer = setTimeout(() => {
      onCompleteRef.current();
      setAnimatedCards([]);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [isDealing, numberOfPlayers, cardsPerPlayer]);

  if (!isDealing || animatedCards.length === 0) {
    return null;
  }

  // Calculate the top card position (matching DeckComponent logic)
  const topCardIndex = Math.min(deckCount, 10) - 1;
  const startX = topCardIndex * 0.5;
  const startY = -topCardIndex * 4;

  return (
    <div className="dealing-animation-container">
      {animatedCards.map((card) => (
        <CardUI
          key={card.id}
          className={`animated-dealing-card dealing-animation-${card.playerIndex}`}
          backgroundColor="blue.500"
          style={{
            animationDelay: `${card.delay}ms`,
            // @ts-expect-error - CSS custom properties
            "--start-x": `${startX}px`,
            "--start-y": `${startY}px`,
          }}
        >
          <div className="card-back">🂠</div>
        </CardUI>
      ))}
    </div>
  );
};

export default DealingAnimationComponent;
