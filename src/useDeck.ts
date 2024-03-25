import { Game } from "./Types"

const useDeck = (game: Game) => {
    function exchangeCards() {
        game.players.forEach(player => {
            if (player.hasExchangedCards) {
                return;
            }
            player.hand = player.hand.map(card => {
                if (card.isSelected) {
                    return game.deck.pop()!;
                }
                return card;
            });
            player.hasExchangedCards = true;
        });
    }
}
