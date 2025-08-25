const categories = [
  { name: "PlayStation", image: "/public/image.jpg" },
  { name: "Drones", image: "/public/xbox.png" },
  { name: "Smartphones", image: "/public/image.jpg" },
  { name: "Headphones", image: "/public/image.jpg" },
  { name: "Wearables", image: "/public/image.jpg" },
  { name: "Cameras", image: "/public/image.jpg" },
];

const Categories = () => {
  return (
    <section className="w-full py-10">
      <h2 className="text-2xl font-bold text-center text-blue mb-8">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((category) => (
          <div
            key={category.name}
            className="bg-white text-center p-2 rounded-3xl shadow hover:shadow-lg transition hover:-translate-y-1 cursor-pointer"
          >
            <div className="w-full h-32 mb-2 place-items-center">
              <img
                src={category.image}
                alt={category.name}
                className=" h-full object-cover rounded-2xl "
              />
            </div>
            <p className="text-sm font-medium text-secondary">
              {category.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Categories;
