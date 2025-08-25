const brands = [
  "Apple",
  "Samsung",
  "Dell",
  "HP",
  "Sony",
  "Xiaomi",
  "Logitech",
  "JBL",
];

const SidebarBrands = () => {
  return (
    <div>
      <h3 className="font-bold mb-2">POPULAR BRANDS</h3>
      <ul className="space-y-1">
        {brands.map((brand, i) => (
          <li key={i}>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue" />
              {brand}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarBrands;
