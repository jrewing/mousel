import React, { useEffect, useState } from 'react'
import { Card, Player } from './Types';
import { isPlayersTurn, toggleSelectCard, playCard, isCardPlayable, discardCard } from "./state/gameSlice"
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
        dispatch(toggleSelectCard({card}))
    }

    const playersTurn = useSelector((state: RootState) => isPlayersTurn(state, player.id));
    const isPlayable = useSelector((state: RootState) => isCardPlayable(state, card));

    if (card.isDiscarded) {
        return null
    }

    const playCardHandler = () => {
        console.log('Playing card')
        dispatch(playCard({card, player}))
    }

    const discardCardHandler = (card: Card) => {
        if (card && player) {
            dispatch(discardCard({card}))
        }
    }

    const toString = () => {
        return `${card.value} of ${card.suit}`;
    }




    return (
        <div>
        <button onClick={() => toggleSelected()} style={{ color: card.color, border: card.isSelected ? 'inset' : 'outset' }}>
            {card.value} {card.suitSymbol} {card.isSelected ? 'selected' : ''}
        </button>
        <button disabled={!isPlayable || !playersTurn || card.isPlayed} onClick={() => playCardHandler()}>Play!</button>
        <button disabled={!player?.isDealer || (player?.hand.filter((c)=>(!c.isDiscarded)).length < 5)} onClick={() => discardCardHandler(card)}>Discard Card</button>
        </div>
    );
};

export default CardComponent;
