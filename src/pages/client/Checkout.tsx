import { useState } from "react"
import { Link } from "react-router-dom"
import { 
  ArrowLeft, 
  Lock, 
  CreditCard, 
  Truck, 
  Shield, 
  Edit,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  User,
  Home,
  CheckCircle
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Checkbox } from "../../components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../../components/ui/collapsible"

// Mock order data (would come from cart/state)
const mockOrderItems = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    brand: "AudioTech",
    price: 299.99,
    quantity: 2,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop",
    variant: "Midnight Black"
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    brand: "TechFit", 
    price: 199.99,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=80&h=80&fit=crop",
    variant: "Space Gray, 42mm"
  }
]

const Checkout = () => {
  // Form state
  const [customerInfo, setCustomerInfo] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: ""
  })

  const [shippingAddress, setShippingAddress] = useState({
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  })

  const [billingAddress, setBillingAddress] = useState({
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US"
  })

  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  })

  // Checkout state
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [sameAsBilling, setSameAsBilling] = useState(true)
  const [saveInfo, setSaveInfo] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate totals
  const subtotal = mockOrderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = shippingMethod === "express" ? 15.99 : subtotal > 75 ? 0 : 9.99
  const taxRate = 0.08
  const taxAmount = subtotal * taxRate
  const total = subtotal + shippingCost + taxAmount

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      // Redirect to confirmation page
      alert("Order placed successfully!")
    }, 2000)
  }

  const validateForm = () => {
    return customerInfo.email && 
           customerInfo.firstName && 
           customerInfo.lastName &&
           shippingAddress.address &&
           shippingAddress.city &&
           shippingAddress.state &&
           shippingAddress.zipCode &&
           paymentInfo.cardNumber &&
           paymentInfo.expiryDate &&
           paymentInfo.cvv &&
           paymentInfo.cardholderName
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="container py-4 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link to="/cart" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <h1 className="text-xl md:text-2xl font-bold">Secure Checkout</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6 md:py-8 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Mobile Order Summary Toggle */}
            <div className="lg:hidden">
              <Collapsible open={isOrderSummaryOpen} onOpenChange={setIsOrderSummaryOpen}>
                <CollapsibleTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">Order summary</span>
                          <Badge variant="secondary" className="text-xs">
                            {mockOrderItems.reduce((sum, item) => sum + item.quantity, 0)} items
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">${total.toFixed(2)}</span>
                          {isOrderSummaryOpen ? 
                            <ChevronUp className="h-4 w-4" /> : 
                            <ChevronDown className="h-4 w-4" />
                          }
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2">
                    <CardContent className="p-4 space-y-4">
                      {mockOrderItems.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="relative">
                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                              {item.quantity}
                            </Badge>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.variant}</p>
                          </div>
                          <div className="text-sm font-semibold">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span>${shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax</span>
                          <span>${taxAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={customerInfo.firstName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={customerInfo.lastName}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      className="pl-10"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apartment">Apartment, suite, etc. (Optional)</Label>
                  <Input
                    id="apartment"
                    value={shippingAddress.apartment}
                    onChange={(e) => setShippingAddress(prev => ({ ...prev, apartment: e.target.value }))}
                    placeholder="Apt 4B"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={shippingAddress.state} onValueChange={(value) => setShippingAddress(prev => ({ ...prev, state: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code *</Label>
                    <Input
                      id="zipCode"
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                      placeholder="10001"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="saveAddress" checked={saveInfo} onCheckedChange={setSaveInfo} />
                  <Label htmlFor="saveAddress" className="text-sm">
                    Save this address for future orders
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Shipping Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="standard" id="standard" />
                    <div className="flex-1">
                      <Label htmlFor="standard" className="font-medium">Standard Shipping</Label>
                      <p className="text-sm text-muted-foreground">5-7 business days</p>
                    </div>
                    <span className="font-semibold">
                      {subtotal > 75 ? "FREE" : "$9.99"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value="express" id="express" />
                    <div className="flex-1">
                      <Label htmlFor="express" className="font-medium">Express Shipping</Label>
                      <p className="text-sm text-muted-foreground">2-3 business days</p>
                    </div>
                    <span className="font-semibold">$15.99</span>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Credit or Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "card" && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={paymentInfo.cardNumber}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardNumber: e.target.value }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          value={paymentInfo.expiryDate}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, expiryDate: e.target.value }))}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={paymentInfo.cvv}
                          onChange={(e) => setPaymentInfo(prev => ({ ...prev, cvv: e.target.value }))}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input
                        id="cardholderName"
                        value={paymentInfo.cardholderName}
                        onChange={(e) => setPaymentInfo(prev => ({ ...prev, cardholderName: e.target.value }))}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary - Right Column (Desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Order Summary</CardTitle>
                    <Link to="/cart" className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <Edit className="h-3 w-3" />
                      Edit
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockOrderItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded object-cover" />
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {item.quantity}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-2">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.variant}</p>
                        <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>${shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>256-bit SSL secured</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span>Money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-purple-600" />
                    <span>Free returns within 30 days</span>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm font-medium mb-3">We accept</p>
                  <div className="flex gap-2 flex-wrap">
                    {["Visa", "Mastercard", "PayPal", "Apple Pay"].map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sticky Bottom Bar (Mobile) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-10">
          <Button 
            size="lg" 
            className="w-full" 
            onClick={handlePlaceOrder}
            disabled={!validateForm() || isProcessing}
          >
            {isProcessing ? (
              "Processing..."
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Place Order • ${total.toFixed(2)}
              </>
            )}
          </Button>
        </div>

        {/* Desktop Place Order Button */}
        <div className="hidden lg:block mt-8">
          <div className="max-w-2xl">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handlePlaceOrder}
              disabled={!validateForm() || isProcessing}
            >
              {isProcessing ? (
                "Processing Order..."
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Place Order • ${total.toFixed(2)}
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              By placing your order, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

      {/* Mobile bottom spacing */}
      <div className="lg:hidden h-20"></div>
    </div>
  )
}

export default Checkout