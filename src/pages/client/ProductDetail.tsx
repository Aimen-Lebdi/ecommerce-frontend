import { useParams, Link } from "react-router-dom"
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

  if (!product) {
    return <div className="container py-10">Product not found.</div>
  }

  return (
    <div className="container py-10 space-y-10">
      {/* Breadcrumbs */}
      <div className="text-sm text-muted-foreground">
        <Link to="/shop" className="hover:underline">Shop</Link> /{" "}
        <span>{product.category}</span> /{" "}
        <span className="font-medium text-foreground">{product.name}</span>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Gallery */}
        <Card>
          <CardContent className="p-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[400px] object-cover rounded-lg"
            />
            {/* TODO: add thumbnails/zoom */}
          </CardContent>
        </Card>

        {/* Right: Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <Badge variant="outline" className="mt-2">{product.brand}</Badge>
          </div>

          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">${product.price}</span>
            {product.originalPrice && (
              <span className="line-through text-muted-foreground">
                ${product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Input type="number" defaultValue={1} min={1} className="w-20" />
            <Button><ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart</Button>
            <Button variant="secondary">Buy Now</Button>
            <Button variant="outline"><Heart className="h-4 w-4" /></Button>
          </div>

          <div className="text-sm text-muted-foreground">
            ✅ Free Shipping · 🔒 Secure Payment · ↩ 30-day returns
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="pt-4">
          <p>
            This is a detailed description for <b>{product.name}</b>. 
            You can expand this with full product details.
          </p>
        </TabsContent>
        <TabsContent value="specs" className="pt-4">
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Brand: {product.brand}</li>
            <li>Category: {product.category}</li>
            <li>Stock: {product.inStock ? "Available" : "Out of Stock"}</li>
          </ul>
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <p>No reviews yet.</p>
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockProducts.slice(0, 4).map(rp => (
            <Card key={rp.id}>
              <CardContent className="p-4">
                <Link to={`/product/${rp.id}`}>
                  <img src={rp.image} alt={rp.name} className="rounded-lg mb-2"/>
                  <p className="text-sm font-medium line-clamp-2">{rp.name}</p>
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
