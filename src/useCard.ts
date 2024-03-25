import { Card, Color, Suit, SuitSymbol, Value } from './Types'
import { useState } from "react"

type CardProps = {
    value: Value;
    suit: Suit;
    color: Color;
    isSelected: boolean;
    isSelectable: boolean;
    suitSymbol: SuitSymbol;
}

type CardHooks = {
    toggleSelected: () => void;
    toggleIsSelectable: () => void;
    toString: () => string;
}

export const useCard = (card: CardProps):CardHooks => {
    const [isSelected, setIsSelected] = useState(card.isSelected);
    const [isSelectable, setIsSelectable] = useState(card.isSelectable);

      const toggleSelected = () => {
        setIsSelected(!isSelected);
    }

    const toggleIsSelectable = () => {
          setIsSelectable(!isSelectable);
    }

    const toString = () => {
        return `${card.value} of ${card.suit}`;
    }

    return {
        toggleIsSelectable,
        toggleSelected,
        toString
    };
}
