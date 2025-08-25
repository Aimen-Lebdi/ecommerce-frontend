const Pagination = () => {
  return (
    <div className="mt-10 flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((page) => (
        <button
          key={page}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white text-sm hover:bg-blue hover:text-white transition"
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
