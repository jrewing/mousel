import CardComponent from "./CardComponent";
import { Card } from "./Types";

export const HandComponent = (
    { hand }: { hand: Card[]}
) => {
    return (
        <div>
            {hand.map((card, index) => (
                <CardComponent key={index} card={card}  />
            ))}
        </div>
    );
}
