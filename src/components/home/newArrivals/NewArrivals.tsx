const newArrivals = [
  {
    title: "Sony WH-1000XM5",
    image: "/public/image.jpg",
    price: "$349.99",
  },
  {
    title: "iPhone 15 Pro",
    image: "/public/image.jpg",
    price: "$999.00",
  },
  {
    title: "DJI Mini Drone",
    image: "/public/xbox.png",
    price: "$499.99",
  },
  {
    title: "Apple Watch Ultra",
    image: "/public/image.jpg",
    price: "$799.99",
  },
];

const NewArrivals = () => {
  return (
    <section className="w-full py-10">
      <h2 className="text-2xl font-bold text-center text-blue mb-8">
        New Arrivals
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {newArrivals.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-4xl p-3 shadow hover:shadow-lg transition"
          >
            <div className="w-full h-48 mb-4 place-items-center">
              <img
                src={product.image}
                alt={product.title}
                className="h-full object-cover rounded-3xl "
              />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-secondary">
              {product.title}
            </h3>
            <p className="text-blue text-md font-bold">{product.price}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
