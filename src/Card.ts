//This is the card class
//The card class is used to create a card object
//The card object is used to create a deck of cards
//The deck of cards is used to create a hand of cards
//The hand of cards is used to create a player
//The player is used to create a game


//define types for suit and value
export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
type SuitSymbol = "♥" | "♦" | "♣" | "♠";
export type Value = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | "Jack" | "Queen" | "King";
type Color = "Red" | "Black";

export class Card {
    suit: Suit
    value: Value
    suitSymbol: SuitSymbol
    color: Color
    isSelectable: boolean
    isSelected: boolean
    constructor(
        suit: Suit,
        value: Value,

    ) {
        this.suit = suit;
        this.value = value;
        this.suitSymbol = suit === 'Hearts' ? '♥' : suit === 'Diamonds' ? '♦' : suit === 'Clubs' ? '♣' : '♠';
        this.color = suit === 'Hearts' || suit === 'Diamonds' ? 'Red' : 'Black';
        this.isSelectable = true;
        this.isSelected = false;
    }

    getSuit(): Suit {
        return this.suit;
    }

    getValue(): Value {
        return this.value;
    }

    getColor(): Color {
        return this.color;
    }
    toggleSelected(): void {
        console.log('toggleSelected', this.isSelected);
        this.isSelected = !this.isSelected;
    }

    toString(): string {
        return `${this.value} of ${this.suit}`;
    }
}
