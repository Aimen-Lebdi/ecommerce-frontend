const blogPosts = [
  {
    title: "The Future of Gaming Tech",
    image: "/public/image.jpg",
    link: "#",
  },
  {
    title: "Top Smart Home Devices in 2025",
    image: "/public/image.jpg",
    link: "#",
  },
  {
    title: "Why You Should Upgrade to 5G",
    image: "/public/xbox.png",
    link: "#",
  },
];

const Blogs = () => {
  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold text-blue  mb-6 text-center">
        Latest News
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {blogPosts.map((post, index) => (
          <div
            key={index}
            className="bg-white p-3 rounded-4xl shadow-sm hover:shadow-md transition"
          >
            <div className="w-full h-56 mb-4 place-items-center">
              <img
                src={post.image}
                alt={post.title}
                className="h-full object-cover rounded-3xl"
              />
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-secondary mb-2">
                {post.title}
              </h3>
              <a
                href={post.link}
                className="text-blue hover:underline text-sm font-medium"
              >
                Read More →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blogs;
