import React from "react";
import CardComponent from "./CardComponent";
import { useDispatch, useSelector } from "react-redux";
import {
  addWager,
  selectPlayer,
  setDealer,
  exchangeCards,
  selectRound,
  selectPlayerWhoShouldExchangeCards,
  selectDealerTookTrump,
  selectTrumpForSale,
  selectPlayerTookTrump,
  takeTrumpEarly,
  takeTrump,
  playerFolds,
  refuseTrump,
  selectPlayerWhoCanTakeTrump,
  selectTrumpSuit,
  selectGame,
  dealCards,
  setTrumpSuit,
  selectDeck,
  selectPlayerWhoCanFoldOrStay,
  playerIsIn,
  isPlayersTurn,
} from "./state/gameSlice";
import { selectDealer } from "./state/gameSlice";
import { RootState } from "./state/store";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Stack,
  StackDivider,
} from "@chakra-ui/react";
import { PlayedCard } from "./Types";

interface PlayerComponentProps {
  playerId: number;
  onCardPlayed: (playedCard: PlayedCard) => void;
}

const PlayerComponent: React.FC<PlayerComponentProps> = ({
  playerId,
  onCardPlayed,
}) => {
  const dispatch = useDispatch();
  const player = useSelector((state: RootState) =>
    selectPlayer(state, playerId),
  );
  const dealer = useSelector(selectDealer);
  const round = useSelector(selectRound);
  const isDealer = dealer?.id === playerId;
  const playerWhoShouldExcangeCards = useSelector(
    selectPlayerWhoShouldExchangeCards,
  );
  const dealerTookTrump = useSelector(selectDealerTookTrump);
  const trumpForSale = useSelector(selectTrumpForSale);
  const playerTookTrump = useSelector(selectPlayerTookTrump);
  const isItMyTurnToTakeTrump =
    useSelector(selectPlayerWhoCanTakeTrump)?.id === playerId;
  const canNotTakeTrumpEarly =
    !isItMyTurnToTakeTrump ||
    playerTookTrump !== undefined ||
    dealerTookTrump ||
    round?.roundState !== "2Cards" ||
    !isDealer ||
    round.trumpSuit === undefined ||
    !trumpForSale ||
    player?.hasFolded;
  const canNotTakeTrump =
    !isItMyTurnToTakeTrump ||
    playerTookTrump !== undefined ||
    dealerTookTrump ||
    round?.roundState !== "4Cards" ||
    !trumpForSale ||
    player?.hasFolded;
  const currentRound = useSelector(
    (state: RootState) => state.game.currentRound,
  );
  const trumpSuit = useSelector(selectTrumpSuit);
  const game = useSelector(selectGame);
  const deck = useSelector(selectDeck);
  const playersTurnToFold = useSelector(selectPlayerWhoCanFoldOrStay);

  const addWagerHandler = () => {
    const amount = 1;
    if (player) {
      dispatch(addWager({ player, amount }));
    }
  };

  const dealCardsHandler = () => {
    dispatch(dealCards());
  };

  const exchangeCardsHandler = () => {
    if (player) {
      dispatch(exchangeCards(player));
    }
  };

  const setDealerHandler = () => {
    dispatch(setDealer(playerId));
  };

  const takeTrumpEarlyHandler = () => {
    if (player) {
      dispatch(takeTrumpEarly(player.id));
    }
  };

  const takeTrumpHandler = () => {
    if (player) {
      dispatch(takeTrump(player.id));
    }
  };

  const refuseTrumpHandler = () => {
    if (player) {
      dispatch(refuseTrump(player.id));
    }
  };

  const fold = () => {
    if (!player) return;
    dispatch(playerFolds(player.id));
  };

  const setTrumpSuitHandler = (hidden: boolean) => {
    dispatch(setTrumpSuit({ hidden }));
    if (hidden) {
      dispatch(takeTrumpEarly(playerId));
    }
  };

  const iAmIn = () => {
    if (player) {
      dispatch(playerIsIn(player.id));
    }
  };

  const readyToDeal =
    ((round?.roundState === "Initial" || round?.roundState === "0Cards") &&
      dealer !== undefined &&
      round.roundPot >= game.numberOfPlayers - 1) ||
    (round?.roundState === "2Cards" && trumpSuit !== undefined);

  const readyToSetTrump =
    isDealer && round?.roundState === "2Cards" && trumpSuit === undefined;
  const readyToAddWager =
    !player?.isSmallBlind && currentRound === 0 && !isDealer && dealer;
  const readyToChangeCards =
    player?.id === playerWhoShouldExcangeCards?.id &&
    !player?.hasExchangedCards &&
    round?.roundState === "4Cards" &&
    !player?.hasFolded;
  const readyToFold = player?.id === playersTurnToFold?.id;

  const playersTurn = useSelector((state: RootState) =>
    isPlayersTurn(state, playerId),
  );

  const border = playersTurn ? "3px solid green" : "3px solid black";

  return (
    <Card
      className={playersTurn ? "active-player" : ""}
      key={playerId}
      backgroundColor="green.800"
      padding="1vh"
    >
      <CardHeader color="gray.200" fontWeight="bold" paddingBottom={0}>
        <h4>{player?.name}</h4>
      </CardHeader>
      <CardBody>
        <Stack divider={<StackDivider />} spacing="1">
          <Card p={1} colorScheme="red">
            Bank: {player?.bank}ℳ
          </Card>
          <HStack minH={6} justifyContent="center">
            {isDealer && readyToDeal && (
              <Button onClick={() => dealCardsHandler()}>Deal</Button>
            )}

            {readyToSetTrump && (
              <Button onClick={() => setTrumpSuitHandler(false)}>
                Set Trump Suit
              </Button>
            )}
            {readyToSetTrump && (
              <Button onClick={() => setTrumpSuitHandler(true)}>
                Set Trump Suit hidden
              </Button>
            )}

            {readyToAddWager && (
              <Button onClick={() => addWagerHandler()}>Add wager</Button>
            )}
            {readyToChangeCards && (
              <Button onClick={() => exchangeCardsHandler()}>
                Change cards
              </Button>
            )}

            {readyToFold && (
              <Button p={1} h={6} onClick={() => fold()}>
                Fold
              </Button>
            )}
            {readyToFold && <Button onClick={() => iAmIn()}>I am in</Button>}

            {dealer?.id === undefined && (
              <Button
                p={1}
                h={6}
                colorScheme="red"
                onClick={() => setDealerHandler()}
              >
                Set Dealer
              </Button>
            )}
            {!canNotTakeTrumpEarly && (
              <Button onClick={() => takeTrumpEarlyHandler()}>
                Take Trump Early
              </Button>
            )}
            {!canNotTakeTrump && (
              <Button onClick={() => takeTrumpHandler()}>Take Trump</Button>
            )}
            {!canNotTakeTrump && (
              <Button onClick={() => refuseTrumpHandler()}>Refuse Trump</Button>
            )}
          </HStack>
          <HStack spacing={1}>
            {player?.hand.map((cardId, index: number) => {
              const card = deck.find((c) => c.id === cardId);
              return (
                card &&
                !card.isDiscarded &&
                !card.isPlayed && (
                  <CardComponent
                    onCardPlayed={onCardPlayed}
                    key={index}
                    card={card}
                    player={player}
                  />
                )
              );
            })}
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerComponent;
