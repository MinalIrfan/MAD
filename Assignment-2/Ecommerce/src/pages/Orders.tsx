import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface Order {
  id: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  shipping_address: string;
  shipping_city: string;
  order_items: {
    product: {
      title: string;
      image: string;
    };
    quantity: number;
    price: number;
  }[];
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const data = await api.orders.getAll();
      setOrders(data || []);
    } catch (error) {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-accent";
      case "pending":
        return "bg-yellow-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-primary bg-clip-text text-transparent">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              No orders yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 border-border">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {item.product.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Payment: {order.payment_method}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.shipping_address}, {order.shipping_city}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
