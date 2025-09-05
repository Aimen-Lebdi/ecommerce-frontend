import React, { useState } from 'react';
import { Check, Package, Truck, CreditCard, Mail, Phone, ArrowRight, Download, Share } from 'lucide-react';

const OrderConfirmationPage = () => {
  // Mock order data - in real app this would come from props/context
  const orderData = {
    orderNumber: "ORD-2025-0001287",
    orderDate: "September 5, 2025",
    customerEmail: "john.doe@email.com",
    estimatedDelivery: "September 12-15, 2025",
    items: [
      {
        id: 1,
        name: "Premium Wireless Headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&crop=center",
        quantity: 1,
        price: 199.99,
        color: "Midnight Black"
      },
      {
        id: 2,
        name: "Smart Watch Series 8",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&crop=center",
        quantity: 1,
        price: 399.99,
        color: "Space Gray"
      }
    ],
    shipping: {
      method: "Standard Shipping",
      cost: 9.99,
      address: {
        name: "John Doe",
        street: "123 Main Street",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "United States"
      }
    },
    payment: {
      method: "Visa ending in 4242",
      amount: 609.97
    },
    subtotal: 599.98,
    tax: 48.00,
    total: 657.97
  };

  const [emailSent, setEmailSent] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Thank You for Your Order!
            </h1>
            <p className="text-gray-600 mb-4">
              Your order has been confirmed and is being processed
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {orderData.orderNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Email Confirmation Notice */}
        {emailSent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-blue-800 font-medium">Confirmation email sent</p>
              <p className="text-blue-700 text-sm">
                We've sent a confirmation email to <strong>{orderData.customerEmail}</strong>
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Order Summary - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
              </div>
              
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">Color: {item.color}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{orderData.shipping.address.name}</p>
                    <p>{orderData.shipping.address.street}</p>
                    <p>
                      {orderData.shipping.address.city}, {orderData.shipping.address.state} {orderData.shipping.address.zip}
                    </p>
                    <p>{orderData.shipping.address.country}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Method</h3>
                  <p className="text-sm text-gray-600">{orderData.shipping.method}</p>
                  
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Estimated Delivery</p>
                    <p className="text-sm text-green-700">{orderData.estimatedDelivery}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{orderData.payment.method}</p>
                  <p className="text-sm text-gray-600">Transaction completed successfully</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            
            {/* Order Total */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">${orderData.shipping.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">${orderData.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-semibold text-gray-900">${orderData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                Order placed on {orderData.orderDate}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Download Invoice</span>
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <span className="text-sm font-medium text-gray-900">Share Order</span>
                  <Share className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Support Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Customer Support</p>
                    <p className="text-xs text-gray-600">1-800-SUPPORT</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email Support</p>
                    <p className="text-xs text-gray-600">support@store.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
              <Truck className="w-5 h-5" />
              <span>Track Your Order</span>
            </button>
            
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2">
              <Package className="w-5 h-5" />
              <span>View All Orders</span>
            </button>
            
            <button className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2">
              <span>Continue Shopping</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 bg-chart-2/10 border border-chart-2/20 rounded-lg p-4">
          <h3 className="font-medium text-chart-2 mb-2">What happens next?</h3>
          <ul className="text-sm text-chart-2/80 space-y-1">
            <li>• We'll process your order within 1-2 business days</li>
            <li>• You'll receive shipping updates via email and SMS</li>
            <li>• Track your package using the order number above</li>
            <li>• Contact us if you have any questions or concerns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;