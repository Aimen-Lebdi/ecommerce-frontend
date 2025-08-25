const tags = [
  "Gaming",
  "4K",
  "Wireless",
  "Smart",
  "Monitor",
  "Laptop",
  "Tablet",
  "Drone",
  "Speaker",
];

const SidebarTags = () => {
  return (
    <div>
      <h3 className="font-bold mb-2">POPULAR TAG</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span
            key={i}
            className="bg-light-blue text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SidebarTags;
