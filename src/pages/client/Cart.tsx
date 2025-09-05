import React, { useState } from "react"
import { Link } from "react-router-dom"
import { 
  Minus, 
  Plus, 
  Trash2, 
  Heart, 
  ShoppingBag, 
  Lock, 
  Truck, 
  ArrowLeft,
  Tag,
  Shield,
  CreditCard
} from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"

// Mock cart data - replace with your actual cart state
const mockCartItems = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    brand: "AudioTech",
    price: 299.99,
    originalPrice: 349.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop",
    quantity: 2,
    variant: { color: "Midnight Black", size: "One Size" },
    inStock: true
  },
  {
    id: 2,
    name: "Smart Fitness Watch",
    brand: "TechFit",
    price: 199.99,
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop",
    quantity: 1,
    variant: { color: "Space Gray", size: "42mm" },
    inStock: true
  },
  {
    id: 3,
    name: "Portable Bluetooth Speaker",
    brand: "SoundWave",
    price: 89.99,
    originalPrice: 119.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&h=200&fit=crop",
    quantity: 1,
    variant: { color: "Ocean Blue", size: "Compact" },
    inStock: false
  }
]

// Mock recommended products
const recommendedProducts = [
  {
    id: 4,
    name: "Wireless Mouse",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=200&h=200&fit=crop"
  },
  {
    id: 5,
    name: "Phone Case",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=200&h=200&fit=crop"
  }
]

const Cart = () => {
  const [cartItems, setCartItems] = useState(mockCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [shippingMethod, setShippingMethod] = useState("standard")

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const promoDiscount = appliedPromo ? subtotal * 0.1 : 0 // 10% discount example
  const shippingCost = shippingMethod === "express" ? 15.99 : subtotal > 75 ? 0 : 9.99
  const taxRate = 0.08 // 8% tax
  const taxAmount = (subtotal - promoDiscount) * taxRate
  const total = subtotal - promoDiscount + shippingCost + taxAmount

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id)
      return
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const moveToWishlist = (id: number) => {
    // In real app, add to wishlist then remove from cart
    removeItem(id)
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "save10") {
      setAppliedPromo({ code: "SAVE10", discount: 0.1, description: "10% off your order" })
    } else {
      setAppliedPromo(null)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container py-8 md:py-12">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Your cart is empty</h1>
            <p className="text-muted-foreground mt-2">
              Looks like you haven't added anything to your cart yet.
            </p>
          </div>
          <Link to="/shop">
            <Button size="lg" className="mt-4">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6 md:py-10 px-4 md:px-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link to="/shop" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shopping Cart</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Cart Items - Left Column */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <Card key={item.id} className={!item.inStock ? "opacity-60" : ""}>
              <CardContent className="p-4 md:p-6">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <Link to={`/product/${item.id}`} className="flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 md:gap-4">
                      <div className="flex-1 min-w-0">
                        <Link 
                          to={`/product/${item.id}`} 
                          className="font-medium text-sm md:text-base hover:underline line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                          {item.brand}
                        </p>
                        
                        {/* Variants */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {item.variant.color}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.variant.size}
                          </Badge>
                        </div>

                        {!item.inStock && (
                          <Badge variant="destructive" className="mt-2 text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <div className="font-semibold text-sm md:text-base">
                          ${item.price.toFixed(2)}
                        </div>
                        {item.originalPrice && (
                          <div className="text-xs text-muted-foreground line-through">
                            ${item.originalPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={!item.inStock}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={!item.inStock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveToWishlist(item.id)}
                          className="text-xs"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right mt-2">
                      <span className="text-sm font-semibold">
                        Subtotal: ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Promo Code Section */}
          <Card className="mt-6">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button onClick={applyPromoCode} variant="outline">
                  <Tag className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </div>
              {appliedPromo && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800">
                      {appliedPromo.description}
                    </span>
                    <span className="text-sm font-semibold text-green-800">
                      -${promoDiscount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary - Right Column */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({appliedPromo.code})</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Shipping</label>
                <Select value={shippingMethod} onValueChange={setShippingMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">
                      Standard (5-7 days) - {subtotal > 75 ? "FREE" : "$9.99"}
                    </SelectItem>
                    <SelectItem value="express">
                      Express (2-3 days) - $15.99
                    </SelectItem>
                  </SelectContent>
                </Select>
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

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {/* Estimated Delivery */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <Truck className="h-4 w-4" />
                <span>
                  Estimated delivery: {shippingMethod === "express" ? "Dec 8-10" : "Dec 12-15"}
                </span>
              </div>

              {/* Checkout Button */}
              <Button size="lg" className="w-full mt-4">
                <Lock className="h-4 w-4 mr-2" />
                Secure Checkout
              </Button>

              <Button variant="outline" size="lg" className="w-full" asChild>
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Trust & Security */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Secure 256-bit SSL encryption</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Multiple payment options</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-purple-600" />
                <span>Free returns within 30 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">We Accept</CardTitle>
            </CardHeader>
            <CardContent>
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

      {/* Recommended Products */}
      <div className="mt-10 md:mt-12">
        <h2 className="text-xl font-semibold mb-4">You might also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {recommendedProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-3">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-24 md:h-32 object-cover rounded-lg mb-2"
                />
                <p className="text-xs md:text-sm font-medium line-clamp-2 mb-1">
                  {product.name}
                </p>
                <p className="text-sm font-semibold">${product.price}</p>
                <Button size="sm" className="w-full mt-2 text-xs">
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Cart