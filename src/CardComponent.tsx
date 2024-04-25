import React, { useRef } from "react";
import { Card, PlayedCard, Player } from "./Types";
import {
  isPlayersTurn,
  toggleSelectCard,
  playCard,
  isCardPlayable,
  discardCard,
  selectDeck,
  isCardSelectable,
  selectTrumpForSale,
} from "./state/gameSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./state/store";
import { Button, IconButton, Tooltip, VStack } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

interface CardComponentProps {
  card: Card;
  player: Player;
  onCardPlayed: (playedCard: PlayedCard) => void;
}

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

  const playersTurn = useSelector((state: RootState) =>
    isPlayersTurn(state, player.id),
  );
  const isPlayable = useSelector((state: RootState) =>
    isCardPlayable(state, card.id),
  );
  const deck = useSelector((state: RootState) => selectDeck(state));
  const isTrumpForSale = useSelector(selectTrumpForSale);

  if (card.isDiscarded) {
    return null;
  }

  const playCardHandler = () => {
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
        id="card-inhand-${card.id}"
        p={1}
        height={6}
        onClick={!card.isPlayed ? () => playCardHandler() : undefined}
        _disabled={{ opacity: 0.5 }}
        isDisabled={!isPlayable}
        color={card.color === "Red" ? "red" : "black"}
      >
        {card.name.charAt(0)} {card.suitSymbol}
      </Button>
      {!isTrumpForSale && selectable && (
        <input
          onChange={() => toggleSelected()}
          checked={card.isSelected}
          type="checkbox"
        />
      )}

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
