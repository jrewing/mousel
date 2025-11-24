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

  function sortHand(hand: number[] | undefined) {
    if (!hand) {
      return [];
    }
    //Sort a copy
    const handCopy = [...hand];
    const orderedHand = handCopy.sort((a, b) => {
      const cardA = deck.find((c) => c.id === a);
      const cardB = deck.find((c) => c.id === b);
      if (cardA === undefined || cardB === undefined) {
        return 0;
      }
      if (cardA?.suit === cardB?.suit) {
        return cardA.value - cardB.value;
      }
      if (cardA?.suit === trumpSuit?.suit) {
        return -1;
      }
      if (cardB?.suit === trumpSuit?.suit) {
        return 1;
      }
      if (cardA?.suit === "Hearts" || cardA?.suit === "Diamonds") {
        return -1;
      }
      if (cardB?.suit === "Hearts" || cardB?.suit === "Diamonds") {
        return 1;
      }
      return 0;
    });
    return orderedHand;
  }
  //Sort the hand by suit and value. Trump suit is always first. Alternate red and black suits.
  const orderedHand = sortHand(player?.hand);

  return (
    <Card
      className={playersTurn ? "active-player" : ""}
      key={playerId}
      backgroundColor="green.800"
      padding={2}
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
            {!player?.isAI && (
              <>
                {isDealer && readyToDeal && (
                  <Button size="xs" onClick={() => dealCardsHandler()}>
                    Deal
                  </Button>
                )}

                {readyToSetTrump && (
                  <Button size="xs" onClick={() => setTrumpSuitHandler(false)}>
                    Set Trump Suit
                  </Button>
                )}
                {readyToSetTrump && (
                  <Button size="xs" onClick={() => setTrumpSuitHandler(true)}>
                    Set Trump Suit hidden
                  </Button>
                )}

                {readyToAddWager && (
                  <Button size="xs" onClick={() => addWagerHandler()}>
                    Post ante
                  </Button>
                )}
                {readyToChangeCards && (
                  <Button size="xs" onClick={() => exchangeCardsHandler()}>
                    Change cards
                  </Button>
                )}

                {readyToFold && (
                  <Button size="xs" onClick={() => fold()}>
                    Fold
                  </Button>
                )}
                {readyToFold && (
                  <Button size="xs" onClick={() => iAmIn()}>
                    I am in
                  </Button>
                )}

                {dealer?.id === undefined && (
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => setDealerHandler()}
                  >
                    Set Dealer
                  </Button>
                )}
                {!canNotTakeTrumpEarly && (
                  <Button size="xs" onClick={() => takeTrumpEarlyHandler()}>
                    Take Trump Early
                  </Button>
                )}
                {!canNotTakeTrump && (
                  <Button size="xs" onClick={() => takeTrumpHandler()}>
                    Take Trump
                  </Button>
                )}
                {!canNotTakeTrump && (
                  <Button size="xs" onClick={() => refuseTrumpHandler()}>
                    Refuse Trump
                  </Button>
                )}
              </>
            )}
            {player?.isAI && playersTurn && (
              <span style={{ color: "#90EE90", fontSize: "0.75rem" }}>
                Thinking...
              </span>
            )}
          </HStack>
          <HStack spacing={2}>
            {orderedHand.map((cardId, index: number) => {
              const card = deck.find((c) => c.id === cardId);
              return (
                card &&
                !card.isDiscarded &&
                !card.isPlayed && (
                  <CardComponent
                    onCardPlayed={onCardPlayed}
                    key={index}
                    card={card}
                    player={player!}
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
