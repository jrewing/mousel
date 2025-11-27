import { Card, Player, Turn } from "../Types";

/**
 * AI Player Decision Engine
 * Makes decisions for AI-controlled players
 */

// Helper to get playable cards for AI
export const getPlayableCards = (
  player: Player,
  deck: Card[],
  currentTurn: Turn | undefined,
  trumpSuit: Card | undefined,
): Card[] => {
  const hand = player.hand
    .map((cardId) => deck.find((c) => c.id === cardId))
    .filter((c): c is Card => c !== undefined && !c.isPlayed && !c.isDiscarded);

  if (!currentTurn || currentTurn.cardsPlayed.length === 0) {
    // First to play - any card is playable
    return hand;
  }

  const suitLed = currentTurn.suit;
  if (!suitLed) return hand;

  // Must follow suit if possible
  const cardsOfSuitLed = hand.filter((c) => c.suit === suitLed);
  if (cardsOfSuitLed.length > 0) {
    return cardsOfSuitLed;
  }

  // If can't follow suit, must play trump if possible
  const trumpCards = hand.filter((c) => c.suit === trumpSuit?.suit);
  if (trumpCards.length > 0) {
    return trumpCards;
  }

  // Otherwise, any card
  return hand;
};

// Helper to evaluate card strength
const getCardStrength = (card: Card, trumpSuit: Card | undefined): number => {
  let strength = card.value;

  // Trump cards are much stronger
  if (card.suit === trumpSuit?.suit) {
    strength += 100;
  }

  return strength;
};

// Helper to select cards to exchange (0-4 cards, or 0-5 for dealer)
// Players can throw away weak cards and draw new ones from deck
export const selectCardsToDiscard = (
  player: Player,
  deck: Card[],
  trumpSuit: Card | undefined,
): number[] => {
  const hand = player.hand
    .map((cardId) => deck.find((c) => c.id === cardId))
    .filter((c): c is Card => c !== undefined && !c.isDiscarded);

  if (hand.length === 0) return [];

  // Separate cards into categories for evaluation
  const trumpCards = hand.filter((c) => c.suit === trumpSuit?.suit);
  const aces = hand.filter(
    (c) => c.name === "Ace" && c.suit !== trumpSuit?.suit,
  );
  const otherCards = hand.filter(
    (c) => c.suit !== trumpSuit?.suit && c.name !== "Ace",
  );

  // Strategy: Focus on getting trumps!
  // Keep: Trump cards and Aces only
  // Exchange: Everything else, prioritizing weak cards

  // Sort other cards by value (weakest first)
  const sortedOtherCards = [...otherCards].sort((a, b) => a.value - b.value);

  const cardsToExchange: Card[] = [];

  console.log(
    `Player hand: ${hand.map((c) => `${c.name}${c.suitSymbol}`).join(", ")}`,
  );
  console.log(
    `Trump suit: ${trumpSuit?.suit}, Trump cards: ${trumpCards.length}, Aces: ${aces.length}`,
  );

  // If we have 0 trumps, be VERY aggressive - exchange everything except aces (up to 4 cards!)
  if (trumpCards.length === 0) {
    // Keep only aces, exchange everything else
    cardsToExchange.push(...sortedOtherCards);
  }
  // If we have 1 trump, still be aggressive - exchange up to 3 cards
  else if (trumpCards.length === 1) {
    // Keep trump and aces, exchange weak non-face cards
    const cardsToConsider = sortedOtherCards.filter(
      (c) => !["King", "Queen"].includes(c.name),
    );
    cardsToExchange.push(...cardsToConsider.slice(0, 3));
  }
  // If we have 2 trumps, exchange medium-weak cards
  else if (trumpCards.length === 2) {
    // Exchange cards with value 5-Queen
    const weakCards = sortedOtherCards.filter((c) => c.value <= 12);
    cardsToExchange.push(...weakCards.slice(0, 2));
  }
  // If we have 3+ trumps, only exchange very weak cards
  else {
    // Exchange cards with value 5-Queen
    const veryWeakCards = sortedOtherCards.filter((c) => c.value <= 12);
    cardsToExchange.push(...veryWeakCards.slice(0, 1));
  }

  console.log(
    `Exchanging ${cardsToExchange.length} cards:`,
    cardsToExchange.map((c) => `${c.name}${c.suitSymbol}`).join(", "),
  );

  return cardsToExchange.map((c) => c.id);
};

/**
 * AI decides which card to play
 */
export const decideCardToPlay = (
  player: Player,
  deck: Card[],
  currentTurn: Turn | undefined,
  trumpSuit: Card | undefined,
): Card | null => {
  const playableCards = getPlayableCards(player, deck, currentTurn, trumpSuit);

  if (playableCards.length === 0) return null;

  // Simple strategy: play strongest card if winning, weakest if losing
  const isFirstToPlay = !currentTurn || currentTurn.cardsPlayed.length === 0;

  if (isFirstToPlay) {
    // Lead with a mid-strength card
    const sortedByStrength = [...playableCards].sort(
      (a, b) => getCardStrength(b, trumpSuit) - getCardStrength(a, trumpSuit),
    );
    const midIndex = Math.floor(sortedByStrength.length / 2);
    return sortedByStrength[midIndex];
  }

  // If not first, try to win with lowest winning card, or dump lowest losing card
  const sortedByStrength = [...playableCards].sort(
    (a, b) => getCardStrength(a, trumpSuit) - getCardStrength(b, trumpSuit),
  );

  // For now, simple strategy: play highest card to try to win
  return sortedByStrength[sortedByStrength.length - 1];
};

/**
 * AI decides whether to take trump
 */
export const decideTakeTrump = (
  player: Player,
  deck: Card[],
  trumpSuit: Card | undefined,
  isEarly: boolean,
): boolean => {
  const hand = player.hand
    .map((cardId) => deck.find((c) => c.id === cardId))
    .filter((c): c is Card => c !== undefined && !c.isDiscarded);

  if (!trumpSuit) return false;

  // Count trump cards in hand
  const trumpCards = hand.filter((c) => c.suit === trumpSuit.suit);

  // If early (after 2 cards), need strong trumps to take
  if (isEarly) {
    return trumpCards.length >= 2;
  }

  // After 4 cards, take if have at least 1 trump
  return trumpCards.length >= 1;
};

/**
 * AI decides whether to stay in or fold
 */
export const decideStayOrFold = (
  player: Player,
  deck: Card[],
  trumpSuit: Card | undefined,
): "stay" | "fold" => {
  const hand = player.hand
    .map((cardId) => deck.find((c) => c.id === cardId))
    .filter((c): c is Card => c !== undefined && !c.isDiscarded);

  if (hand.length === 0) return "fold";

  // Calculate hand strength
  let handStrength = 0;
  hand.forEach((card) => {
    handStrength += getCardStrength(card, trumpSuit);
  });

  // Count trump cards
  const trumpCount = hand.filter((c) => c.suit === trumpSuit?.suit).length;

  // Count high value cards: Jack=6, Queen=7, King=8, Ace=9
  const aces = hand.filter((c) => c.value === 9).length;
  const kings = hand.filter((c) => c.value === 8).length;
  const kingOrAce = aces + kings;

  // VERY aggressive folding strategy

  // 0 trumps = almost always fold (90%+ fold rate)
  if (trumpCount === 0) {
    // Only stay if you have 2+ Aces OR (1 Ace + 2 Kings)
    if (aces < 2 && !(aces === 1 && kings >= 2)) {
      return "fold";
    }
  }

  // 1 trump = fold most of the time (70%+ fold rate)
  if (trumpCount === 1) {
    const trumpCard = hand.find((c) => c.suit === trumpSuit?.suit);
    if (!trumpCard) return "fold";

    // Only stay if trump is Ace OR (trump is King AND you have an Ace)
    if (trumpCard.value < 9 && !(trumpCard.value === 8 && aces >= 1)) {
      return "fold";
    }
  }

  // 2 trumps = fold if both are weak (40% fold rate)
  if (trumpCount === 2) {
    const trumpCards = hand.filter((c) => c.suit === trumpSuit?.suit);
    const trumpValues = trumpCards.map((c) => c.value);
    const maxTrumpValue = Math.max(...trumpValues);
    const minTrumpValue = Math.min(...trumpValues);

    // Fold if best trump is Jack or worse (≤6) OR both trumps are 10 or worse (≤5)
    if (maxTrumpValue <= 6 || (maxTrumpValue <= 7 && minTrumpValue <= 3)) {
      return "fold";
    }
  }

  // 3+ trumps = usually stay, fold only if all are very weak
  if (trumpCount >= 3) {
    const trumpCards = hand.filter((c) => c.suit === trumpSuit?.suit);
    const maxTrumpValue = Math.max(...trumpCards.map((c) => c.value));
    // Fold if best trump is 7 or worse (5,6,7) - all trumps are garbage
    if (maxTrumpValue <= 2) {
      return "fold";
    }
  }

  return "stay";
};

/**
 * AI decides whether to set trump hidden or visible
 */
export const decideHideTrump = (
  player: Player,
  deck: Card[],
  trumpCard: Card | undefined,
): boolean => {
  if (!trumpCard) return false;

  const hand = player.hand
    .map((cardId) => deck.find((c) => c.id === cardId))
    .filter((c): c is Card => c !== undefined && !c.isDiscarded);

  // Count trump cards
  const trumpCards = hand.filter((c) => c.suit === trumpCard.suit);

  // Hide if have 2+ trumps (strong hand)
  return trumpCards.length >= 2;
};
