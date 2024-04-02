
import React, { useState } from 'react'
import { Card, Player } from './Types'
import CardComponent from './CardComponent';
import { useDispatch, useSelector } from "react-redux"
import { addWager, selectPlayer, setDealer, exchangeCards, selectRound, selectPlayerWhoShouldExchangeCards, selectDealerTookTrump, selectTrumpForSale, selectPlayerTookTrump, takeTrumpEarly, takeTrump } from './state/gameSlice'
import { selectDealer } from './state/gameSlice'
import {RootState} from "./state/store"
import { idText } from 'typescript';

interface PlayerComponentProps {
playerId: number;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({playerId}) => {
    const dispatch = useDispatch();
    //Load player hand from the player redux state
    const player = useSelector((state: RootState) => selectPlayer(state, playerId)); // use RootState to type the state
    const dealer = useSelector(selectDealer)
    const round = useSelector(selectRound)
    const isDealer = dealer?.id === playerId;
    const playerWhoShouldExcangeCards = useSelector(selectPlayerWhoShouldExchangeCards)
    
    const dealerTookTrump = useSelector(selectDealerTookTrump)
    const trumpForSale = useSelector(selectTrumpForSale)
    const playerTookTrump = useSelector(selectPlayerTookTrump)

    const canTakeTrumpEarly = isDealer && round.roundState === '2Cards' && trumpForSale;

    const currentRound = useSelector((state: RootState) => state.game.currentRound);

    const addWagerHandler = () => {
        const amount = 1;
        if (player) {
            dispatch(addWager({player, amount}));
        }
    }
    const exchangeCardsHandler = () => {
        if (player) {
            dispatch(exchangeCards(player));
        }
    }

    const setDealerHandler = () => {
        dispatch(setDealer(playerId));
    }

    const takeTrumpEarlyHandler = () => {
        if (player) {
            dispatch(takeTrumpEarly({ player: player }))        
        }
    }

    const takeTrumpHandler = () => {
        if (player) {
            dispatch(takeTrump({ player: player }))        
        }
    }

    const refuseTrumpHandler = () => {
        // dispatch(takeTrump())        
    }

    const fold = () => {
        //setPlayerHasFolded(true);
    }

    return (
        <div>
            { player?.hand.map((card: Card, index: number) => (
                <CardComponent key={index} card={card} player={player} />
            ))}
            <div>Bank: {player?.bank}</div>
            
            <button disabled={!dealer || player?.isSmallBlind || isDealer || currentRound > 0} onClick={() => addWagerHandler()}>Add wager</button>
            <button disabled={player?.id !== playerWhoShouldExcangeCards?.id || player?.hasExchangedCards || round.roundState !== '4Cards'} onClick={() => exchangeCardsHandler()}>Change cards</button>
            <button onClick={() => fold()}>Fold</button>
            <button disabled={dealer?.id !== undefined} style={isDealer ? {border: '1px solid red'} : {border: '1px solid black'}} onClick={() => setDealerHandler()}>Set Dealer</button>
            <button disabled={round.roundState !== '2Cards' || !isDealer} onClick={() => takeTrumpEarlyHandler()}>Take Trump Early</button>
            <button disabled={round.roundState !== '2Cards' || !isDealer} onClick={() => refuseTrumpHandler()}>Refuse Trump</button>
            <button disabled={round.roundState !== '4Cards' || !trumpForSale} onClick={() => takeTrumpHandler()}>Take Trump</button>
        </div>
    );
};

export default PlayerComponent;
