import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating_rate: number;
  rating_count: number;
  stock: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduct();
    if (user) {
      fetchCartCount();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const data = await api.products.getById(id!);
      setProduct(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Product not found",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const data = await api.cart.getCount();
      setCartCount(data.count || 0);
    } catch (error) {
      console.error("Failed to fetch cart count");
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
      });
      navigate("/auth");
      return;
    }

    if (!product) return;

    try {
      await api.cart.add(product.id, 1);
      fetchCartCount();
      toast({
        title: "Success",
        description: "Item added to cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={cartCount} />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      <main className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-accent uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="text-lg text-foreground">
                  {product.rating_rate}
                </span>
                <span className="text-muted-foreground">
                  ({product.rating_count} reviews)
                </span>
              </div>
            </div>

            <p className="text-5xl font-bold text-primary">
              ${product.price}
            </p>

            <p className="text-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Stock: {product.stock} units available
              </p>
              <Button
                size="lg"
                className="w-full bg-gradient-primary text-lg"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
