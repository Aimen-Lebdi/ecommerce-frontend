const bestDeals = [
  {
    title: "MacBook Pro",
    image: "/public/xbox.png",
    description: "Save up to 20% on selected models",
    background: "bg-light-blue",
  },
  {
    title: "Gaming Accessories",
    image: "/public/image.jpg",
    description: "Top-rated gear for pro gamers",
    background: "bg-orange-100",
  },
  {
    title: "Smart TVs",
    image: "/public/xbox.png",
    description: "Big screen experience starts here",
    background: "bg-green-100",
  },
];

const BestDeals = () => {
  return (
    <section className="w-full py-10">
      <h2 className="text-2xl font-bold text-center text-blue mb-8">
        Best Deals
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {bestDeals.map((deal, index) => (
          <div key={index} className={`rounded-4xl py-4 px-3 bg-white`}>
            <div className=" w-full h-58 place-items-center rounded-3xl mb-4">
              <img
                src={deal.image}
                alt={deal.title}
                className=" h-full object-cover rounded-3xl "
              />
            </div>

            <h3 className="text-lg font-semibold mb-2">{deal.title}</h3>
            <p className="text-sm text-secondary  mb-4">
              {deal.description}
            </p>
            <button className="bg-blue text-white px-4 py-2 rounded-full text-sm hover:bg-light-blue">
              Shop Now
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestDeals;
