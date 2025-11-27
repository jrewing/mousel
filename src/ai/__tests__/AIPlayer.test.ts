import { decideStayOrFold } from "../AIPlayer";
import { Card, Player } from "../../Types";

// Helper to create a card for testing
const createCard = (
  id: number,
  value: number,
  cardName: string,
  cardSuit: string,
): Card => ({
  id,
  value,
  name: cardName as Card["name"],
  suit: cardSuit as Card["suit"],
  suitSymbol:
    cardSuit === "Hearts"
      ? "♥"
      : cardSuit === "Diamonds"
        ? "♦"
        : cardSuit === "Clubs"
          ? "♣"
          : "♠",
  color: cardSuit === "Hearts" || cardSuit === "Diamonds" ? "Red" : "Black",
  isFresh: false,
  isSelected: false,
  isPlayed: false,
  isDiscarded: false,
  isTrump: false,
  isDealt: true,
});

// Helper to create a player with specific cards
const createPlayer = (cardIds: number[]): Player => ({
  id: 1,
  name: "Test Player",
  hand: cardIds,
  tricks: 0,
  hasFolded: false,
  isDealer: false,
  isSmallBlind: false,
  hasExchangedCards: false,
  bank: 100,
  isDeclarer: false,
  hasFlippedTrump: false,
  hasRefusedToFlipTrump: false,
  hasTakenTrump: false,
  hasRefusedTrump: false,
  hasTakenTrumpEarly: false,
  hasRefusedTrumpEarly: false,
  isIn: true,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  isAI: true,
  isTurn: false,
});

describe("decideStayOrFold", () => {
  describe("0 trumps - should fold ~90% of the time", () => {
    it("should FOLD with 0 trumps and 0 Aces", () => {
      const deck: Card[] = [
        createCard(0, 13, "King", "Hearts"),
        createCard(1, 12, "Queen", "Hearts"),
        createCard(2, 11, "Jack", "Hearts"),
        createCard(3, 10, "10", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should FOLD with 0 trumps and 1 Ace", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Hearts"),
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should STAY with 0 trumps and 2 Aces", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Hearts"),
        createCard(1, 14, "Ace", "Diamonds"),
        createCard(2, 13, "King", "Hearts"),
        createCard(3, 12, "Queen", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should STAY with 0 trumps, 1 Ace, and 2 Kings", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Hearts"),
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 13, "King", "Diamonds"),
        createCard(3, 12, "Queen", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should FOLD with 0 trumps, 1 Ace, and 1 King", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Hearts"),
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });
  });

  describe("1 trump - should fold ~70% of the time", () => {
    it("should FOLD with 1 trump (Queen) and 0 Aces", () => {
      const deck: Card[] = [
        createCard(0, 12, "Queen", "Spades"), // Trump
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should FOLD with 1 trump (Jack) and 1 Ace", () => {
      const deck: Card[] = [
        createCard(0, 11, "Jack", "Spades"), // Trump
        createCard(1, 14, "Ace", "Hearts"),
        createCard(2, 13, "King", "Hearts"),
        createCard(3, 12, "Queen", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should STAY with 1 trump (Ace)", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Spades"), // Trump Ace
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should STAY with 1 trump (King) and 1 Ace", () => {
      const deck: Card[] = [
        createCard(0, 13, "King", "Spades"), // Trump King
        createCard(1, 14, "Ace", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should FOLD with 1 trump (King) and 0 Aces", () => {
      const deck: Card[] = [
        createCard(0, 13, "King", "Spades"), // Trump King
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });
  });

  describe("2 trumps - should fold ~40% of the time", () => {
    it("should FOLD with 2 weak trumps (Jack and 10)", () => {
      const deck: Card[] = [
        createCard(0, 11, "Jack", "Spades"), // Trump
        createCard(1, 10, "10", "Spades"), // Trump
        createCard(2, 14, "Ace", "Hearts"),
        createCard(3, 13, "King", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should FOLD with 2 trumps (Queen and 8)", () => {
      const deck: Card[] = [
        createCard(0, 12, "Queen", "Spades"), // Trump Queen
        createCard(1, 8, "8", "Spades"), // Trump 8
        createCard(2, 14, "Ace", "Hearts"),
        createCard(3, 13, "King", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should STAY with 2 trumps (Queen and 9)", () => {
      const deck: Card[] = [
        createCard(0, 12, "Queen", "Spades"), // Trump Queen
        createCard(1, 9, "9", "Spades"), // Trump 9
        createCard(2, 13, "King", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should STAY with 2 trumps (King and Jack)", () => {
      const deck: Card[] = [
        createCard(0, 13, "King", "Spades"), // Trump King
        createCard(1, 11, "Jack", "Spades"), // Trump Jack
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 10, "10", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should STAY with 2 trumps (Ace and 5)", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Spades"), // Trump Ace
        createCard(1, 5, "5", "Spades"), // Trump 5
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 10, "10", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });
  });

  describe("3+ trumps - should fold ~10% of the time", () => {
    it("should FOLD with 3 very weak trumps (7, 6, 5)", () => {
      const deck: Card[] = [
        createCard(0, 7, "7", "Spades"), // Trump
        createCard(1, 6, "6", "Spades"), // Trump
        createCard(2, 5, "5", "Spades"), // Trump
        createCard(3, 13, "King", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should STAY with 3 trumps (8, 7, 6)", () => {
      const deck: Card[] = [
        createCard(0, 8, "8", "Spades"), // Trump 8
        createCard(1, 7, "7", "Spades"), // Trump
        createCard(2, 6, "6", "Spades"), // Trump
        createCard(3, 13, "King", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should STAY with 3 moderate trumps (Jack, 10, 9)", () => {
      const deck: Card[] = [
        createCard(0, 11, "Jack", "Spades"), // Trump
        createCard(1, 10, "10", "Spades"), // Trump
        createCard(2, 9, "9", "Spades"), // Trump
        createCard(3, 12, "Queen", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });

    it("should STAY with 4 trumps including weak ones (King, 7, 6, 5)", () => {
      const deck: Card[] = [
        createCard(0, 13, "King", "Spades"), // Trump King
        createCard(1, 7, "7", "Spades"), // Trump
        createCard(2, 6, "6", "Spades"), // Trump
        createCard(3, 5, "5", "Spades"), // Trump
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("stay");
    });
  });

  describe("Edge cases", () => {
    it("should FOLD with empty hand", () => {
      const deck: Card[] = [];
      const player = createPlayer([]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      expect(result).toBe("fold");
    });

    it("should handle undefined trump suit gracefully", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Hearts"),
        createCard(1, 13, "King", "Hearts"),
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);

      const result = decideStayOrFold(player, deck, undefined);
      // With no trump suit, can't have trumps, so should fold (90%+ fold rate)
      expect(result).toBe("fold");
    });

    it("should ignore discarded cards", () => {
      const deck: Card[] = [
        createCard(0, 14, "Ace", "Spades"), // Trump Ace
        { ...createCard(1, 13, "King", "Spades"), isDiscarded: true }, // Trump but discarded
        createCard(2, 12, "Queen", "Hearts"),
        createCard(3, 11, "Jack", "Hearts"),
      ];
      const player = createPlayer([0, 1, 2, 3]);
      const trumpSuit = createCard(99, 14, "Ace", "Spades");

      const result = decideStayOrFold(player, deck, trumpSuit);
      // Only 1 trump (not discarded), and it's an Ace, so should stay
      expect(result).toBe("stay");
    });
  });
});
