import { 
  Package,
  Truck,
  Shield,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
;



export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Trust Badges */}
      <div className="border-b bg-muted/50">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Truck className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">Free Shipping</h4>
              <p className="text-xs text-muted-foreground">On orders over $50</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Package className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">Easy Returns</h4>
              <p className="text-xs text-muted-foreground">30-day return policy</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Shield className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">Secure Payment</h4>
              <p className="text-xs text-muted-foreground">SSL encrypted</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Phone className="h-8 w-8 text-primary" />
              <h4 className="font-semibold text-sm">24/7 Support</h4>
              <p className="text-xs text-muted-foreground">Customer service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">C</span>
              </div>
              <span className="font-bold text-xl">CLICON</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted online marketplace for quality products at great prices. 
              Shop with confidence and enjoy fast, reliable service.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Commerce St, City, State 12345</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>support@clicon.com</span>
              </div>
            </div>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/help" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
              <li><a href="/shipping" className="text-muted-foreground hover:text-foreground">Shipping Info</a></li>
              <li><a href="/returns" className="text-muted-foreground hover:text-foreground">Returns & Exchanges</a></li>
              <li><a href="/size-guide" className="text-muted-foreground hover:text-foreground">Size Guide</a></li>
              <li><a href="/track-order" className="text-muted-foreground hover:text-foreground">Track Your Order</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="text-muted-foreground hover:text-foreground">About Us</a></li>
              <li><a href="/careers" className="text-muted-foreground hover:text-foreground">Careers</a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-foreground">Blog</a></li>
              <li><a href="/press" className="text-muted-foreground hover:text-foreground">Press</a></li>
              <li><a href="/investors" className="text-muted-foreground hover:text-foreground">Investors</a></li>
              <li><a href="/sustainability" className="text-muted-foreground hover:text-foreground">Sustainability</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <div className="space-y-3">
              <Input placeholder="Enter your email" />
              <Button className="w-full">Subscribe</Button>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Legal */}
      <div className="border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} CLICON. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</a>
                <a href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</a>
                <a href="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</a>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">We accept:</span>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-6 w-10 bg-muted rounded p-1" />
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">VISA</div>
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">MC</div>
                <div className="h-6 w-10 bg-muted rounded flex items-center justify-center text-xs font-bold">PP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};