import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating_rate: number;
  rating_count: number;
}

const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState<string[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const data = await api.products.getAll();
      setProducts(data || []);
      const uniqueCategories = [
        ...new Set((data || []).map((p: Product) => p.category)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
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

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product: Product) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to cart",
      });
      navigate("/auth");
      return;
    }

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={cartCount} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={
                  selectedCategory === category ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              title={product.title}
              price={product.price}
              image={product.image}
              rating={product.rating_rate}
              ratingCount={product.rating_count}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
