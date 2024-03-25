import React from 'react';
import PlayerComponent  from './PlayerComponent';
import { Game, Player } from './Types'
import { selectGame, selectPlayers, selectRound, selectTrumpSuit, setTrumpSuit } from './state/gameSlice'
import { useSelector, useDispatch } from "react-redux"
import { dealCards } from './state/gameSlice'

interface GameComponentProps {

}

const GameComponent: React.FC<GameComponentProps> = () => {
    const dispatch = useDispatch();
    const players = useSelector(selectPlayers);
    const trumpSuit = useSelector(selectTrumpSuit);
    const round = useSelector(selectRound);
    const game = useSelector(selectGame);
    console.log(game);
    const dealCardsHandler = () => {
        dispatch(dealCards())
    }
    const setTrumpSuitHandler = () => {
        dispatch(setTrumpSuit())
    }

console.log(round);
console.log(players);
    return (
        <div>
            <div>
                <h1>Game</h1>
            </div>
            <div>
                <h2>Trump Suit </h2>
                <h3>{trumpSuit}</h3>
            </div>
            <div>
                <button disabled={round.roundState === 'Initial' || round.roundState === '0Cards'} onClick={() => dealCardsHandler()}>Deal</button>
                <button onClick={() => setTrumpSuitHandler()}>Set Trump Suit</button>
            </div>
            <div>
                {/* Add player components */}
                {players.map((player, index) => (
                    <PlayerComponent playerId={player.id}/>
                ))}

            </div>
        </div>
    );
};

export default GameComponent;
