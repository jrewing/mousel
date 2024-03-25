import React, { useEffect, useState } from 'react'
import { Card } from './Types';
import { selectCard } from "./state/gameSlice"
import { useDispatch } from "react-redux"

interface CardComponentProps {
    card: Card;
}

const CardComponent: React.FC<CardComponentProps> = (
    {  card }
) => {
    const dispatch = useDispatch();
    const toggleSelected = () => {
        console.log('Toggling card')
        dispatch(selectCard({card}))
    }

    const toggleIsSelectable = () => {

    }

    const toString = () => {
        return `${card.value} of ${card.suit}`;
    }

    useEffect(() => {
        console.log(`Card ${card.value} ${card.suitSymbol} ${card.isSelected ? 'selected' : 'Not selected'}`);
    }, [card.isSelected, card.suitSymbol, card.value]);

    return (
        <button onClick={() => toggleSelected()} style={{ color: card.color, border: card.isSelected ? 'inset' : 'auto' }}>
            {card.value} {card.suitSymbol} {card.isSelected ? 'selected' : 'Not selected'}
        </button>
    );
};

export default CardComponent;
