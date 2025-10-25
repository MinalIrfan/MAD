import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  rating: number;
  ratingCount: number;
  onAddToCart: () => void;
}

export const ProductCard = ({
  id,
  title,
  price,
  image,
  rating,
  ratingCount,
  onAddToCart,
}: ProductCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-glow transition-all duration-300 cursor-pointer">
      <div onClick={() => navigate(`/product/${id}`)}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground line-clamp-2 mb-2">
            {title}
          </h3>
          <div className="flex items-center gap-1 mb-3">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm text-foreground">{rating}</span>
            <span className="text-xs text-muted-foreground">
              ({ratingCount})
            </span>
          </div>
          <p className="text-2xl font-bold text-primary">${price}</p>
        </CardContent>
      </div>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart();
          }}
          className="w-full bg-gradient-primary hover:opacity-90"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};
