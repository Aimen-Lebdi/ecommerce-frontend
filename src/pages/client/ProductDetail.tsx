import { useParams, Link } from "react-router-dom"
import { useState } from "react"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import { mockProducts } from "./Shop" // reuse mock data for now

const ProductDetails = () => {
  const { id } = useParams()
  const product = mockProducts.find(p => p.id === Number(id))

  // Mock additional images for the gallery (you can replace with actual product images)
  const productImages = [
    product?.image || "",
    product?.image || "",
    product?.image || "",
    product?.image || ""
  ]

  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  if (!product) {
    return <div className="container py-6 md:py-10">Product not found.</div>
  }

  return (
    <div className="container py-6 md:py-10 space-y-6 md:space-y-10 px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="text-xs md:text-sm text-muted-foreground">
        <Link to="/shop" className="hover:underline">Shop</Link> /{" "}
        <span>{product.category}</span> /{" "}
        <span className="font-medium text-foreground">{product.name}</span>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Left: Gallery */}
        <div className="space-y-3 md:space-y-4">
          {/* Main Image */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-64 md:h-96 lg:h-[400px] object-cover rounded-lg"
              />
            </CardContent>
          </Card>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            {productImages.map((image, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-primary ${
                  selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedImageIndex(index)}
              >
                <CardContent className="p-2">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-16 md:h-20 object-cover rounded"
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div className="space-y-4 md:space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight">{product.name}</h1>
            <Badge variant="outline" className="mt-2">{product.brand}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 md:h-4 md:w-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-xs md:text-sm text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="line-through text-muted-foreground text-sm md:text-base">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Input type="number" defaultValue={1} min={1} className="w-16 md:w-20 h-9 md:h-10" />
            <Button className="flex-1 md:flex-none h-9 md:h-10">
              <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" /> 
              <span className="text-xs md:text-sm">Add to Cart</span>
            </Button>
            <Button variant="secondary" className="h-9 md:h-10">
              <span className="text-xs md:text-sm">Buy Now</span>
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
              <Heart className="h-3 w-3 md:h-4 md:w-4" />
            </Button>
          </div>

          <div className="text-xs md:text-sm text-muted-foreground">
            ✅ Free Shipping · 🔒 Secure Payment · ↩ 30-day returns
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description" className="text-xs md:text-sm">Description</TabsTrigger>
          <TabsTrigger value="specs" className="text-xs md:text-sm">Specifications</TabsTrigger>
          <TabsTrigger value="reviews" className="text-xs md:text-sm">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-4">
          <p className="text-sm md:text-base">
            This is a detailed description for <b>{product.name}</b>. 
            You can expand this with full product details.
          </p>
        </TabsContent>
        <TabsContent value="specs" className="pt-4">
          <ul className="list-disc pl-6 space-y-1 text-xs md:text-sm">
            <li>Brand: {product.brand}</li>
            <li>Category: {product.category}</li>
            <li>Stock: {product.inStock ? "Available" : "Out of Stock"}</li>
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <p className="text-sm md:text-base">No reviews yet.</p>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {mockProducts.slice(0, 4).map(rp => (
            <Card key={rp.id}>
              <CardContent className="p-2 md:p-4">
                <Link to={`/product/${rp.id}`}>
                  <img src={rp.image} alt={rp.name} className="rounded-lg mb-2 w-full h-24 md:h-32 object-cover"/>
                  <p className="text-xs md:text-sm font-medium line-clamp-2">{rp.name}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProductDetails