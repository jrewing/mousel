import React from 'react';
import PlayerComponent  from './PlayerComponent';
import { Game, Player } from './Types'
import { selectDealer, selectGame, selectPlayers, selectRound, selectTrumpSuit, setTrumpSuit } from './state/gameSlice'
import { useSelector, useDispatch } from "react-redux"
import { dealCards } from './state/gameSlice'
import BattleAreaComponent from './BattleAreaComponent';

interface GameComponentProps {

}

const GameComponent: React.FC<GameComponentProps> = () => {
    const dispatch = useDispatch();
    const players = useSelector(selectPlayers);
    const trumpSuit = useSelector(selectTrumpSuit);
    const round = useSelector(selectRound);
    const game = useSelector(selectGame);
    const dealer = useSelector(selectDealer)

    const dealCardsHandler = () => {
        dispatch(dealCards())
    }
    const setTrumpSuitHandler = () => {
        dispatch(setTrumpSuit())
    }

    const readyToDeal = (round.roundState === 'Initial' || round.roundState === '0Cards') 
    && dealer !== undefined && (round.roundPot >= (game.numberOfPlayers - 1)) || (round.roundState === '2Cards' && trumpSuit !== undefined)
    
    console.log(typeof round.roundPot, round.roundPot);
    console.log(typeof game.numberOfPlayers, game.numberOfPlayers);
    return (
        <div>
            <div>
                <h1>Game</h1>
            </div>
            <div>
                <h2>Trump Suit </h2>
                <h3>{trumpSuit?.suit}</h3>
                <div>Round pot {round.roundPot}</div>
                <div>Round state {round.roundState}</div>
                <div>Number of players {game.numberOfPlayers}</div>
                <div>Lead suit: {round.turns[round.currentTurn]?.suit} {round.suitLed}</div>
            </div>
            <div>
                <button disabled={!readyToDeal} onClick={() => dealCardsHandler()} >Deal</button>
                <button disabled={round.roundState !== '2Cards' || trumpSuit !== undefined} onClick={() => setTrumpSuitHandler()}>Set Trump Suit</button>
            </div>
            <div>
                {/* Add player components */}
                {players.map((player, index) => (
                    <PlayerComponent key={`player-${player.id}`} playerId={player.id}/>
                ))}
            </div>
            <BattleAreaComponent />
        </div>
    );
};

export default GameComponent;
