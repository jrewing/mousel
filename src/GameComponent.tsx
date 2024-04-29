import React, { useState } from "react";
import PlayerComponent from "./PlayerComponent";
import { selectGame } from "./state/gameSlice";
import { useSelector, useDispatch } from "react-redux";
import BattleAreaComponent from "./BattleAreaComponent";
import { PlayedCard } from "./Types";

interface GameComponentProps {}

const GameComponent: React.FC<GameComponentProps> = () => {
  const game = useSelector(selectGame);
  const [playedCard, setPlayedCard] = useState<PlayedCard | undefined>();

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
        <div className="player-container">
          {game.players.map((player, index) => (
            <div
              key={`player-${player.id}`}
              className={`player player-${index}`}
            >
              <PlayerComponent
                onCardPlayed={onCardPlayed}
                playerId={player.id}
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
