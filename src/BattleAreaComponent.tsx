import React from 'react';
import { selectCurrentTurn, selectCurrentTurnNumber, selectRound } from './state/gameSlice';
import { useSelector } from 'react-redux';

interface BattleAreaComponentProps {
    // Add any props you need for your component here
}

const BattleAreaComponent: React.FC<BattleAreaComponentProps> = () => {

    const currentTurn = useSelector(selectCurrentTurn);
    const currentRound = useSelector(selectRound)
    const turnNumber = useSelector(selectCurrentTurnNumber)

    return (
        <div>
            <h2>Battle area</h2>
            {currentTurn && currentTurn.winner && (
                <>
                <h3>Round number {currentRound.roundNumber}</h3>
                <h3>Winner: {currentTurn.winner.id}</h3>
                <h4>Turn number: {turnNumber}</h4>
                </>
            )}
            {currentTurn && currentTurn.cardsPlayed.map((card, index) => (
                <div key={index}>
                    {card.card.value} of {card.card.suit}
                </div>
            ))}
        </div>
    );
};

export default BattleAreaComponent;