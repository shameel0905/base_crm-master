import { useState, useRef, useEffect } from "react";

const initialFilters = [
  { name: "All", count: 42 },
  { name: "Unfulfilled", count: 12 },
  { name: "Unpaid", count: 7 },
  { name: "Open", count: 23 },
  { name: "Archived", count: 15 },
  { name: "Local Delivery", count: 9 },
];

function FilterTabs({ filters }) {
  const filterList = filters && filters.length > 0 ? filters : initialFilters;
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef([]);
  const highlightRef = useRef(null);
  const [highlightStyle, setHighlightStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const tab = tabRefs.current[activeTab];
      setHighlightStyle({
        left: tab.offsetLeft,
        width: tab.offsetWidth,
      });
    }
  }, [activeTab, filterList]);

  return (
    <div className="relative w-full overflow-x-auto bg-black">
      <div className="flex gap-2 bg-black p-2 rounded-xl shadow-lg relative min-w-max">
        {/* Highlight background */}
        <span
          ref={highlightRef}
          className="absolute top-2 bottom-2 rounded-lg bg-gradient-to-r from-[#005660] to-[#005660] blur-md transition-all duration-300 z-0"
          style={{ left: highlightStyle.left, width: highlightStyle.width }}
        ></span>
        {filterList.map((filter, index) => (
          <button
            key={filter.name}
            ref={el => (tabRefs.current[index] = el)}
            onClick={() => setActiveTab(index)}
            className={`relative px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 whitespace-nowrap transition-all duration-300 z-10
              ${
                activeTab === index
                  ? "bg-gradient-to-r from-[var(--theme-color)] to-[var(--theme-color)] text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
              }
            `}
          >
            <span>{filter.name}</span>
            <span
              className={`px-2 py-0.5 text-xs rounded-full transition-all duration-300 
                ${
                  activeTab === index
                    ? "bg-black/20 text-white"
                    : "bg-gray-700/60 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-200"
                }`}
            >
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { FilterTabs };
export default FilterTabs;
