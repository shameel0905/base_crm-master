
import { 
  Bold, 
  Italic, 
  Underline, 
  Link2, 
  Image,
  Video,
  AlignLeft,
  AlignCenter,
  Type,
  Upload,
  ArrowLeft
} from "lucide-react";
import { useState } from "react";
import { useProducts } from "../context/ProductsContext";
import { useNavigate } from "react-router-dom";

export function ProductForm() {

  // Form state
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [descType, setDescType] = useState("paragraph");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [cost, setCost] = useState("");
  const [chargeTax, setChargeTax] = useState(false);
  const [status, setStatus] = useState("draft");
  const [brand, setBrand] = useState("cwc");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("indoor");
  const [vendor, setVendor] = useState("");

  // Calculate profit and margin
  const parsedPrice = parseFloat(price) || 0;
  const parsedCost = parseFloat(cost) || 0;
  const profit = parsedPrice - parsedCost;
  const margin = parsedPrice > 0 ? ((profit / parsedPrice) * 100).toFixed(2) : '0.00';

  // Variations state
  const [variations, setVariations] = useState([
    { name: '', price: '', sku: '' }
  ]);

  const navigate = useNavigate();
  const { products, setProducts } = useProducts();

  const handleSave = () => {
    const newProduct = {
      id: Date.now(),
      name: title,
      image: require("../assets/images/tracksuit.png"),
      status,
      inventory: "0 in Stock",
      type,
      price: price ? `$${price}` : "",
      category,
      vendor,
      variations: variations.filter(v => v.name && v.price)
    };
    setProducts([newProduct, ...products]);
    navigate("/products");
  };

  const handleDiscard = () => {
    setTitle("");
    setDesc("");
    setDescType("paragraph");
    setPrice("");
    setComparePrice("");
    setCost("");
    setChargeTax(false);
    setStatus("draft");
    setBrand("cwc");
    setCategory("");
    setType("indoor");
    setVendor("");
  };

  return (
    <div className="flex flex-col gap-6 px-4">
      {/* Top Row: Back+Heading, Actions */}
      <div className="flex items-center justify-between mb-4 gap-4">
{/* Backward Feature + Heading */}
<div className="flex items-center gap-4 flex-1">
              <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 text-gray-700 font-medium"
                            onClick={() => navigate("/products")}
              >
                            <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 ml-2">Add Product</h2>
</div>
{/* Top Action Buttons */}
        <div className="flex flex-1 justify-end gap-2">
          <button type="button" className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 font-medium" onClick={handleDiscard}>
            Discard
          </button>
          <button type="button" className="px-4 py-2 rounded-lg bg-[var(--theme-color)] text-white font-medium hover:opacity-90" onClick={handleSave}>
            Save Product
          </button>
        </div>
      </div>
      <div className="flex gap-6">
        {/* Main Form */}

        <div className="flex-1 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium block">
              Title
            </label>
            <input
              id="title"
              placeholder="Product Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium block">Description</label>
            <div className="border border-gray-300 rounded-lg bg-gray-100">
              {/* Rich Text Toolbar */}
              <div className="flex items-center gap-1 p-3 border-b border-gray-300">
                <select value={descType} onChange={e => setDescType(e.target.value)} className="w-32 h-8 bg-transparent border-none text-sm">
                  <option value="paragraph">Paragraph</option>
                  <option value="heading1">Heading 1</option>
                  <option value="heading2">Heading 2</option>
                </select>
                <div className="w-px h-4 bg-gray-300 mx-2" />
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Bold className="w-4 h-4" /></button>
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Italic className="w-4 h-4" /></button>
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Underline className="w-4 h-4" /></button>
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Type className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-gray-300 mx-2" />
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><AlignLeft className="w-4 h-4" /></button>
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><AlignCenter className="w-4 h-4" /></button>
                <div className="w-px h-4 bg-gray-300 mx-2" />
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Link2 className="w-4 h-4" /></button>
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Image className="w-4 h-4" /></button>
                <button type="button" className="h-8 w-8 p-0 flex items-center justify-center hover:bg-gray-200 rounded border border-gray-300"><Video className="w-4 h-4" /></button>
              </div>
              {/* Text Area */}
              <textarea 
                className="min-h-32 border-none bg-transparent resize-none focus:ring-0 w-full p-3"
                placeholder="Write your product description here..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          </div>

          {/* Add Media Section */}
          <div className="bg-gray-100 rounded-xl border border-gray-300 p-6">
            <h2 className="text-xl font-semibold mb-2">Add Media</h2>
            <p className="text-gray-500 mb-6">
              Add images, videos, 3D models to show products details and features.
            </p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#005660] transition-colors">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#005660]" />
                </div>
                <button type="button" className="border border-[var(--theme-color)] text-[var(--theme-color)] hover:bg-[var(--theme-color)] hover:text-white px-4 py-2 rounded transition-colors flex items-center">
                  Add file
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          

          {/* Pricing Section */}
          <div className="bg-gray-100 rounded-xl border border-gray-300 p-6">
            <h2 className="text-xl font-semibold mb-6">Pricing</h2>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    id="price"
                    placeholder="0.00"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="pl-7 bg-white border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="compare-price" className="text-sm font-medium">Compare at price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    id="compare-price"
                    placeholder="0.00"
                    value={comparePrice}
                    onChange={e => setComparePrice(e.target.value)}
                    className="pl-7 bg-white border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
            </div>
            {/* Variations Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Product Variations</h3>
              {variations.map((variation, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-4 mb-2">
                  <input
                    type="text"
                    placeholder="Variation name (e.g. Size, Color)"
                    value={variation.name}
                    onChange={e => setVariations(vs => vs.map((v, i) => i === idx ? { ...v, name: e.target.value } : v))}
                    className="bg-white border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="Price"
                    value={variation.price}
                    onChange={e => setVariations(vs => vs.map((v, i) => i === idx ? { ...v, price: e.target.value } : v))}
                    className="bg-white border border-gray-300 rounded px-3 py-2"
                  />
                  <input
                    type="text"
                    placeholder="SKU (optional)"
                    value={variation.sku}
                    onChange={e => setVariations(vs => vs.map((v, i) => i === idx ? { ...v, sku: e.target.value } : v))}
                    className="bg-white border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-2 rounded bg-[#005660] text-white hover:bg-[#00444d] text-sm"
                onClick={() => setVariations(vs => [...vs, { name: '', price: '', sku: '' }])}
              >
                + Add Variation
              </button>
            </div>
            <div className="flex items-center space-x-2 mb-6">
              <input type="checkbox" id="tax" className="h-4 w-4 rounded border-gray-300" checked={chargeTax} onChange={e => setChargeTax(e.target.checked)} />
              <label htmlFor="tax" className="text-sm font-medium">Charge tax on this product</label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label htmlFor="cost" className="text-sm font-medium">Cost per item</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                  <input
                    id="cost"
                    placeholder="0.00"
                    value={cost}
                    onChange={e => setCost(e.target.value)}
                    className="pl-7 bg-white border border-gray-300 rounded px-3 py-2 w-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Profit</label>
                <div className="h-10 bg-gray-200 rounded-md flex items-center px-3 text-gray-900">
                  {parsedPrice && parsedCost ? `$${profit.toFixed(2)}` : '---'}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Margin</label>
                <div className="h-10 bg-gray-200 rounded-md flex items-center px-3 text-gray-900">
                  {parsedPrice && parsedCost ? `${margin}%` : '---'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 space-y-6">
          {/* Product Status */}
          <div className="border rounded-lg bg-white">
            <div className="border-b px-4 py-2">
              <span className="text-lg font-semibold">Product Status</span>
            </div>
            <div className="p-4 space-y-4">
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
              <p className="text-sm text-gray-500">
                This product hidden from all sales channels.
              </p>
            </div>
          </div>

          {/* Select Brand */}
          <div className="border rounded-lg bg-white">
            <div className="border-b px-4 py-2">
              <span className="text-lg font-semibold">Select Brand</span>
            </div>
            <div className="p-4">
              <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="cwc">CWC</option>
                <option value="bbdazz">BBDAZZ</option>
                
              </select>
            </div>
          </div>

          {/* Product Organization */}
          <div className="border rounded-lg bg-white">
            <div className="border-b px-4 py-2">
              <span className="text-lg font-semibold">Product Organization</span>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium block">Product category</label>
                <input 
                  placeholder="search product category"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium block">Product Type</label>
                <input 
                  placeholder="indoor"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium block">Vendor</label>
                <input 
                  placeholder="Vendor name"
                  value={vendor}
                  onChange={e => setVendor(e.target.value)}
                  className="bg-gray-100 border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
