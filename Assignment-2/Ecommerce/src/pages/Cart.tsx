import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    image: string;
  };
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchCartItems();
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const data = await api.cart.getAll();
      setCartItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    try {
      await api.cart.update(itemId, newQuantity);
      fetchCartItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.cart.delete(itemId);
      toast({
        title: "Success",
        description: "Item removed from cart",
      });
      fetchCartItems();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate("/checkout", { state: { cartItems, total } });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar cartCount={0} />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartItems.length} />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          Shopping Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground mb-6">
              Your cart is empty
            </p>
            <Button onClick={() => navigate("/")}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4 border-border">
                  <div className="flex gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">
                        {item.product.title}
                      </h3>
                      <p className="text-primary font-bold mb-3">
                        ${item.product.price}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <div>
              <Card className="p-6 border-border sticky top-24">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold">Free</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full bg-gradient-primary"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
