import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, total } = location.state || {};
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }
    
    // Trigger confetti animation
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [orderId, navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <Navbar cartCount={0} />

      {/* Confetti effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-[fall_3s_ease-in_forwards]"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b'][
                    Math.floor(Math.random() * 4)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Success Icon */}
          <div className="flex justify-center mb-8 animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
              <CheckCircle2 className="h-24 w-24 text-accent relative" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase. Your order is being processed.
            </p>
          </div>

          {/* Order Details Card */}
          <Card className="p-6 border-border mb-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-semibold">Order Details</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between pb-3 border-b border-border">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-mono text-sm font-semibold">
                  {orderId?.slice(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between pb-3 border-b border-border">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-primary">
                  ${total?.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  Confirmed
                </span>
              </div>
            </div>
          </Card>

          {/* What's Next */}
          <Card className="p-6 border-border mb-8 bg-gradient-card animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span>You'll receive an email confirmation shortly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Your order will be prepared and shipped within 2-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Track your order status in the Orders section</span>
              </li>
            </ul>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/orders")}
              className="group"
            >
              View Orders
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              onClick={() => navigate("/")}
              className="bg-gradient-primary group"
            >
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;
