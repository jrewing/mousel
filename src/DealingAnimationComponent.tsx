import React, { useEffect, useState, useRef } from "react";
import { Card as CardUI } from "@chakra-ui/react";

type AnimatedCard = {
  id: string;
  playerIndex: number;
  delay: number;
};

type DealingAnimationComponentProps = {
  isDealing: boolean;
  numberOfPlayers: number;
  cardsPerPlayer: number;
  onComplete: () => void;
};

const DealingAnimationComponent: React.FC<DealingAnimationComponentProps> = ({
  isDealing,
  numberOfPlayers,
  cardsPerPlayer,
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
          delay: cardIndex * 100, // 100ms between each card
        });
        cardIndex++;
      }
    }

    console.log(`Generated ${cards.length} animated cards`);
    setAnimatedCards(cards);

    // Call onComplete after all animations finish
    // Last card delay + animation duration (500ms from CSS)
    const lastCardDelay = (cards.length - 1) * 100;
    const animationDuration = 500;
    const totalDuration = lastCardDelay + animationDuration;
    const timer = setTimeout(() => {
      onCompleteRef.current();
      setAnimatedCards([]);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [isDealing, numberOfPlayers, cardsPerPlayer]);

  if (!isDealing || animatedCards.length === 0) {
    return null;
  }

  return (
    <div className="dealing-animation-container">
      {animatedCards.map((card) => (
        <CardUI
          key={card.id}
          className={`animated-dealing-card dealing-animation-${card.playerIndex}`}
          backgroundColor="blue.500"
          style={{
            animationDelay: `${card.delay}ms`,
          }}
        >
          <div className="card-back">🂠</div>
        </CardUI>
      ))}
    </div>
  );
};

export default DealingAnimationComponent;
