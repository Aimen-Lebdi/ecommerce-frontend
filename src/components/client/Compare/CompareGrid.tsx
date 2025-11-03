// import CompareCard from "./CompareCard";
// type Product = {
//   title: string;
//   image: string;
//   customer_feedback: string;
//   price: string;
//   sold_by: string;
//   brand: string;
//   model: string;
//   stock_status: string;
//   size: string;
//   weight: string;
// };
// const headers: { label: string; key: keyof Product }[] = [
//   { label: "Customer feedback", key: "customer_feedback" },
//   { label: "Price", key: "price" },
//   { label: "Sold by", key: "sold_by" },
//   { label: "Brand", key: "brand" },
//   { label: "Model", key: "model" },
//   { label: "Stock status", key: "stock_status" },
//   { label: "Size", key: "size" },
//   { label: "Weight", key: "weight" },
// ];

// const products = [
//   {
//     title: "Gamdias ARES M2 Gaming Keyboard, Mouse and Mouse Mat Combo",
//     image: "/images/gamdias.png",
//     customer_feedback: "⭐⭐⭐⭐☆ (17,846)",
//     price: "$899.00",
//     sold_by: "Clicon",
//     brand: "StarTech",
//     model: "ARES M2 and ZEUS E2",
//     stock_status: "IN STOCK",
//     size: "67 inches, 110.5 cm",
//     weight: "650 g (2.74 oz)",
//   },
//   {
//     title: 'Apple iMac 24" 4K Retina Display M1 8-Core CPU, 256GB SSD',
//     image: "/images/imac.png",
//     customer_feedback: "⭐⭐⭐⭐⭐ (873,971)",
//     price: "$1,699.00",
//     sold_by: "Apple",
//     brand: "Apple",
//     model: "Apple iMac 24” M1 Blue 2021",
//     stock_status: "IN STOCK",
//     size: "67 inches, 108.8 cm",
//     weight: "240 g (8.47 oz)",
//   },
//   // {
//   //   title: "Samsung Galaxy S21 FE 5G Cell Phone, 128GB, 120Hz Display",
//   //   image: "/images/s21fe.png",
//   //   customer_feedback: "⭐⭐⭐⭐☆ (86,945)",
//   //   price: "$699.99",
//   //   sold_by: "Clicon",
//   //   brand: "Samsung",
//   //   model: "S21 FE",
//   //   stock_status: "OUT OF STOCK",
//   //   size: "64 inches, 98.9 cm",
//   //   weight: "177 g (6.24 oz)",
//   // },
// ];

// export default function CompareGrid() {
//   return (
//     <div className="overflow-x-auto bg-white p-10 rounded-4xl">
//       <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
//         <div className="flex flex-col items-center justify-center border rounded-lg h-full min-h-[400px] bg-gray-50 hover:bg-gray-100 transition">
//           <button className="text-blue-600 font-medium hover:underline">
//             + Add Product
//           </button>
//         </div>

//         {products.map((product, i) => (
//           <CompareCard key={i} product={product} />
//         ))}
//       </div>

//       <div className="mt-8 space-y-4 table-auto">
//         {headers.map(({ label, key }) => (
//           <div
//             key={key}
//             className="grid grid-cols-[auto_repeat(3,minmax(250px,1fr))] gap-6 border-t pt-4"
//           >
//             <div className="font-semibold">{label}</div>
//             {products.map((product, i) => (
//               <div key={i}>{product[key]}</div>
//             ))}
//           </div>
//         ))}
//         {/* <table>
//           <thead>
//             <tr>
//               {headers.map(({ label }) => (
//                 <th key={label} className="text-left font-semibold py-2 px-4">
//                   {label}
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {headers.map(({ label }) => (
//                 <th key={label} className="text-left font-semibold py-2 px-4">
//                   {label}
//                 </th>
//               ))}
//             {products.map((product, i) => (
//               <tr key={i}>
                
//                 {headers.map(({ key }) => (
//                   <td key={key} className="py-2 px-4">
//                     {product[key]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table> */}
//       </div>
//     </div>
//   );
// }
import CompareCard from "./CompareCard";

type Product = {
  title: string;
  image: string;
  customer_feedback: string;
  price: string;
  sold_by: string;
  brand: string;
  model: string;
  stock_status: string;
  size: string;
  weight: string;
};

const headers: { label: string; key: keyof Product }[] = [
  { label: "Customer feedback", key: "customer_feedback" },
  { label: "Price", key: "price" },
  { label: "Sold by", key: "sold_by" },
  { label: "Brand", key: "brand" },
  { label: "Model", key: "model" },
  { label: "Stock status", key: "stock_status" },
  { label: "Size", key: "size" },
  { label: "Weight", key: "weight" },
];

const products: Product[] = [
  {
    title: "Gamdias ARES M2 Gaming Keyboard, Mouse and Mouse Mat Combo",
    image: "/images/gamdias.png",
    customer_feedback: "⭐⭐⭐⭐☆ (17,846)",
    price: "$899.00",
    sold_by: "Clicon",
    brand: "StarTech",
    model: "ARES M2 and ZEUS E2",
    stock_status: "IN STOCK",
    size: "67 inches, 110.5 cm",
    weight: "650 g (2.74 oz)",
  },
  {
    title: 'Apple iMac 24" 4K Retina Display M1 8-Core CPU, 256GB SSD',
    image: "/images/imac.png",
    customer_feedback: "⭐⭐⭐⭐⭐ (873,971)",
    price: "$1,699.00",
    sold_by: "Apple",
    brand: "Apple",
    model: "Apple iMac 24” M1 Blue 2021",
    stock_status: "IN STOCK",
    size: "67 inches, 108.8 cm",
    weight: "240 g (8.47 oz)",
  },
];

export default function CompareGrid() {
  return (
    <div className="overflow-x-auto bg-white p-10 rounded-4xl">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="text-left w-48"></th> {/* empty header for labels */}
            {/* Add Product column */}
            <th className="align-top px-4 py-2">
              <div className="flex flex-col items-center justify-center border rounded-lg h-full min-h-[300px] bg-gray-50 hover:bg-gray-100 transition p-4">
                <button className="text-blue-600 font-medium hover:underline">
                  + Add Product
                </button>
              </div>
            </th>
            {products.map((product, i) => (
              <th key={i} className="align-top px-4 py-2">
                <CompareCard product={product} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {headers.map(({ label, key }) => (
            <tr key={key} className="border-t">
              <td className="font-semibold py-4 pr-4">{label}</td>
              <td className="py-4 text-gray-700 text-sm text-center">–</td> {/* empty for Add Product */}
              {products.map((product, i) => (
                <td key={i} className="py-4 text-sm text-gray-800 text-center">
                  {product[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
