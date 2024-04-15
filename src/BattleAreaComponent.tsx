import React from 'react';
import { calculateWinner, endRound, selectCurrentTurn, selectCurrentTurnNumber, selectGame, selectRound, selectTrumpSuit } from './state/gameSlice';
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
    const game = useSelector(selectGame);
    const players = game.players;
    const winner = players.find(player => player.id === currentTurn?.winner)
    const deck = game.deck

    const newRoundHandler = () => {
        console.log('New round')
        dispatch(endRound())
    }


    const allPlayersAreReady = players.every(player => player.hasFolded || player.isIn)

    const currentWinnerCard = trumpSuit && currentTurn && currentTurn.cardsPlayed.length > 0 ? calculateWinner(trumpSuit?.suit, currentTurn, deck) : undefined

    const newRoundButtonStyle = (currentRound?.roundState === 'RoundOver' || currentRound?.roundState === 'GameOver') ? {
        backgroundColor: 'green'
    } : {
        backgroundColor: 'grey'
    }

    return (
        <div id="battleArea">
            <div id="roundInfo">
                    <>
                    <h3>Round number {currentRound?.roundNumber}</h3>
                    <h3>Winner: {winner?.name}</h3>
                    <h4>Turn number: {turnNumber}</h4>
                    <h3>Trump Suit {currentRound?.hiddenTrumpSuit && !allPlayersAreReady ? 'FORDEKT' : trumpSuit?.suit}</h3>
                    <div>Round pot {currentRound?.roundPot}</div>
                    <div>Round state {currentRound?.roundState}</div>
                    <div>Lead suit: {currentRound?.turns.at(-1)?.suit} </div>
                    <div>
                        <button style={newRoundButtonStyle} disabled={!(currentRound?.roundState === 'RoundOver' || currentRound?.roundState === 'GameOver')} onClick={() => newRoundHandler()}>
                            New Round
                        </button>
                    </div>
                    </>

            </div>
            <div id="cardsInTurn">
                {currentTurn && currentTurn.cardsPlayed.map((cardPlayer, index) => {
                    const card = game.deck.find(c => c.id === cardPlayer.cardId)

                    return (
                    <div key={index} style={card?.id === currentWinnerCard?.cardId ? { backgroundColor: 'green' } : {}}>
                        {card?.name} of {card?.suit}
                    </div>)
                }
                )}
            </div>
        </div>
    );
};

export default BattleAreaComponent;