
const wishlist = [
    {
      id: "1",
      name: "Bose Sport Earbuds - Wireless Earphones",
      price: "$999",
      originalPrice: "$1299",
      image: "/public/image.jpg",
      stock: "IN STOCK",
    },
    {
      id: "2",
      name: "Simple Mobile 5G LTE Galaxy 12 Mini 512GB Gaming Phone",
      price: "$2,300.00",
      image: "/public/xbox.png",
      stock: "IN STOCK",
    },
    {
      id: "3",
      name: "Portable Washing Machine, 11lbs capacity Model 18N8F1AM",
      price: "$70.00",
      image: "/public/image.jpg",
      stock: "IN STOCK",
    },
    {
      id: "4",
      name: "TOZO T6 True Wireless Earbuds Bluetooth Headphones",
      price: "$220.00",
      originalPrice: "$265.00",
      image: "/public/image.jpg",
      stock: "OUT OF STOCK",
    },
    {
      id: "5",
      name: "Wyze Cam Pan v2 1080p Wi-Fi Indoor Smart Home Camera",
      price: "$1,499.99",
      image: "/public/image.jpg",
      stock: "IN STOCK",
    },
  ];
const WishlistPage = () => {
  return (
    <main className="py-10">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl text-center text-blue font-bold mb-6">Wishlist</h1>

        <div className="w-full overflow-x-auto">
          <table className="min-w-full bg-white table-auto  rounded-4xl overflow-hidden shadow-sm">
            <thead className="bg-secondary text-left text-sm font-semibold text-black">
              <tr>
                <th className="py-3 px-4">PRODUCTS</th>
                <th className="py-3 px-4">PRICE</th>
                <th className="py-3 px-4">STOCK STATUS</th>
                <th className="py-3 px-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {wishlist.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {/* Product info */}
                  <td className="py-4 px-4 flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-4xl" />
                    <div>{item.name}</div>
                  </td>

                  {/* Price */}
                  <td className="py-4 px-4">
                    {item.originalPrice && (
                      <span className="text-gray-400 line-through mr-2">{item.originalPrice}</span>
                    )}
                    <span className="text-black font-semibold">{item.price}</span>
                  </td>

                  {/* Stock */}
                  <td className="py-4 px-4">
                    <span
                      className={
                        item.stock === "IN STOCK"
                          ? "text-green-600 font-medium"
                          : "text-red-500 font-medium"
                      }
                    >
                      {item.stock}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        className={`px-4 py-1.5 text-sm text-white rounded transition ${
                          item.stock === "OUT OF STOCK"
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600"
                        }`}
                        disabled={item.stock === "OUT OF STOCK"}
                      >
                        ADD TO CART
                      </button>
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                        title="Remove"
                      >
                        ❌
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
export default WishlistPage