const ShopHeaderBar = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 text-sm text-secondary">
      {/* Breadcrumbs */}
      <div className="space-x-1">
        <span>Home</span> <span>{'>'}</span> <span>Shop</span> <span>{'>'}</span> <span className="font-bold">Electronics</span>
      </div>

      {/* Sort Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="sort">Sort by:</label>
        <select id="sort" className="border px-2 py-1 rounded">
          <option value="popular">Most Popular</option>
          <option value="new">Newest</option>
          <option value="low-high">Price: Low to High</option>
          <option value="high-low">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};

export default ShopHeaderBar;
