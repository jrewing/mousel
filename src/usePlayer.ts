// usePlayer.ts
import { useState } from 'react';
import { Card } from './Types';

interface PlayerProps {
    id: number;
    name: string;
    hand: Card[];
    score?: number;
    hasFolded?: boolean;
    isDealer?: boolean;
    isSmallBlind?: boolean;
    hasExchangedCards?: boolean;
}

export const usePlayer = ({ id, name, hand, score = 0, hasFolded = false, isDealer = false, isSmallBlind = false, hasExchangedCards = false }: PlayerProps) => {

}
