const prices = [
  "All Price",
  "Under $100",
  "$100 to $200",
  "$200 to $500",
  "$500 to $1000",
  "$1000 to $2000",
  "$2000+",
];

const SidebarPrice = () => {
  return (
    <div>
      <h3 className="font-bold mb-2">PRICE RANGE</h3>
      <ul className="space-y-1">
        {prices.map((range, i) => (
          <li key={i}>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-blue" />
              {range}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarPrice;
