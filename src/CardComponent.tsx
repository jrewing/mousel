import React, { useEffect, useState } from 'react'
import { Card, Player } from './Types';
import { isPlayersTurn, toggleSelectCard, playCard, isCardPlayable, discardCard, selectCard, selectDeck, isCardSelectable, selectGame, selectTrumpForSale } from "./state/gameSlice"
import { useDispatch, useSelector } from "react-redux"
import {RootState} from "./state/store"
import { stat } from 'fs';

interface CardComponentProps {
    card: Card;
    player: Player
}

const CardComponent: React.FC<CardComponentProps> = (
    { card, player }
) => {
    const dispatch = useDispatch();

    const toggleSelected = () => {
        dispatch(toggleSelectCard(card.id))
    }

    const selectable = useSelector((state: RootState) => isCardSelectable(state, card.id));

    const playersTurn = useSelector((state: RootState) => isPlayersTurn(state, player.id));
    const isPlayable = useSelector((state: RootState) => isCardPlayable(state, card.id));
    const deck = useSelector((state: RootState) => selectDeck(state))
    const isTrumpForSale = useSelector(selectTrumpForSale)


    if (card.isDiscarded) {
        return null
    }

    const playCardHandler = () => {
        console.log('Playing card')
        dispatch(playCard({cardId: card.id, playerId: player.id}))
    }

    const discardCardHandler = (card: Card) => {
        if (card && player) {
            dispatch(discardCard(card.id))
        }
    }

    const canDiscardCard = player.hand.filter((c)=> {
        const pCard = deck.find((d) => d.id === c)
        return !pCard?.isDiscarded
    }).length > 4 && player.hasExchangedCards

    const toString = () => {
        return `${card.name} of ${card.suit}`;
    }


    console.log('CardComponent', card)

    return (
    <div>
        <button onClick={isPlayable && playersTurn && !card.isPlayed ? () => playCardHandler() : undefined} style={{ color: card.color, border: card.isSelected ? 'inset' : 'outset' }}>
            {card.name} {card.suitSymbol}
        </button>
        {!isTrumpForSale && selectable && <input onChange={() => toggleSelected()} checked={card.isSelected} type="checkbox" />}
        {player?.isDealer && canDiscardCard && <button onClick={(e) => { e.stopPropagation(); discardCardHandler(card); }}>Discard Card</button>}
    </div>
);
};

export default CardComponent;
