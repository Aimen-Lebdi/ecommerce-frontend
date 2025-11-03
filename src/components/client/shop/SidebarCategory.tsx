const categories = [
  "Electronics Devices",
  "Computer & Laptop",
  "Smartphone",
  "Headphones",
  "Gaming & VR",
  "Cameras & Photo",
  "TV & Home Appliances",
  "Watches & Accessories",
  "Smart Home",
];

const SidebarCategory = () => {
  return (
    <div>
      <h3 className="font-bold mb-2">CATEGORY</h3>
      <ul className="space-y-1">
        {categories.map((cat, i) => (
          <li key={i} className="cursor-pointer hover:text-blue font-medium">
            • {cat}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarCategory;
