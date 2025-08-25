import { useState } from "react";

const tabs = ["Description", "Additional Info", "Specification", "Review"];

const tabContent: Record<string, React.ReactNode> = {
  "Description": (
    <p>
      The 2023 Apple MacBook Pro is powered by the Apple M1 chip and offers industry-leading performance for professionals and creatives alike. The 13-inch Retina display, 8GB unified memory, and 512GB SSD deliver fast speeds and stunning visuals.
    </p>
  ),
  "Additional Info": (
    <ul className="list-disc ml-4 space-y-1">
      <li>Brand: Apple</li>
      <li>Model: MacBook Pro 2023</li>
      <li>Color: Space Gray</li>
      <li>Battery Life: Up to 20 hours</li>
    </ul>
  ),
  "Specification": (
    <table className="table-auto border border-collapse w-full text-left text-sm">
      <tbody>
        <tr><th className="border p-2">Processor</th><td className="border p-2">Apple M1</td></tr>
        <tr><th className="border p-2">RAM</th><td className="border p-2">8GB Unified Memory</td></tr>
        <tr><th className="border p-2">Storage</th><td className="border p-2">512GB SSD</td></tr>
        <tr><th className="border p-2">Display</th><td className="border p-2">13-inch Retina</td></tr>
      </tbody>
    </table>
  ),
  "Review": (
    <p>No reviews yet. Be the first to leave one!</p>
  )
};

const ProductTabs = () => {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-4 text-sm font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 border-b-2 ${
              activeTab === tab ? "border-blue text-blue" : "border-transparent text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="text-sm leading-relaxed text-secondary">
        {tabContent[activeTab]}
      </div>
    </div>
  );
};

export default ProductTabs;
