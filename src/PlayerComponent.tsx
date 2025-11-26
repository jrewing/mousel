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
  calculateWinner,
  newTurn,
  endRound,
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
  Badge,
} from "@chakra-ui/react";
import { PlayedCard } from "./Types";

type PlayerComponentProps = {
  playerId: number;
  onCardPlayed: (playedCard: PlayedCard) => void;
};

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

  const newTurnHandler = () => {
    dispatch(newTurn());
  };

  const newRoundHandler = () => {
    dispatch(endRound());
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

  // Get the last completed turn to check who won
  const lastTurn =
    round?.turns && round.turns.length > 0
      ? round.turns[round.turns.length - 1]
      : undefined;

  const showNewTurnButton =
    round?.roundState === "TurnOver" && lastTurn?.winner === playerId;
  const showNewRoundButton =
    (round?.roundState === "RoundOver" || round?.roundState === "GameOver") &&
    isDealer;

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
      padding={1}
      borderWidth={player?.hasTakenTrump ? 3 : 1}
      borderColor={player?.hasTakenTrump ? "yellow.400" : "gray.600"}
    >
      <CardHeader
        color="gray.200"
        fontWeight="bold"
        paddingBottom={0}
        paddingTop={1}
        fontSize="sm"
      >
        <HStack justifyContent="space-between">
          <h4 style={{ fontSize: "0.875rem", margin: 0 }}>{player?.name}</h4>
          {player?.hasTakenTrump && (
            <Badge colorScheme="yellow" fontSize="0.6em">
              Trump Taker
            </Badge>
          )}
        </HStack>
      </CardHeader>
      <CardBody padding={1}>
        <Stack divider={<StackDivider />} spacing={0.5}>
          <Card p={0.5} fontSize="xs" colorScheme="red">
            Bank: {player?.bank}ℳ
          </Card>
          <Card p={0.5} fontSize="xs" colorScheme="blue">
            Tricks: {player?.tricks}
            {player?.hasTakenTrump && player.tricks < 2 && (
              <span style={{ color: "#FFA500", marginLeft: "8px" }}>
                (needs 2)
              </span>
            )}
            {!player?.hasTakenTrump &&
              !player?.hasFolded &&
              player?.isIn &&
              player.tricks < 1 && (
                <span style={{ color: "#FFA500", marginLeft: "8px" }}>
                  (needs 1)
                </span>
              )}
          </Card>
          <HStack minH={4} justifyContent="center">
            {!player?.isAI && (
              <>
                {isDealer && readyToDeal && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => dealCardsHandler()}
                  >
                    Deal
                  </Button>
                )}

                {readyToSetTrump && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => setTrumpSuitHandler(false)}
                  >
                    Set Trump
                  </Button>
                )}
                {readyToSetTrump && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => setTrumpSuitHandler(true)}
                  >
                    Set Hidden
                  </Button>
                )}

                {readyToAddWager && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => addWagerHandler()}
                  >
                    Ante
                  </Button>
                )}
                {readyToChangeCards && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => exchangeCardsHandler()}
                  >
                    Change
                  </Button>
                )}

                {readyToFold && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => fold()}
                  >
                    Fold
                  </Button>
                )}
                {readyToFold && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => iAmIn()}
                  >
                    I&apos;m In
                  </Button>
                )}

                {dealer?.id === undefined && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    colorScheme="red"
                    onClick={() => setDealerHandler()}
                  >
                    Dealer
                  </Button>
                )}
                {!canNotTakeTrumpEarly && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => takeTrumpEarlyHandler()}
                  >
                    Take Trump Early
                  </Button>
                )}
                {!canNotTakeTrump && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => takeTrumpHandler()}
                  >
                    Take
                  </Button>
                )}
                {!canNotTakeTrump && (
                  <Button
                    size="xs"
                    fontSize="2xs"
                    padding={1}
                    height="auto"
                    onClick={() => refuseTrumpHandler()}
                  >
                    Refuse
                  </Button>
                )}
              </>
            )}
            {showNewTurnButton && (
              <Button
                size="xs"
                fontSize="2xs"
                padding={1}
                height="auto"
                colorScheme="green"
                onClick={() => newTurnHandler()}
              >
                New Turn
              </Button>
            )}
            {showNewRoundButton && (
              <Button
                size="xs"
                fontSize="2xs"
                padding={1}
                height="auto"
                colorScheme="green"
                onClick={() => newRoundHandler()}
              >
                New Round
              </Button>
            )}
            {player?.isAI && playersTurn && (
              <span style={{ color: "#90EE90", fontSize: "0.75rem" }}>
                Thinking...
              </span>
            )}
          </HStack>
          <HStack justifyContent="center" height="40px">
            {round?.turns &&
              round.turns.length > 0 &&
              round.turns[round.turns.length - 1]?.cardsPlayed
                .filter((cp) => cp.playerId === playerId)
                .map((cardPlayed) => {
                  const playedCard = deck.find(
                    (c) => c.id === cardPlayed.cardId,
                  );
                  const currentTurn = round.turns[round.turns.length - 1];
                  const winningCard =
                    trumpSuit &&
                    currentTurn &&
                    currentTurn.cardsPlayed.length > 0
                      ? calculateWinner(trumpSuit.suit, currentTurn, deck)
                      : undefined;
                  const isWinning = winningCard?.cardId === playedCard?.id;
                  const isFirstCard = cardPlayed.sequence === 1;
                  const isBothFirstAndWinning = isWinning && isFirstCard;

                  return (
                    playedCard && (
                      <Card
                        key={cardPlayed.cardId}
                        p={1}
                        fontSize="xs"
                        backgroundColor="white"
                        borderWidth={2}
                        borderColor={
                          isWinning
                            ? "yellow.400"
                            : isFirstCard
                              ? "purple.400"
                              : "blue.400"
                        }
                        outline={isBothFirstAndWinning ? "3px solid" : "none"}
                        outlineColor={
                          isBothFirstAndWinning ? "purple.400" : undefined
                        }
                        outlineOffset="-6px"
                        boxShadow={
                          isBothFirstAndWinning
                            ? "0 0 10px 2px rgba(250, 240, 137, 0.8), inset 0 0 8px 1px rgba(159, 122, 234, 0.6)"
                            : isWinning
                              ? "0 0 10px 2px rgba(250, 240, 137, 0.8)"
                              : isFirstCard
                                ? "0 0 8px 2px rgba(159, 122, 234, 0.6)"
                                : "none"
                        }
                      >
                        <span
                          style={{
                            color: playedCard.color === "Red" ? "red" : "black",
                            fontWeight: "bold",
                          }}
                        >
                          {playedCard.name} {playedCard.suitSymbol}
                        </span>
                      </Card>
                    )
                  );
                })}
          </HStack>
          <HStack spacing={1} height="30px" alignItems="flex-start">
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
            {readyToChangeCards && (
              <span
                role="img"
                aria-label="Select cards to exchange"
                title="Select cards to exchange"
                style={{
                  cursor: "help",
                  fontSize: "1.2rem",
                  alignSelf: "center",
                  marginLeft: "4px",
                }}
              >
                👈
              </span>
            )}
          </HStack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerComponent;
