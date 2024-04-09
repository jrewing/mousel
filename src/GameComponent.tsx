import React from 'react';
import PlayerComponent  from './PlayerComponent';
import { selectDealer, selectGame, selectPlayers, selectRound, selectTrumpSuit, setTrumpSuit } from './state/gameSlice'
import { useSelector, useDispatch } from "react-redux"
import { dealCards } from './state/gameSlice'
import BattleAreaComponent from './BattleAreaComponent';

interface GameComponentProps {

}

const GameComponent: React.FC<GameComponentProps> = () => {
    const dispatch = useDispatch();
    const trumpSuit = useSelector(selectTrumpSuit);
    const round = useSelector(selectRound);
    const game = useSelector(selectGame);




    const setTrumpSuitHandler = () => {
        dispatch(setTrumpSuit())
    }



    return (
        <div>
            <div>
                <button disabled={round?.roundState !== '2Cards' || trumpSuit !== undefined} onClick={() => setTrumpSuitHandler()}>Set Trump Suit</button>
            </div>
            <div className="game-container">
                <div className="player-container">
                    {game.players.map((player, index) => (
                        <div key={`player-${player.id}`} className={`player player-${index}`}>
                            <PlayerComponent playerId={player.id}/>
                        </div>
                    ))}
                </div>
                <BattleAreaComponent />
            </div>
        </div>
    );
};

export default GameComponent;
