import React, { useRef } from "react";
import { Card, PlayedCard, Player } from "./Types";
import {
  toggleSelectCard,
  playCard,
  isCardPlayable,
  discardCard,
  selectDeck,
  isCardSelectable,
  selectTrumpForSale,
  selectTrumpSuit,
  selectRound,
} from "./state/gameSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./state/store";
import { Button, IconButton, Tooltip, VStack } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

type CardComponentProps = {
  card: Card;
  player: Player;
  onCardPlayed: (playedCard: PlayedCard) => void;
};

const CardComponent: React.FC<CardComponentProps> = ({
  onCardPlayed,
  card,
  player,
}) => {
  const dispatch = useDispatch();
  const cardRef = useRef(null);
  const toggleSelected = () => {
    dispatch(toggleSelectCard(card.id));
  };

  const selectable = useSelector((state: RootState) =>
    isCardSelectable(state, card.id),
  );

  const trumpSuit = useSelector(selectTrumpSuit);
  const round = useSelector(selectRound);

  const isPlayable = useSelector((state: RootState) =>
    isCardPlayable(state, card.id),
  );
  const deck = useSelector((state: RootState) => selectDeck(state));
  const isTrumpForSale = useSelector(selectTrumpForSale);

  // Check if this card is the hidden trump card
  const isHiddenTrumpCard =
    round?.hiddenTrumpSuit &&
    card.id === trumpSuit?.id &&
    round.roundState === "2Cards";

  if (card.isDiscarded) {
    return null;
  }

  const playCardHandler = () => {
    // If card is selectable, toggle selection instead of playing
    if (selectable && !isTrumpForSale) {
      toggleSelected();
      return;
    }

    if (cardRef.current !== null) {
      const rectRef = (cardRef.current as HTMLElement).getBoundingClientRect();
      onCardPlayed({
        cardId: card.id,
        playerId: player.id,
        rectRef: rectRef,
      });
      dispatch(playCard({ cardId: card.id, playerId: player.id }));
    }
  };

  const discardCardHandler = (card: Card) => {
    if (card && player) {
      dispatch(discardCard(card.id));
    }
  };

  const canDiscardCard =
    player.hand.filter((c) => {
      const pCard = deck.find((d) => d.id === c);
      return !pCard?.isDiscarded;
    }).length > 4 && player.hasExchangedCards;

  return (
    <VStack p={1}>
      <Button
        ref={cardRef}
        id={`card-inhand-${card.id}`}
        p={1}
        height={6}
        onClick={!card.isPlayed ? () => playCardHandler() : undefined}
        _disabled={{ opacity: 0.5 }}
        isDisabled={!isPlayable && !(selectable && !isTrumpForSale)}
        color={
          card.isSelected ? "white" : card.color === "Red" ? "red" : "black"
        }
        backgroundColor={card.isSelected ? "blue.600" : "white"}
        borderColor={card.suit === trumpSuit?.suit ? "yellow.300" : "black"}
        borderWidth={2}
        fontFamily={"Noticia Text"}
        fontSize={16}
        fontWeight={400}
        fontStyle={"italic"}
        cursor={
          (selectable && !isTrumpForSale) || isPlayable
            ? "pointer"
            : "not-allowed"
        }
      >
        {card.isSelected ? (
          <span
            style={{ fontSize: "1.2em" }}
            aria-label="Selected card"
            role="img"
          >
            🂠
          </span>
        ) : isHiddenTrumpCard ? (
          <span
            style={{ fontSize: "1.2em" }}
            aria-label="Hidden trump card"
            role="img"
          >
            🂠
          </span>
        ) : (
          <>
            {["Ace", "King", "Queen", "Jack"].includes(card.name)
              ? card.name.charAt(0)
              : card.name}{" "}
            <span style={{ fontSize: "1.2em" }}>&nbsp;{card.suitSymbol}</span>
          </>
        )}
      </Button>

      {player?.isDealer && canDiscardCard && (
        <Tooltip label="Discard card" fontSize="md">
          <IconButton
            aria-label="Discard Card"
            icon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              discardCardHandler(card);
            }}
          />
        </Tooltip>
      )}
    </VStack>
  );
};

export default CardComponent;
