
import React, { useState } from 'react'
import { Card, Player } from './Types'
import CardComponent from './CardComponent';
import { useDispatch, useSelector } from "react-redux"
import { selectPlayer, setDealer } from './state/gameSlice'
import {RootState} from "./state/store"

interface PlayerComponentProps {
playerId: number;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({playerId}) => {
    const dispatch = useDispatch();
    //Load player hand from the player redux state
    const player = useSelector((state: RootState) => selectPlayer(state, playerId)); // use RootState to type the state

    const exchangeCards = () => {
        //gameHook.exchangeCards(playerHand);
    }

    const setDealerHandler = () => {
        dispatch(setDealer(playerId));
    }

    const fold = () => {
        //setPlayerHasFolded(true);
    }
    console.log(player);
    return (
        <div>
            { player?.hand.map((card: Card, index: number) => (
                <CardComponent key={index} card={card} />
            ))}
            {/* Add buttons for player actions */}
            <button onClick={() => exchangeCards()}>Continue</button>
            <button onClick={() => fold()}>Fold</button>
            <button onClick={() => setDealerHandler()}>Set Dealer</button>
        </div>
    );
};

export default PlayerComponent;
