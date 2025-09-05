import React, { useState } from 'react';
import { 
  User, Package, MapPin, CreditCard, Heart, Settings, 
  HelpCircle, LogOut, ChevronRight, Edit, Plus, Eye, 
  Truck, RotateCcw, ShoppingCart, Bell, Globe, 
  Shield, Download, Gift, Star, Menu, X, Phone, Mail
} from 'lucide-react';

const MyAccountDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Mock user data
  const userData = {
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+1 (555) 123-4567",
    profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    memberSince: "January 2023",
    totalOrders: 12,
    totalSpent: 2849.99,
    loyaltyPoints: 1250
  };

  const recentOrders = [
    {
      id: "ORD-2025-0001287",
      date: "Sep 5, 2025",
      status: "Delivered",
      total: 657.97,
      items: 2
    },
    {
      id: "ORD-2025-0001254",
      date: "Aug 28, 2025",
      status: "Shipped",
      total: 299.99,
      items: 1
    },
    {
      id: "ORD-2025-0001198",
      date: "Aug 15, 2025",
      status: "Processing",
      total: 149.99,
      items: 1
    }
  ];

  const addresses = [
    {
      id: 1,
      type: "Home",
      name: "John Doe",
      address: "123 Main Street, New York, NY 10001",
      isDefault: true
    },
    {
      id: 2,
      type: "Work",
      name: "John Doe",
      address: "456 Business Ave, New York, NY 10002",
      isDefault: false
    }
  ];

  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/27",
      isDefault: true
    },
    {
      id: 2,
      type: "Mastercard",
      last4: "8888",
      expiry: "09/26",
      isDefault: false
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: "Premium Bluetooth Speaker",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100&h=100&fit=crop"
    },
    {
      id: 2,
      name: "Wireless Charging Pad",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=100&h=100&fit=crop"
    }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payments', label: 'Payment Methods', icon: CreditCard },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Account Settings', icon: Settings },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'shipped': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'processing': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center space-x-4">
          <img 
            src={userData.profilePicture} 
            alt={userData.name}
            className="w-16 h-16 rounded-full object-cover"
          />
          <div>
            <h2 className="text-2xl font-semibold text-card-foreground">Welcome back, {userData.name}!</h2>
            <p className="text-muted-foreground">Member since {userData.memberSince}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-card-foreground">{userData.totalOrders}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-chart-1" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-card-foreground">${userData.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-card-foreground">{userData.loyaltyPoints}</p>
              <p className="text-sm text-muted-foreground">Loyalty Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-card-foreground">Recent Orders</h3>
          <button 
            onClick={() => setActiveSection('orders')}
            className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {recentOrders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <p className="font-medium text-card-foreground">{order.id}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{order.date} • {order.items} items</p>
              </div>
              <p className="font-semibold text-card-foreground">${order.total}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-card-foreground">Order History</h2>
        <div className="flex space-x-2">
          <select className="px-3 py-2 border border-border rounded-lg bg-card text-card-foreground">
            <option>All Orders</option>
            <option>Delivered</option>
            <option>Shipped</option>
            <option>Processing</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {recentOrders.map((order) => (
          <div key={order.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="font-semibold text-card-foreground">Order {order.id}</h3>
                <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)} mt-2 sm:mt-0 self-start`}>
                {order.status}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground mb-3 sm:mb-0">
                {order.items} items • Total: <span className="font-semibold text-card-foreground">${order.total}</span>
              </div>
              
              <div className="flex space-x-2">
                <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center space-x-2">
                  <Truck className="w-4 h-4" />
                  <span>Track</span>
                </button>
                <button className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4" />
                  <span>Reorder</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-card-foreground">Address Book</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Address</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <div key={address.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-card-foreground">{address.type}</h3>
                {address.isDefault && (
                  <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">Default</span>
                )}
              </div>
              <button className="text-muted-foreground hover:text-card-foreground">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-card-foreground">{address.name}</p>
              <p>{address.address}</p>
            </div>
            <div className="flex space-x-2 mt-4">
              <button className="text-sm text-primary hover:text-primary/80">Edit</button>
              <button className="text-sm text-destructive hover:text-destructive/80">Delete</button>
              {!address.isDefault && (
                <button className="text-sm text-muted-foreground hover:text-card-foreground">Set as Default</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentMethods = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-card-foreground">Payment Methods</h2>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-primary rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{method.type} •••• {method.last4}</p>
                  <p className="text-sm text-muted-foreground">Expires {method.expiry}</p>
                </div>
              </div>
              {method.isDefault && (
                <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">Default</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button className="text-sm text-primary hover:text-primary/80">Edit</button>
              <button className="text-sm text-destructive hover:text-destructive/80">Remove</button>
              {!method.isDefault && (
                <button className="text-sm text-muted-foreground hover:text-card-foreground">Set as Default</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-card-foreground">Wishlist</h2>
        <p className="text-muted-foreground">{wishlistItems.length} items</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-card border border-border rounded-lg p-4">
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="font-medium text-card-foreground mb-2">{item.name}</h3>
            <p className="text-lg font-semibold text-card-foreground mb-4">${item.price}</p>
            <div className="flex space-x-2">
              <button className="flex-1 bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button className="p-2 border border-border rounded-lg hover:bg-accent transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-card-foreground">Account Settings</h2>

      {/* Personal Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Full Name</label>
            <input 
              type="text" 
              value={userData.name}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Email</label>
            <input 
              type="email" 
              value={userData.email}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">Phone Number</label>
            <input 
              type="tel" 
              value={userData.phone}
              className="w-full px-3 py-2 border border-border rounded-lg bg-card text-card-foreground"
              readOnly
            />
          </div>
        </div>
        <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          Update Information
        </button>
      </div>

      {/* Security */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-card-foreground">Password</p>
                <p className="text-sm text-muted-foreground">Last changed 3 months ago</p>
              </div>
            </div>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">Change</button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-card-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive updates about your orders</p>
              </div>
            </div>
            <button className="w-12 h-6 bg-primary rounded-full p-1 transition-colors">
              <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-card-foreground">Language & Region</p>
                <p className="text-sm text-muted-foreground">English (US)</p>
              </div>
            </div>
            <button className="text-primary hover:text-primary/80 text-sm font-medium">Change</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSupport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-card-foreground">Help & Support</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Phone Support</h3>
              <p className="text-sm text-muted-foreground">Mon-Fri, 9AM-6PM EST</p>
            </div>
          </div>
          <p className="text-lg font-semibold text-card-foreground mb-2">1-800-SUPPORT</p>
          <button className="w-full mt-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            Call Now
          </button>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-chart-2" />
            </div>
            <div>
              <h3 className="font-semibold text-card-foreground">Email Support</h3>
              <p className="text-sm text-muted-foreground">24/7 response within 24hrs</p>
            </div>
          </div>
          <p className="text-card-foreground mb-2">support@store.com</p>
          <button className="w-full mt-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            Send Email
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-card-foreground">How do I track my order?</h4>
            <p className="text-sm text-muted-foreground mt-1">You can track your order using the tracking number sent to your email.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-card-foreground">What is your return policy?</h4>
            <p className="text-sm text-muted-foreground mt-1">We offer 30-day returns for most items in original condition.</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium text-card-foreground">How do I change my shipping address?</h4>
            <p className="text-sm text-muted-foreground mt-1">You can update your address in the Address Book section.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'addresses': return renderAddresses();
      case 'payments': return renderPaymentMethods();
      case 'wishlist': return renderWishlist();
      case 'settings': return renderSettings();
      case 'support': return renderSupport();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Mobile Menu Button */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex items-center space-x-2 text-card-foreground"
          >
            <Menu className="w-6 h-6" />
            <span>Account Menu</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className={`lg:w-64 ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card border border-border rounded-lg p-4">
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b border-border">
                <img 
                  src={userData.profilePicture} 
                  alt={userData.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-card-foreground">{userData.name}</p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        activeSection === item.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                
                <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-6 pt-6 border-t border-border">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAccountDashboard;