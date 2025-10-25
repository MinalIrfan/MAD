import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Wallet, Truck, Shield, Loader2 } from "lucide-react";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { cartItems, total } = location.state || { cartItems: [], total: 0 };

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      navigate("/cart");
    }
    if (!user) {
      navigate("/auth");
    } else {
      fetchProfile();
    }
  }, [cartItems, user, navigate]);

  const fetchProfile = async () => {
    try {
      const data = await api.profile.get();
      setAddress(data.address || "");
      setCity(data.city || "");
      setCountry(data.country || "");
      setPostalCode(data.postal_code || "");
    } catch (error) {
      console.error("Failed to load profile");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!address.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!country.trim()) newErrors.country = "Country is required";
    if (!postalCode.trim()) newErrors.postalCode = "Postal code is required";

    if (paymentMethod === "card") {
      if (!cardNumber.trim()) newErrors.cardNumber = "Card number is required";
      if (cardNumber.replace(/\s/g, "").length !== 16) 
        newErrors.cardNumber = "Card number must be 16 digits";
      if (!expiryDate.trim()) newErrors.expiryDate = "Expiry date is required";
      if (!cvv.trim()) newErrors.cvv = "CVV is required";
      if (cvv.length !== 3) newErrors.cvv = "CVV must be 3 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        totalAmount: total,
        paymentMethod,
        shippingAddress: address,
        shippingCity: city,
        shippingCountry: country,
        shippingPostalCode: postalCode,
        items: cartItems.map((item: any) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const result = await api.orders.create(orderData);

      toast({
        title: "Success!",
        description: "Your order has been placed successfully",
      });
      navigate("/order-success", { state: { orderId: result.id, total } });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar cartCount={0} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8 animate-fade-in">
          <Shield className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Secure Checkout
          </h1>
        </div>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6 border-border shadow-glow animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="h-6 w-6 text-accent" />
                  <h2 className="text-2xl font-bold">Shipping Address</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors({ ...errors, address: "" });
                      }}
                      required
                      className={errors.address ? "border-destructive" : ""}
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive mt-1">{errors.address}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={city}
                        onChange={(e) => {
                          setCity(e.target.value);
                          if (errors.city) setErrors({ ...errors, city: "" });
                        }}
                        required
                        className={errors.city ? "border-destructive" : ""}
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="postal">Postal Code *</Label>
                      <Input
                        id="postal"
                        value={postalCode}
                        onChange={(e) => {
                          setPostalCode(e.target.value);
                          if (errors.postalCode) setErrors({ ...errors, postalCode: "" });
                        }}
                        required
                        className={errors.postalCode ? "border-destructive" : ""}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-destructive mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Input
                      id="country"
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        if (errors.country) setErrors({ ...errors, country: "" });
                      }}
                      required
                      className={errors.country ? "border-destructive" : ""}
                    />
                    {errors.country && (
                      <p className="text-sm text-destructive mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-border shadow-glow animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Wallet className="h-6 w-6 text-accent" />
                  <h2 className="text-2xl font-bold">Payment Method</h2>
                </div>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg mb-2 transition-all hover:border-primary hover:shadow-md cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer font-medium">
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg mb-2 transition-all hover:border-primary hover:shadow-md cursor-pointer">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="paypal" className="flex-1 cursor-pointer font-medium">
                      PayPal
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border border-border rounded-lg transition-all hover:border-primary hover:shadow-md cursor-pointer">
                    <RadioGroupItem value="cod" id="cod" />
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium">
                      Cash on Delivery
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="mt-6 space-y-4 animate-fade-in">
                    <div>
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, "");
                          const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                          setCardNumber(formatted);
                          if (errors.cardNumber) setErrors({ ...errors, cardNumber: "" });
                        }}
                        maxLength={19}
                        className={errors.cardNumber ? "border-destructive" : ""}
                      />
                      {errors.cardNumber && (
                        <p className="text-sm text-destructive mt-1">{errors.cardNumber}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date *</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            const formatted = value.length >= 2 
                              ? `${value.slice(0, 2)}/${value.slice(2, 4)}` 
                              : value;
                            setExpiryDate(formatted);
                            if (errors.expiryDate) setErrors({ ...errors, expiryDate: "" });
                          }}
                          maxLength={5}
                          className={errors.expiryDate ? "border-destructive" : ""}
                        />
                        {errors.expiryDate && (
                          <p className="text-sm text-destructive mt-1">{errors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            setCvv(value);
                            if (errors.cvv) setErrors({ ...errors, cvv: "" });
                          }}
                          maxLength={3}
                          className={errors.cvv ? "border-destructive" : ""}
                        />
                        {errors.cvv && (
                          <p className="text-sm text-destructive mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div>
              <Card className="p-6 border-border shadow-glow sticky top-24 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-6">
                  {cartItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.title} × {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90 transition-all"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-5 w-5" />
                      Place Secure Order
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground mt-3">
                  Your payment information is secure and encrypted
                </p>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Checkout;
