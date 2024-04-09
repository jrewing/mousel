
import React from 'react'
import { Card } from './Types'
import CardComponent from './CardComponent';
import { useDispatch, useSelector } from "react-redux"
import { addWager, selectPlayer, setDealer, exchangeCards, selectRound, selectPlayerWhoShouldExchangeCards, selectDealerTookTrump, selectTrumpForSale, selectPlayerTookTrump, takeTrumpEarly, takeTrump, playerFolds, refuseTrump, selectPlayerWhoCanTakeTrump, selectTrumpSuit, selectGame, dealCards, setTrumpSuit, selectDeck } from './state/gameSlice'
import { selectDealer } from './state/gameSlice'
import {RootState} from "./state/store"


interface PlayerComponentProps {
playerId: number;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({playerId}) => {
    const dispatch = useDispatch();
    //Load player hand from the player redux state
    const player = useSelector((state: RootState) => selectPlayer(state, playerId));
    const dealer = useSelector(selectDealer)
    const round = useSelector(selectRound)
    const isDealer = dealer?.id === playerId;
    const playerWhoShouldExcangeCards = useSelector(selectPlayerWhoShouldExchangeCards)
    const dealerTookTrump = useSelector(selectDealerTookTrump)
    const trumpForSale = useSelector(selectTrumpForSale)
    const playerTookTrump = useSelector(selectPlayerTookTrump)
    const isItMyTurnToTakeTrump = useSelector(selectPlayerWhoCanTakeTrump)?.id === playerId;
    const canNotTakeTrumpEarly = !isItMyTurnToTakeTrump || playerTookTrump !== undefined || dealerTookTrump || round?.roundState !== '2Cards' || !isDealer || round.trumpSuit === undefined || !trumpForSale || player?.hasFolded
    const canNotTakeTrump = !isItMyTurnToTakeTrump || playerTookTrump !== undefined || dealerTookTrump || round?.roundState !== '4Cards' || !trumpForSale || player?.hasFolded
    const currentRound = useSelector((state: RootState) => state.game.currentRound);
    const trumpSuit = useSelector(selectTrumpSuit);
    const game = useSelector(selectGame);
    const deck = useSelector(selectDeck)

    const addWagerHandler = () => {
        const amount = 1;
        if (player) {
            dispatch(addWager({player, amount}));
        }
    }

    const dealCardsHandler = () => {
        dispatch(dealCards())
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
            dispatch(takeTrump(player.id))
        }
    }

    const refuseTrumpHandler = () => {
        if (player) {
            dispatch(refuseTrump(player.id))
        }
    }

    const fold = () => {
        if (!player) return;
        dispatch(playerFolds(player.id))
    }
        const setTrumpSuitHandler = () => {
        dispatch(setTrumpSuit())
    }

const readyToDeal =
    (round?.roundState === 'Initial' || round?.roundState === '0Cards')
    && (dealer !== undefined
    && (round.roundPot >= (game.numberOfPlayers - 1)))
    || (round?.roundState === '2Cards' && trumpSuit !== undefined)

    return (
        <div>
            { player?.hand.map((cardId, index: number) => {
                const card = deck.find((c) => c.id === cardId)
                return card && !card.isDiscarded && !card.isPlayed && <CardComponent key={index} card={card} player={player} />
            })}
            <div>{player?.name}</div>
            <div>{player?.bank}ℳ</div>
            <button disabled={!isDealer || !readyToDeal} onClick={() => dealCardsHandler()}>Deal</button>
            <button disabled={!isDealer || round?.roundState !== '2Cards' || trumpSuit !== undefined} onClick={() => setTrumpSuitHandler()}>Set Trump Suit</button>
            <button disabled={!dealer || player?.isSmallBlind || isDealer || currentRound > 0} onClick={() => addWagerHandler()}>Add wager</button>
            <button disabled={player?.id !== playerWhoShouldExcangeCards?.id || player?.hasExchangedCards || round?.roundState !== '4Cards' || player?.hasFolded} onClick={() => exchangeCardsHandler()}>Change cards</button>
            <button disabled={player?.hasFolded || round?.roundState !== '4Cards' || player?.hasExchangedCards} onClick={() => fold()}>Fold</button>
            <button disabled={dealer?.id !== undefined} style={isDealer ? {border: '1px solid red'} : {border: '1px solid black'}} onClick={() => setDealerHandler()}>Set Dealer</button>
            <button disabled={canNotTakeTrumpEarly} onClick={() => takeTrumpEarlyHandler()}>Take Trump Early</button>
            <button disabled={canNotTakeTrump} onClick={() => takeTrumpHandler()}>Take Trump</button>
            <button disabled={canNotTakeTrump} onClick={() => refuseTrumpHandler()}>Refuse Trump</button>

        </div>
    );
};

export default PlayerComponent;
