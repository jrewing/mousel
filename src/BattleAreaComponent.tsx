import React from 'react';
import { selectCurrentTurn } from './state/gameSlice';
import { useSelector } from 'react-redux';

interface BattleAreaComponentProps {
    // Add any props you need for your component here
}

const BattleAreaComponent: React.FC<BattleAreaComponentProps> = () => {

    const currentTurn = useSelector(selectCurrentTurn);

    return (
        <div>
            <h2>Battle area</h2>
            {currentTurn && currentTurn.winner && (
                <>
                <h3>Winner: {currentTurn.winner.id}</h3>
                <h4>Turn number: {currentTurn.turnNumber}</h4>
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