import React, { useState, useEffect, useRef } from "react";
import PlayerComponent from "./PlayerComponent";
import DeckComponent from "./DeckComponent";
import DealingAnimationComponent from "./DealingAnimationComponent";
import { selectGame, selectRound } from "./state/gameSlice";
import { useSelector } from "react-redux";
import BattleAreaComponent from "./BattleAreaComponent";
import { PlayedCard } from "./Types";
import { useAIPlayer } from "./hooks/useAIPlayer";
import confetti from "canvas-confetti";

type GameComponentProps = Record<string, never>;

const GameComponent: React.FC<GameComponentProps> = () => {
  const game = useSelector(selectGame);
  const round = useSelector(selectRound);
  const [playedCard, setPlayedCard] = useState<PlayedCard | undefined>();
  const [isDealing, setIsDealing] = useState(false);
  const [cardsToDeal, setCardsToDeal] = useState(0);
  const [cardsToShow, setCardsToShow] = useState<number>(0);
  const previousRoundState = useRef<string | undefined>();

  // Enable AI players
  useAIPlayer();

  // Trigger dealing animation and confetti based on round state changes
  useEffect(() => {
    const currentState = round?.roundState;
    const prevState = previousRoundState.current;

    console.log(`Round state changed: ${prevState} -> ${currentState}`);

    // Trigger confetti when game ends
    if (currentState === "GameOver" && prevState !== "GameOver") {
      void confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#FFD700", "#FFA500", "#FF6347", "#4169E1", "#32CD32"],
      });
    }

    // Trigger dealing animation
    if (currentState === "2Cards" && prevState !== "2Cards") {
      console.log("Triggering first deal animation");
      // First deal: 2 cards per player (show 0 cards during animation)
      setCardsToShow(0);
      setCardsToDeal(2);
      setIsDealing(true);
    } else if (currentState === "4Cards" && prevState !== "4Cards") {
      console.log("Triggering second deal animation");
      // Second deal: 2 more cards per player (show first 2 cards during animation)
      setCardsToShow(2);
      setCardsToDeal(2);
      setIsDealing(true);
    }

    previousRoundState.current = currentState;
  }, [round?.roundState]);

  const handleDealingComplete = () => {
    console.log("Dealing animation complete - showing all cards");
    setIsDealing(false);
    setCardsToShow(0); // Reset cards to show all
  };

  //Parameter is a ref from useRef
  function onCardPlayed(playedCard: PlayedCard | undefined) {
    if (playedCard !== undefined) {
      setPlayedCard(playedCard);
    } else {
      setPlayedCard(undefined);
    }
  }

  return (
    <div>
      <div className="game-container">
        <DeckComponent />
        <DealingAnimationComponent
          isDealing={isDealing}
          numberOfPlayers={game.numberOfPlayers}
          cardsPerPlayer={cardsToDeal}
          onComplete={handleDealingComplete}
        />
        <div className="player-container">
          {game.players.map((player, index) => (
            <div
              key={`player-${player.id}`}
              className={`player player-${index}`}
            >
              <PlayerComponent
                onCardPlayed={onCardPlayed}
                playerId={player.id}
                isDealing={isDealing}
                cardsToShow={cardsToShow}
              />
            </div>
          ))}
        </div>
        <BattleAreaComponent
          playedCard={playedCard}
          onCardPlayed={onCardPlayed}
        />
      </div>
    </div>
  );
};

export default GameComponent;
