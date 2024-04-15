
import React from 'react'
import { Card } from './Types'
import CardComponent from './CardComponent';
import { useDispatch, useSelector } from "react-redux"
import { addWager, selectPlayer, setDealer, exchangeCards, selectRound, selectPlayerWhoShouldExchangeCards, selectDealerTookTrump, selectTrumpForSale, selectPlayerTookTrump, takeTrumpEarly, takeTrump, playerFolds, refuseTrump, selectPlayerWhoCanTakeTrump, selectTrumpSuit, selectGame, dealCards, setTrumpSuit, selectDeck, selectPlayerWhoCanFoldOrStay, playerIsIn, isPlayersTurn } from './state/gameSlice'
import { selectDealer } from './state/gameSlice'
import {RootState} from "./state/store"


interface PlayerComponentProps {
playerId: number;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({playerId}) => {
    const dispatch = useDispatch();
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
    const playersTurnToFold = useSelector(selectPlayerWhoCanFoldOrStay)


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
            dispatch(takeTrumpEarly(player.id))
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

    const setTrumpSuitHandler = (hidden: boolean) => {
        dispatch(setTrumpSuit({hidden}))
        if (hidden) {
            dispatch(takeTrumpEarly(playerId))
        }
    }

    const iAmIn = () => {
        if (player) {
            dispatch(playerIsIn(player.id))
        }
    }


    const readyToDeal =
        (round?.roundState === 'Initial' || round?.roundState === '0Cards')
        && (dealer !== undefined
        && (round.roundPot >= (game.numberOfPlayers - 1)))
        || (round?.roundState === '2Cards' && trumpSuit !== undefined)

    const readyToSetTrump = isDealer && round?.roundState === '2Cards' && trumpSuit === undefined
    const readyToAddWager = !player?.isSmallBlind && currentRound === 0 && !isDealer && dealer
    const readyToChangeCards = player?.id === playerWhoShouldExcangeCards?.id && !player?.hasExchangedCards && round?.roundState === '4Cards' && !player?.hasFolded
    const readyToFold = player?.id === playersTurnToFold?.id

    const playersTurn = useSelector((state: RootState) => isPlayersTurn(state, playerId));

    const border = playersTurn ? '3px solid green' : '3px solid black'

    return (
        <div key={playerId} className='playerBox' style={{border}}>
            {player?.hand.map((cardId, index: number) => {
                const card = deck.find((c) => c.id === cardId)
                return card && !card.isDiscarded && !card.isPlayed && <CardComponent key={index} card={card} player={player} />
            })}
            <div>{player?.name}</div>
            <div>{player?.bank}ℳ</div>
            {isDealer && readyToDeal && <button onClick={() => dealCardsHandler()}>Deal</button>}
            {readyToSetTrump && <button onClick={() => setTrumpSuitHandler(false)}>Set Trump Suit</button>}
            {readyToSetTrump && <button onClick={() => setTrumpSuitHandler(true)}>Set Trump Suit hidden</button>}
            {readyToAddWager && <button onClick={() => addWagerHandler()}>Add wager</button>}
            {readyToChangeCards && <button onClick={() => exchangeCardsHandler()}>Change cards</button>}
            {readyToFold && <button onClick={() => fold()}>Fold</button>}
            {readyToFold && <button onClick={() => iAmIn()}>I am in</button>}
            {dealer?.id === undefined && <button style={isDealer ? {border: '1px solid red'} : {border: '1px solid black'}} onClick={() => setDealerHandler()}>Set Dealer</button>}
            {!canNotTakeTrumpEarly && <button onClick={() => takeTrumpEarlyHandler()}>Take Trump Early</button>}
            {!canNotTakeTrump && <button onClick={() => takeTrumpHandler()}>Take Trump</button>}
            {!canNotTakeTrump && <button onClick={() => refuseTrumpHandler()}>Refuse Trump</button>}
        </div>
    );
};

export default PlayerComponent;
