import React from 'react';
import { endRound, selectCurrentTurn, selectCurrentTurnNumber, selectGame, selectRound, selectTrumpSuit } from './state/gameSlice';
import { useDispatch, useSelector } from 'react-redux';

interface BattleAreaComponentProps {
    // Add any props you need for your component here
}

const BattleAreaComponent: React.FC<BattleAreaComponentProps> = () => {
const dispatch = useDispatch();
    const currentTurn = useSelector(selectCurrentTurn);
    const currentRound = useSelector(selectRound)
    const turnNumber = useSelector(selectCurrentTurnNumber)
    const trumpSuit = useSelector(selectTrumpSuit);
    const round = useSelector(selectRound);
    const game = useSelector(selectGame);
    const players = game.players;
    const winner = players.find(player => player.id === currentTurn?.winner)

    const newRoundHandler = () => {
        console.log('New round')
        //dispatch(newRound())
        dispatch(endRound())
    }

    return (
        <div id="battleArea">
            <div id="roundInfo">
                    <>
                    <h3>Round number {currentRound?.roundNumber}</h3>
                    <h3>Winner: {winner?.name}</h3>
                    <h4>Turn number: {turnNumber}</h4>
                    <h3>Trump Suit {trumpSuit?.suit}</h3>
                    <div>Round pot {round?.roundPot}</div>
                    <div>Round state {round?.roundState}</div>
                    <div>Number of players {game.numberOfPlayers}</div>
                    <div>Lead suit: {round?.turns.at(-1)?.suit} </div>
                    <div><button disabled={!(currentRound?.roundState === 'RoundOver')} onClick={() => newRoundHandler()}>New Round</button></div>
                    </>

            </div>
            <div id="cardsInTurn">
                {currentTurn && currentTurn.cardsPlayed.map((cardPlayer, index) => {
                    const card = game.deck.find(c => c.id === cardPlayer.cardId)

                    return (<div key={index}>
                        {card?.value} of {card?.suit}
                    </div>)
                }
                )}
            </div>
        </div>
    );
};

export default BattleAreaComponent;