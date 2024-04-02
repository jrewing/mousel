import React, { useEffect, useState } from 'react'
import { Card, Player } from './Types';
import { isPlayersTurn, selectCard, playCard, isCardPlayable } from "./state/gameSlice"
import { useDispatch, useSelector } from "react-redux"
import {RootState} from "./state/store"

interface CardComponentProps {
    card: Card;
    player: Player
}

const CardComponent: React.FC<CardComponentProps> = (
    { card, player }
) => {
    const dispatch = useDispatch();
    const toggleSelected = () => {
        dispatch(selectCard({card}))
    }

    const playersTurn = useSelector((state: RootState) => isPlayersTurn(state, player.id));

    const isPlayable = useSelector((state: RootState) => isCardPlayable(state, card));

    const playCardHandler = () => {
        console.log('Playing card')
        dispatch(playCard({card, player}))
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
        <div>
        <button onClick={() => toggleSelected()} style={{ color: card.color, border: card.isSelected ? 'inset' : 'outset' }}>
            {card.value} {card.suitSymbol} {card.isSelected ? 'selected' : ''}
        </button>
        <button disabled={!isPlayable || !playersTurn || card.isPlayed} onClick={() => playCardHandler()}>Play!</button>
        </div>
    );
};

export default CardComponent;
