import { Bold, Italic, Underline, Link2, Image,Video,AlignLeft,AlignCenter,Type,Upload,ArrowLeft,  Trash2,Plus,X,Eye,EyeOff,Package,Truck,Tag,FolderOpen,DollarSign,BarChart3,Settings} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useProducts } from "../context/ProductsContext";
import { useNavigate, useLocation } from "react-router-dom";
import wooCommerceService from "../services/woocommerceService";
import shopifyService from "../services/shopifyService";
import githubUploadService from "../services/githubUploadService";
import SKUGenerator from "../services/skuGenerator";
import { ProductPreviewModal } from "./ProductPreviewModal";

export function ProductForm({ productId, productPlatform }) {
  // Platform selection (WooCommerce or Shopify)
  const [platform, setPlatform] = useState(productPlatform || "woocommerce");

  useEffect(() => {
    // If parent passes a platform prop (from EditProduct), use it
    if (productPlatform) setPlatform(productPlatform);
  }, [productPlatform]);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [cost, setCost] = useState("");
  const [taxStatus, setTaxStatus] = useState("taxable");
  const [taxClass, setTaxClass] = useState("standard");
  const [status, setStatus] = useState("draft");
  const [sku, setSku] = useState("");
  const [manageStock, setManageStock] = useState(false);
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockStatus, setStockStatus] = useState("instock");
  const [backorders, setBackorders] = useState("no");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [soldIndividually, setSoldIndividually] = useState(false);
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [shippingClass, setShippingClass] = useState("");
  const [categories, setCategories] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [virtual, setVirtual] = useState(false);
  const [downloadable, setDownloadable] = useState(false);
  const [productType, setProductType] = useState("simple");
  const [activeTab, setActiveTab] = useState("general");

  // Calculate profit and margin (commented out as requested)
  // const parsedRegularPrice = parseFloat(regularPrice) || 0;
  // const parsedCost = parseFloat(cost) || 0;
  // const profit = parsedRegularPrice - parsedCost;
  // const margin = parsedRegularPrice > 0 ? ((profit / parsedRegularPrice) * 100).toFixed(2) : '0.00';

  // Product attributes
  const [attributes, setAttributes] = useState([]);

  // Variations state
  const [variations, setVariations] = useState([]);
  const [isGeneratingVariations, setIsGeneratingVariations] = useState(false);

  // Images state
  const [images, setImages] = useState([]);

  // State for tracking if we're editing an existing product
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { products, setProducts } = useProducts();

  // WooCommerce connection status
  const [wooCommerceStatus, setWooCommerceStatus] = useState(null);
  const [shopifyStatus, setShopifyStatus] = useState(null);

  // Test WooCommerce connection and generate SKU on component mount
  useEffect(() => {
    const testWooCommerceConnection = async () => {
      try {
        const response = await wooCommerceService.testConnection();
        setWooCommerceStatus(response.success ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('WooCommerce connection test failed:', error);
        setWooCommerceStatus('disconnected');
      }
    };

    const testShopifyConnection = async () => {
      try {
        const response = await shopifyService.testConnection();
        setShopifyStatus(response.success ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Shopify connection test failed:', error);
        setShopifyStatus('disconnected');
      }
    };

    // Generate unique SKU for new products (platform-aware)
    if (!isEditing && !sku) {
      if ((productPlatform || platform) === 'shopify') {
        // Shopify SKUs should start with SHOP-
        const shopifyCode = SKUGenerator.generateRandomCode(6);
        setSku(`SHOP-${shopifyCode}`);
      } else {
        const generatedSKU = SKUGenerator.generateSKU(
          categories.length > 0 ? categories[0].substring(0, 3) : 'PRD'
        );
        setSku(generatedSKU);
      }
    }

    testWooCommerceConnection();
    testShopifyConnection();
  }, []);

  // Fetch product categories on mount / when platform changes
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        if (platform === 'shopify') {
          // Shopify uses collections/product_types — prefer collections
          const response = await shopifyService.getCollections({ limit: 250 });
          if (response.success && Array.isArray(response.data)) {
            const names = response.data.map(c => c.title || c.handle || '').filter(Boolean);
            setAvailableCategories(names);
          } else {
            setAvailableCategories([]);
          }
        } else {
          const response = await wooCommerceService.getAllCategories({ per_page: 100 });
          if (response.success && response.categories) {
            const categoryNames = response.categories.map(cat => cat.name);
            setAvailableCategories(categoryNames);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to default categories if fetch fails
        setAvailableCategories(['Uncategorized', 'Clothing', 'Accessories']);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [platform]);

  // If user returned from ShopifyCollections with selectedCollection id, auto-select and add it
  useEffect(() => {
    if (platform !== 'shopify') return;
    try {
      const params = new URLSearchParams(location.search);
      const selectedId = params.get('selectedCollection');
      if (!selectedId) return;

      (async () => {
        try {
          const resp = await shopifyService.getCollectionById(selectedId);
          if (resp.success && resp.data) {
            const title = resp.data.title || resp.data.handle || '';
            if (title && !availableCategories.includes(title)) {
              setAvailableCategories(prev => [title, ...prev]);
            }
            if (title && !categories.includes(title)) {
              setCategories(prev => [title, ...prev]);
            }
          }
        } catch (e) { /* ignore */ }
      })();
    } catch (e) { /* ignore */ }
  }, [platform, location.search, availableCategories]);

  // Fetch product data when editing (productId is provided)
  useEffect(() => {
    if (!productId) return; // Skip if creating new product

    const fetchProductData = async () => {
      setIsLoading(true);
      setIsEditing(true);
      setEditingProductId(productId);
      try {
        // If this form is editing a Shopify product, use Shopify service
        if (platform === 'shopify') {
          const resp = await shopifyService.getProductById(productId);
          if (resp.success && resp.data) {
            const product = resp.data;

            // Helper to strip HTML tags
            const stripHtmlTags = (html) => {
              if (!html) return "";
              const temp = document.createElement("div");
              temp.innerHTML = html;
              return temp.textContent || temp.innerText || "";
            };

            setTitle(product.name || "");
            setDescription(stripHtmlTags(product.description) || "");
            setShortDescription("");

            const firstVar = (product.variants && product.variants[0]) || {};
            setRegularPrice(firstVar.price || "");
            setSalePrice("");
            setStatus(product.status || "draft");
            setSku(firstVar.sku || "");
            setTaxStatus("taxable");
            setTaxClass("standard");
            setManageStock(firstVar.inventory_quantity !== undefined && firstVar.inventory_quantity !== null);
            setStockQuantity(firstVar.inventory_quantity || "");
            setStockStatus(firstVar.available ? 'instock' : (Number(firstVar.inventory_quantity) > 0 ? 'instock' : 'outofstock'));
            setBackorders('no');
            setWeight(firstVar.weight || "");
            setDimensions({ length: "", width: "", height: "" });
            setShippingClass("");
            setCategories(product.type ? [product.type] : []);
            setTags([]);
            setFeatured(false);
            setVirtual(false);
            setDownloadable(false);
            setProductType(product.type || 'simple');

            if (product.images && product.images.length > 0) {
              const formattedImages = product.images.map((img, index) => ({ id: `img-${Date.now()}-${index}`, url: img, name: `Image ${index+1}`, file: null }));
              setImages(formattedImages);
            }

            if (product.options && product.options.length > 0) {
              const formattedAttrs = product.options.map((opt, i) => ({ id: `attr-${Date.now()}-${i}`, name: opt.name || `Option ${i+1}`, values: opt.values || [], visible: true, variation: true }));
              setAttributes(formattedAttrs);
            }

            if (product.variants && product.variants.length > 0) {
              const formattedVariations = product.variants.map((v) => ({
                id: `variation-${v.id}`,
                attributes: (product.options || []).map((opt, idx) => ({ name: opt.name || `Option`, value: v[`option${idx+1}`] || '' })),
                regularPrice: v.price || '',
                salePrice: '',
                sku: v.sku || '',
                manageStock: v.inventory_quantity !== undefined && v.inventory_quantity !== null,
                stockQuantity: v.inventory_quantity || '',
                stockStatus: v.available ? 'instock' : (Number(v.inventory_quantity) > 0 ? 'instock' : 'outofstock'),
                weight: v.weight || '',
                dimensions: { length: '', width: '', height: '' },
                image: v.image || null,
                enabled: true
              }));
              setVariations(formattedVariations);
            }

            setSuccess(`Shopify product "${product.name}" loaded successfully!`);
          } else {
            setError(resp.error || 'Failed to load Shopify product');
          }

          setIsLoading(false);
          return;
        }

        // Default: WooCommerce
        const response = await wooCommerceService.getProduct(productId);

        if (response.success && response.product) {
          const product = response.product;
          
          // Debug log to check what we're getting
          console.log('Fetched product data:', {
            name: product.name,
            description: product.description,
            short_description: product.short_description
          });
          
          // Helper function to strip HTML tags
          const stripHtmlTags = (html) => {
            if (!html) return "";
            // Create a temporary element to parse HTML
            const temp = document.createElement("div");
            temp.innerHTML = html;
            // Get text content, which automatically removes HTML tags
            return temp.textContent || temp.innerText || "";
          };
          
          // Populate all form fields with fetched data
          setTitle(product.name || "");
          setDescription(stripHtmlTags(product.description) || "");
          setShortDescription(stripHtmlTags(product.short_description) || "");
          
          // For variable products, get prices from first variation if available
          let regularPrice = product.regular_price || "";
          let salePrice = product.sale_price || "";
          
          if (product.type === 'variable' && product.variations && product.variations.length > 0) {
            const firstVariation = product.variations[0];
            regularPrice = regularPrice || (firstVariation.regular_price || "");
            salePrice = salePrice || (firstVariation.sale_price || "");
            console.log(`Loaded prices from first variation: regular=${regularPrice}, sale=${salePrice}`);
          }
          
          setRegularPrice(regularPrice);
          setSalePrice(salePrice);
          setStatus(product.status || "draft");
          setSku(product.sku || "");
          setTaxStatus(product.tax_status || "taxable");
          setTaxClass(product.tax_class || "standard");
          setManageStock(product.manage_stock || false);
          
          // For variable products, get stock from first variation if available
          let stockQuantity = product.stock_quantity || "";
          let stockStatus = product.stock_status || "instock";
          
          if (product.type === 'variable' && product.variations && product.variations.length > 0) {
            const firstVariation = product.variations[0];
            stockQuantity = stockQuantity || (firstVariation.stock_quantity || "");
            stockStatus = stockStatus || (firstVariation.stock_status || "instock");
            console.log(`Loaded stock from first variation: quantity=${stockQuantity}, status=${stockStatus}`);
          }
          
          setStockQuantity(stockQuantity);
          setStockStatus(stockStatus);
          setBackorders(product.backorders || "no");
          setWeight(product.weight || "");
          setDimensions({
            length: product.dimensions?.length || "",
            width: product.dimensions?.width || "",
            height: product.dimensions?.height || ""
          });
          setShippingClass(product.shipping_class || "");
          setCategories(product.categories?.map(cat => cat.name) || []);
          setTags(product.tags?.map(tag => tag.name) || []);
          setFeatured(product.featured || false);
          setVirtual(product.virtual || false);
          setDownloadable(product.downloadable || false);
          setProductType(product.type || "simple");
          
          // Handle attributes
          if (product.attributes && product.attributes.length > 0) {
            const formattedAttributes = product.attributes.map((attr, index) => ({
              id: `attr-${Date.now()}-${index}`,
              name: attr.name || "",
              values: attr.options || [],
              visible: attr.visible !== false,
              variation: attr.variation || false
            }));
            setAttributes(formattedAttributes);
          }
          
          // Handle images
          if (product.images && product.images.length > 0) {
            const formattedImages = product.images.map((img, index) => ({
              id: `img-${Date.now()}-${index}`,
              url: img.src,
              name: img.name || `Image ${index + 1}`,
              file: null // Remote images don't have file object
            }));
            setImages(formattedImages);
          }
          
          // Handle variations for variable products
          if (product.type === 'variable' && product.variations && product.variations.length > 0) {
            console.log(`Loading ${product.variations.length} variations...`);
            const formattedVariations = product.variations.map((variation, index) => ({
              id: `variation-${variation.id}`,
              attributes: variation.attributes || [],
              regularPrice: variation.regular_price || '',
              salePrice: variation.sale_price || '',
              sku: variation.sku || '',
              manageStock: variation.manage_stock || false,
              stockQuantity: variation.stock_quantity || '',
              stockStatus: variation.stock_status || 'instock',
              weight: variation.weight || '',
              dimensions: variation.dimensions || { length: '', width: '', height: '' },
              image: variation.image || null,
              enabled: true
            }));
            setVariations(formattedVariations);
            console.log('Variations loaded:', formattedVariations);
          }
          
          setSuccess(`Product "${product.name}" loaded successfully!`);
        } else {
          setError(response.error || 'Failed to load product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError(`Failed to load product: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId, platform]);

  // Helper: move focus to next field when Enter is pressed
  const focusNextOnEnter = (e, nextId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const next = document.getElementById(nextId);
      if (next) next.focus();
    }
  };

  // Generate variations when attributes change for variable products
  useEffect(() => {
    // Don't auto-generate variations if we're editing (variations already loaded)
    if (isEditing && variations.length > 0) {
      console.log('Editing mode: skipping auto-generation, using loaded variations');
      return;
    }
    
    if (productType === 'variable' && attributes.some(attr => attr.variation && attr.values.length > 0)) {
      generateVariations();
    } else if (productType !== 'variable') {
      setVariations([]);
    }
  }, [attributes, productType, isEditing, variations.length]);

  const generateVariations = () => {
    setIsGeneratingVariations(true);
    
    const variationAttributes = attributes.filter(attr => attr.variation && attr.values.length > 0);
    
    if (variationAttributes.length === 0) {
      setVariations([]);
      setIsGeneratingVariations(false);
      return;
    }

    // Generate all possible combinations
    const combinations = variationAttributes.reduce((acc, attr) => {
      if (acc.length === 0) {
        return attr.values.map(value => [{ name: attr.name, value }]);
      }
      return acc.flatMap(combination =>
        attr.values.map(value => [...combination, { name: attr.name, value }])
      );
    }, []);

    const newVariations = combinations.map((combination, index) => {
      const existingVariation = variations.find(v => 
        v.attributes.length === combination.length &&
        v.attributes.every(attr => 
          combination.some(c => c.name === attr.name && c.value === attr.value)
        )
      );

      return existingVariation || {
        id: `variation-${Date.now()}-${index}`,
        attributes: combination,
        regularPrice: regularPrice || '',
        salePrice: salePrice || '',
        sku: sku ? `${sku}-${index + 1}` : '',
        manageStock: manageStock,
        stockQuantity: stockQuantity || '',
        stockStatus: 'instock',
        weight: weight || '',
        dimensions: dimensions,
        image: null,
        enabled: true
      };
    });

    setVariations(newVariations);
    setIsGeneratingVariations(false);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      setError('Product name is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let response;

      if (platform === 'shopify') {
        // ==================== SHOPIFY PRODUCT CREATION ====================
        const timestamp = Date.now();
        const shopifyProduct = {
          title: title,
          body_html: description || '',
          vendor: 'Store Vendor',
          product_type: productType === 'simple' ? '' : productType,
          slug: title.toLowerCase().replace(/\s+/g, '-'),
          price: regularPrice || '0',
          // Include categories if selected
          categories: categories.length > 0 ? categories : [],
          // Format images as array (Shopify API handles URLs directly)
          images: images
            .filter(img => img.url && !img.url.startsWith('blob:'))
            .map(img => img.url || img.githubUrl),
        };

        // Handle variable products with options and variants
        if (productType === 'variable' && variations.length > 0) {
          // Build options array from attributes - REQUIRED for Shopify multi-variant products
          shopifyProduct.options = attributes
            .filter(attr => attr.variation && attr.values.length > 0)
            .map((attr, idx) => ({
              name: attr.name,
              position: idx + 1,
              values: attr.values,
            }));

          // Build variants array with proper option mappings
          // Each variant must reference options using option1, option2, option3 fields
          shopifyProduct.variants = variations
            .filter(v => v.enabled !== false) // Only include enabled variations
            .map((variation, idx) => {
              const variantObj = {
                price: parseFloat(variation.regularPrice || regularPrice || '0').toString(),
                sku: variation.sku || `${sku}-VAR-${idx}-${timestamp}`,
                inventory_quantity: variation.manageStock ? parseInt(variation.stockQuantity) || 0 : 0,
              };

              // Map variant attributes to option1, option2, option3 fields
              // This is CRITICAL - Shopify uses option1, option2, option3 to map variants to options
              if (Array.isArray(variation.attributes)) {
                variation.attributes.forEach((attr, attrIdx) => {
                  variantObj[`option${attrIdx + 1}`] = attr.value;
                });
              }

              return variantObj;
            });
        } else {
          // Simple product with single variant (no options needed)
          shopifyProduct.variants = [
            {
              price: regularPrice || '0',
              sku: sku || `SHOP-${timestamp}`,
              inventory_quantity: manageStock ? parseInt(stockQuantity) || 0 : 0,
            }
          ];
        }

        console.log('🚀 [SHOPIFY] Sending product data:', shopifyProduct);

        if (isEditing && editingProductId) {
          response = await shopifyService.updateProduct(editingProductId, shopifyProduct);
        } else {
          response = await shopifyService.createProduct(shopifyProduct);
        }

        if (response.success) {
          const actionType = isEditing ? 'updated' : 'created';
          setSuccess(`Product "${title}" ${actionType} successfully in Shopify! ID: ${response.data?.id || 'N/A'}`);
          
          // Update local products context
          const localProduct = {
            id: response.data?.id,
            shopify_id: response.data?.id,
            name: title,
            description: description,
            images: images
              .filter(img => img.url && !img.url.startsWith('blob:'))
              .map(img => img.url || img.githubUrl)
              .filter(Boolean),
            status: status || 'Active',
            sku: sku || `SHOP-${timestamp}`,
            price: regularPrice,
            stock_quantity: stockQuantity,
            // Use actual categories array, not productType
            categories: categories.length > 0 ? categories : ['Uncategorized'],
            vendor: 'Shopify',
            type: productType,
            platform: 'shopify',
            product_type: productType,
          };

          if (isEditing && editingProductId) {
            setProducts(products.map(p => p.id === editingProductId || p.shopify_id === editingProductId ? localProduct : p));
          } else {
            // Add product to beginning of list so it shows immediately
            setProducts([localProduct, ...products]);
          }

          // Notify other UI components to refresh product data (helps instant update)
          try {
            window.dispatchEvent(new CustomEvent('products:refresh', { detail: { platform: 'shopify', id: response.data?.id } }));
          } catch (e) {
            // ignore if dispatch fails
          }

          setTimeout(() => {
            navigate(`/products?platform=${platform}`);
          }, 2000);
        } else {
          const actionType = isEditing ? 'update' : 'create';
          setError(response.error || `Failed to ${actionType} product in Shopify`);
        }

      } else {
        // ==================== WOOCOMMERCE PRODUCT CREATION ====================
        const productData = {
          name: title,
          type: productType,
          status: status,
          description: description,
          short_description: shortDescription,
          ...(productType !== 'variable' && { regular_price: regularPrice }),
          ...(productType !== 'variable' && { sale_price: salePrice }),
          sku: sku || `SKU-${Date.now()}`,
          tax_status: taxStatus,
          tax_class: taxClass,
          manage_stock: manageStock,
          stock_quantity: manageStock ? stockQuantity : null,
          stock_status: stockStatus,
          backorders: backorders,
          sold_individually: soldIndividually,
          weight: weight,
          dimensions: {
            length: dimensions.length,
            width: dimensions.width,
            height: dimensions.height
          },
          shipping_class: shippingClass,
          categories: (categories.length > 0 ? categories : ['uncategorized']).map(cat => ({ name: cat })),
          tags: tags.map(tag => ({ name: tag })),
          featured: featured,
          virtual: virtual,
          downloadable: downloadable,
          attributes: attributes.filter(attr => attr.name.trim() !== '').map(attr => ({
            name: attr.name,
            visible: attr.visible,
            variation: attr.variation,
            options: attr.values
          })),
          images: images
            .filter(img => img.base64 || (img.url && !img.url.startsWith('blob:')))
            .map(img => ({
              src: img.base64 || img.url,
              name: img.name || 'Product Image',
              alt: title
            }))
        };

        if (productType === 'variable' && variations.length > 0) {
          console.log('Variable product variations will need to be created separately:', variations.filter(v => v.enabled));
        }

        console.log('🚀 [WOOCOMMERCE] Sending product data:', productData);

        if (isEditing && editingProductId) {
          console.log(`Updating product ID: ${editingProductId}`);
          response = await wooCommerceService.updateProduct(editingProductId, productData);
        } else {
          console.log('Creating new product');
          response = await wooCommerceService.createProduct(productData);
        }
        
        if (response.success) {
          // Handle variations for variable products (WooCommerce only)
          if (productType === 'variable' && variations.length > 0) {
            if (isEditing && editingProductId) {
              // UPDATE existing variations
              console.log(`\n🔄 Updating ${variations.filter(v => v.enabled).length} variations...`);
              
              for (const variation of variations) {
                if (!variation.enabled) continue; // Skip disabled variations
                
                try {
                  const variationData = {
                    attributes: variation.attributes.map(attr => ({
                      name: attr.name,
                      option: attr.value
                    })),
                    regular_price: variation.regularPrice || '0',
                    sale_price: variation.salePrice || '',
                    sku: variation.sku || `${sku}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    manage_stock: variation.manageStock,
                    stock_quantity: variation.manageStock ? variation.stockQuantity : null,
                    weight: variation.weight || '',
                    dimensions: variation.dimensions || { length: '', width: '', height: '' }
                  };
                  
                  // Extract variation ID from the id field (e.g., "variation-4068" -> 4068)
                  const variationId = variation.id.split('-')[1];
                  
                  console.log(`Updating variation ID ${variationId}: ${variation.attributes.map(a => a.value).join(' - ')}`, variationData);
                  
                  const variationResponse = await wooCommerceService.updateVariation(editingProductId, variationId, variationData);
                  
                  if (variationResponse.success) {
                    console.log(`✅ Variation updated: ${variation.attributes.map(a => a.value).join(' - ')}`);
                  } else {
                    console.error(`❌ Failed to update variation: ${variationResponse.error}`);
                    setError(`Failed to update variation: ${variationResponse.error}`);
                  }
                } catch (error) {
                  console.error(`Error updating variation:`, error);
                  setError(`Error updating variation: ${error.message}`);
                }
              }
            } else {
              // CREATE new variations (new product)
              console.log(`\n🔄 Creating ${variations.filter(v => v.enabled).length} variations...`);
              
              for (const variation of variations) {
                if (!variation.enabled) continue; // Skip disabled variations
                
                try {
                  const variationData = {
                    attributes: variation.attributes.map(attr => ({
                      name: attr.name,
                      option: attr.value
                    })),
                    regular_price: variation.regularPrice || '0',
                    sale_price: variation.salePrice || '',
                    sku: variation.sku || `${sku}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                    manage_stock: variation.manageStock,
                    stock_quantity: variation.manageStock ? variation.stockQuantity : null,
                    weight: variation.weight || '',
                    dimensions: variation.dimensions || { length: '', width: '', height: '' }
                  };
                  
                  console.log(`Creating variation: ${variation.attributes.map(a => a.value).join(' - ')}`, variationData);
                  
                  const variationResponse = await wooCommerceService.createVariation(response.product.id, variationData);
                  
                  if (variationResponse.success) {
                    console.log(`✅ Variation created: ${variation.attributes.map(a => a.value).join(' - ')}`);
                  } else {
                    console.error(`❌ Failed to create variation: ${variationResponse.error}`);
                    setError(`Failed to create variation: ${variationResponse.error}`);
                  }
                } catch (error) {
                  console.error(`Error creating variation:`, error);
                  setError(`Error creating variation: ${error.message}`);
                }
              }
            }
          }
          // Also save to local products context for immediate UI update
          const localProduct = {
            id: response.product.id,
            woocommerce_id: response.product.id,
            name: response.product.name,
            description: response.product.description,
            short_description: response.product.short_description,
            images: response.product.images?.map(img => img.src) || images.map(img => img.url),
            status: response.product.status,
            sku: response.product.sku,
            price: response.product.price ? `$${response.product.price}` : '',
            regular_price: response.product.regular_price,
            sale_price: response.product.sale_price,
            price_html: response.product.price_html,
            tax_status: response.product.tax_status,
            tax_class: response.product.tax_class,
            manage_stock: response.product.manage_stock,
            stock_quantity: response.product.stock_quantity,
            stock_status: response.product.stock_status,
            backorders: response.product.backorders,
            sold_individually: response.product.sold_individually,
            weight: response.product.weight,
            dimensions: response.product.dimensions,
            shipping_class: response.product.shipping_class,
            categories: response.product.categories?.map(cat => cat.name) || categories,
            tags: response.product.tags?.map(tag => tag.name) || tags,
            featured: response.product.featured,
            virtual: response.product.virtual,
            downloadable: response.product.downloadable,
            type: response.product.type,
            attributes: response.product.attributes || [],
            variations: response.product.variations || [],
            meta_data: response.product.meta_data || [],
            date_created: response.product.date_created || new Date().toISOString(),
            date_modified: response.product.date_modified || new Date().toISOString(),
            vendor: 'WooCommerce'
          };

          if (isEditing && editingProductId) {
            // For update, replace the product in the list
            setProducts(products.map(p => p.id === editingProductId || p.woocommerce_id === editingProductId ? localProduct : p));
          setSuccess(`Product "${response.product.name}" updated successfully in WooCommerce!`);
        } else {
          // For create, add to the beginning of the list
          setProducts([localProduct, ...products]);
          setSuccess(`Product "${response.product.name}" created successfully in WooCommerce! ID: ${response.product.id}`);
        }
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          navigate(`/products?platform=${platform}`);
        }, 2000);
        
      } else {
        const actionType = isEditing && editingProductId ? 'update' : 'create';
        setError(response.error || `Failed to ${actionType} product in WooCommerce`);
      }
      }

    } catch (error) {
      const actionType = isEditing && editingProductId ? 'update' : 'create';
      console.error(`Error ${actionType}ing product:`, error);
      setError(`Failed to ${actionType} product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete product function
  const handleDelete = async () => {
    // Check if we're editing an existing product
    if (!isEditing && !editingProductId) {
      alert('No product to delete. This is a new product form.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let productId = editingProductId;
      let response;
      
      // If no editingProductId, ask user for ID (fallback)
      if (!productId) {
        productId = window.prompt(`Enter the ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'} Product ID to delete:`);
        
        if (!productId || isNaN(productId)) {
          setError('Please enter a valid product ID');
          setIsLoading(false);
          return;
        }
      }

      if (platform === 'shopify') {
        // Delete from Shopify
        response = await shopifyService.deleteProduct(productId);
      } else {
        // Delete all product images from GitHub first (if SKU exists) - WooCommerce only
        if (sku) {
          console.log(`🗑️  Deleting all images for product SKU: ${sku}`);
          try {
            const deleteImagesResult = await githubUploadService.deleteImagesBySKU(sku);
            if (deleteImagesResult.success) {
              console.log(`✅ Deleted ${deleteImagesResult.deletedCount} image(s) from GitHub`);
            } else {
              console.warn(`⚠️  Warning deleting images: ${deleteImagesResult.message}`);
            }
          } catch (imageError) {
            console.warn(`⚠️  Error deleting images from GitHub: ${imageError.message}`);
            // Continue with product deletion even if image deletion fails
          }
        }
        response = await wooCommerceService.deleteProduct(productId);
      }
      
      if (response.success) {
        // Remove from local products context
        setProducts(products.filter(p => 
          p.woocommerce_id !== parseInt(productId) && 
          p.shopify_id !== parseInt(productId) &&
          p.id !== parseInt(productId)
        ));
        setSuccess(`Product deleted successfully from ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'}!`);
        
        // Clear form
        resetForm();
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate(`/products?platform=${platform}`);
        }, 2000);
        
      } else {
        setError(response.error || `Failed to delete product from ${platform === 'shopify' ? 'Shopify' : 'WooCommerce'}`);
      }

    } catch (error) {
      console.error('Error deleting product:', error);
      setError(`Failed to delete product: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setShortDescription("");
    setRegularPrice("");
    setSalePrice("");
    setCost("");
    setTaxStatus("taxable");
    setTaxClass("standard");
    setStatus("draft");
    setSku("");
    setManageStock(false);
    setStockQuantity("");
    setStockStatus("instock");
    setBackorders("no");
    setLowStockThreshold("");
    setSoldIndividually(false);
    setWeight("");
    setDimensions({ length: "", width: "", height: "" });
    setShippingClass("");
    setCategories(["uncategorized"]);
    setTags([]);
    setTagInput("");
    setFeatured(false);
    setVirtual(false);
    setDownloadable(false);
    setProductType("simple");
    setAttributes([]);
    setVariations([]);
    setImages([]);
    setEditingProductId(null);
    setIsEditing(false);
  };

  // Attribute functions
  const addAttribute = () => {
    setAttributes([...attributes, { 
      id: `attr-${Date.now()}`, 
      name: '', 
      values: [], 
      visible: true, 
      variation: false
    }]);
  };

  const updateAttribute = (index, field, value) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
    setAttributes(updatedAttributes);
  };

  const removeAttribute = (index) => {
    const updatedAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(updatedAttributes);
  };

  const addAttributeValue = (index, value) => {
    if (!value.trim()) return;
    
    const updatedAttributes = [...attributes];
    if (!updatedAttributes[index].values.includes(value.trim())) {
      updatedAttributes[index].values.push(value.trim());
      setAttributes(updatedAttributes);
    }
  };

  const removeAttributeValue = (attrIndex, valueIndex) => {
    const updatedAttributes = [...attributes];
    updatedAttributes[attrIndex].values.splice(valueIndex, 1);
    setAttributes(updatedAttributes);
  };

  // Variation functions
  const updateVariation = (variationId, field, value) => {
    const updatedVariations = variations.map(variation => 
      variation.id === variationId 
        ? { ...variation, [field]: value }
        : variation
    );
    setVariations(updatedVariations);
  };

  const toggleVariation = (variationId) => {
    const updatedVariations = variations.map(variation => 
      variation.id === variationId 
        ? { ...variation, enabled: !variation.enabled }
        : variation
    );
    setVariations(updatedVariations);
  };

  const deleteVariation = (variationId) => {
    const updatedVariations = variations.filter(v => v.id !== variationId);
    setVariations(updatedVariations);
  };

  const bulkUpdateVariations = (field, value) => {
    const updatedVariations = variations.map(variation => ({
      ...variation,
      [field]: value
    }));
    setVariations(updatedVariations);
  };

  // Image functions
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Show uploading state
    setError(null);
    const uploadingMessage = `Uploading ${files.length} image(s) to GitHub...`;
    console.log(uploadingMessage);

    let successCount = 0;
    let failureCount = 0;

    // If editing and replacing images, delete old images first
    if (isEditing && sku && images.length > 0) {
      console.log(`🗑️  Cleaning up old images for SKU: ${sku}`);
      try {
        const deleteResult = await githubUploadService.deleteImagesBySKU(sku);
        if (deleteResult.success) {
          console.log(`✅ Deleted ${deleteResult.deletedCount} old image(s)`);
          // Clear the images array since we're replacing them
          setImages([]);
        }
      } catch (error) {
        console.warn(`⚠️  Error deleting old images: ${error.message}`);
      }
    }

    for (const file of files) {
      try {
        console.log(`📤 Uploading: ${file.name}${sku ? ` (SKU: ${sku})` : ''}`);
        
        // Upload to GitHub with SKU
        const uploadResult = await githubUploadService.uploadImage(file, editingProductId || null, sku);

        if (uploadResult.success) {
          // Add image with GitHub URL
          const newImage = {
            id: `img-${Date.now()}-${Math.random()}`,
            url: uploadResult.url, // GitHub public URL
            name: uploadResult.fileName,
            file: null, // No need to store file since we have URL
            path: uploadResult.path,
            githubUrl: uploadResult.url
          };
          
          setImages(prev => [...prev, newImage]);
          console.log(`✅ Added: ${file.name}`);
          successCount++;
        } else {
          console.error(`❌ Failed to upload ${file.name}: ${uploadResult.error}`);
          failureCount++;
          setError(`Failed to upload ${file.name}: ${uploadResult.error}`);
        }
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        failureCount++;
        setError(`Error uploading ${file.name}: ${error.message}`);
      }

      // Small delay between uploads
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Show summary
    if (successCount > 0) {
      console.log(`\n✅ Successfully uploaded ${successCount} image(s)`);
      setSuccess(`Successfully uploaded ${successCount} image(s)`);
    }
    if (failureCount > 0) {
      console.error(`❌ Failed to upload ${failureCount} image(s)`);
    }
  };

  const removeImage = (imageId) => {
    setImages(images.filter(img => img.id !== imageId));
  };

  const setFeaturedImage = (imageId) => {
    const reorderedImages = [
      images.find(img => img.id === imageId),
      ...images.filter(img => img.id !== imageId)
    ].filter(Boolean);
    setImages(reorderedImages);
  };

  // Category functions
  const toggleCategory = (category) => {
    if (categories.includes(category)) {
      setCategories(categories.filter(cat => cat !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  // Tag functions
  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Tab content components
  const GeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Product type</label>
          <select 
            value={productType}
            onChange={e => setProductType(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="simple">Simple product</option>
            <option value="variable">Variable product</option>
            <option value="grouped">Grouped product</option>
            <option value="external">External/Affiliate product</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="sku" className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <span>SKU</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full" style={{ backgroundColor: '#E6F4F2', border: '1px solid #BFDAD7' }}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#005660' }}>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
          </label>
          <div className="relative">
            <input
              id="sku"
              type="text"
              readOnly
              value={sku}
              className="w-full bg-gray-50 rounded px-4 py-2 text-sm font-mono text-gray-700 cursor-not-allowed transition-colors"
              style={{ border: '2px solid #005660' }}
              title="SKU is automatically generated"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2" style={{ color: '#005660' }}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <p className="text-xs font-medium" style={{ color: '#005660' }}>Auto-generated</p>
        </div>
      </div>

      {/* <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Downloadable</label>
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="downloadable" 
            className="h-4 w-4 border-gray-300 rounded accent-[#005660]" 
            checked={downloadable} 
            onChange={e => setDownloadable(e.target.checked)} 
          inputMode="numeric"
          pattern="[0-9]*"
          onKeyDown={(e) => focusNextOnEnter(e, 'length')}
          onFocus={(e) => e.target.select()}
          />
          <label htmlFor="downloadable" className="text-sm ml-2 text-gray-700">Downloadable product</label>
        </div>
      </div> */}
    </div>
  );

  const InventoryTab = useMemo(() => () => (
    <div className="space-y-6">
      {/* SKU field moved to General tab for better UX */}
      
      {/* <div className="space-y-2">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="manage-stock" 
            className="h-4 w-4 border-gray-300 rounded accent-[#005660]" 
            checked={manageStock} 
            onChange={e => setManageStock(e.target.checked)} 
          />
          <label htmlFor="manage-stock" className="text-sm ml-2 text-gray-700">Manage stock?</label>
        </div>
      </div> */}

      {manageStock ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="stock-quantity" className="text-sm font-medium text-gray-700">Stock quantity</label>
              <input
                id="stock-quantity"
                type="number"
                placeholder="0"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="backorders" className="text-sm font-medium text-gray-700">Allow backorders?</label>
              <select
                id="backorders"
                value={backorders}
                onChange={e => setBackorders(e.target.value)}
                onKeyDown={(e) => focusNextOnEnter(e, 'low-stock')}
                className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
              >
                <option value="no">Do not allow</option>
                <option value="notify">Allow, but notify customer</option>
                <option value="yes">Allow</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="low-stock" className="text-sm font-medium text-gray-700">Low stock threshold</label>
            <input
              id="low-stock"
              type="number"
              placeholder="2"
              value={lowStockThreshold}
              onChange={e => setLowStockThreshold(e.target.value)}
              className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <label htmlFor="stock-status" className="text-sm font-medium text-gray-700">Stock status</label>
          <select
            id="stock-status"
            value={stockStatus}
            onChange={e => setStockStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="instock">In stock</option>
            <option value="outofstock">Out of stock</option>
            <option value="onbackorder">On backorder</option>
          </select>
          
          {stockStatus === 'instock' && (
        <div className="space-y-2 mt-3">
          <label
            htmlFor="stock-quantity-value"
            className="text-sm font-medium text-gray-700"
          >
            Number of units in stock
          </label>
          <input
            type="text"
            id="stock-quantity-value"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="0"
            inputMode="numeric"
            autoComplete="off"
            className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
          )}
        </div>
      )}

      {/* <div className="space-y-2">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="sold-individually" 
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
            checked={soldIndividually} 
            onChange={e => setSoldIndividually(e.target.checked)} 
          />
          <label htmlFor="sold-individually" className="text-sm ml-2 text-gray-700">Sold individually</label>
        </div>
        <p className="text-xs text-gray-500">Limit this product to be purchased only once in an order</p>
      </div> */}
    </div>
  ), [manageStock, stockQuantity, backorders, lowStockThreshold, stockStatus]);

  const ShippingTab = useMemo(() => () => {
    const focusNextOnEnter = (e, nextId) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const next = document.getElementById(nextId);
        if (next) next.focus();
      }
    };

    return (
      <div className="space-y-6">
        {/* Weight */}
        <div className="space-y-2">
          <label
            htmlFor="weight"
            className="text-sm font-medium text-gray-700"
          >
            Weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            step="0.01"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>

        {/* Dimensions */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Dimensions (cm)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {["length", "width", "height"].map((dim, index) => (
              <div key={dim} className="space-y-1">
                <label className="text-xs text-gray-500 capitalize">
                  {dim}
                </label>
                <input
                  id={dim}
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={dimensions[dim]}
                  onChange={(e) =>
                    setDimensions({
                      ...dimensions,
                      [dim]: e.target.value,
                    })
                  }
                  inputMode="numeric"
                  autoComplete="off"
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Class */}
        <div className="space-y-2">
          <label
            htmlFor="shipping-class"
            className="text-sm font-medium text-gray-700"
          >
            Shipping class
          </label>
          <select
            id="shipping-class"
            value={shippingClass}
            onChange={(e) => setShippingClass(e.target.value)}
            className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
          >
            <option value="">No shipping class</option>
            <option value="standard">Standard</option>
            <option value="oversized">Oversized</option>
            <option value="fragile">Fragile</option>
          </select>
          <p className="text-xs text-gray-500">
            Shipping classes are used by certain shipping methods to group
            similar products.
          </p>
        </div>
      </div>
    );
  }, [weight, dimensions, shippingClass]);

  const AttributesTab = useMemo(() => () => (
    <div className="space-y-4">
      {productType === 'simple' ? (
        <div className="rounded-lg p-4 text-center border border-gray-200 bg-gray-50">
          <div className="text-sm font-medium" style={{ color: '#003b3b' }}>Not Applicable</div>
          <div className="text-sm mt-1 text-gray-600">Product type is Simple Product. Attributes are only available for Variable Products.</div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-700">Product attributes</h3>
            <button
              type="button"
              onClick={addAttribute}
              className="flex items-center gap-1 px-3 py-1 rounded text-sm transition border"
              style={{ borderColor: '#005660', color: '#005660', backgroundColor: '#ffffff' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#f3faf9'; e.target.style.borderColor = '#00444d'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#ffffff'; e.target.style.borderColor = '#005660'; }}
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

      {attributes.map((attribute, index) => (
        <div key={attribute.id} className="border border-gray-200 rounded p-4 bg-white">
          <div className="flex items-start justify-between mb-3">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  placeholder="Attribute name (e.g., Color, Size)"
                  value={attribute.name}
                  onChange={e => updateAttribute(index, 'name', e.target.value)}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full text-sm"
                />
              </div>
              <div className="flex items-center gap-4 pt-6">
                <label className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={attribute.visible}
                    onChange={e => updateAttribute(index, 'visible', e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#005660' }}
                  />
                  <Eye className="w-4 h-4" />
                  Visible
                </label>
                <label className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={attribute.variation}
                    onChange={e => updateAttribute(index, 'variation', e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#005660' }}
                  />
                  <Package className="w-4 h-4" />
                  Used for variations
                </label>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeAttribute(index)}
              className="ml-3 p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Values</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attribute.values.map((value, valueIndex) => (
                <span key={valueIndex} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                  {value}
                  <button
                    type="button"
                    onClick={() => removeAttributeValue(index, valueIndex)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {attribute.values.length === 0 && (
                <span className="text-gray-400 text-sm">No values added</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add value"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addAttributeValue(index, e.target.value);
                    e.target.value = '';
                  }
                }}
                className="bg-white border border-gray-300 rounded px-3 py-2 flex-1 text-sm"
              />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  addAttributeValue(index, input.value);
                  input.value = '';
                }}
                className="px-3 py-2 bg-gray-100 border border-gray-300 rounded text-sm"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {attributes.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No attributes added yet.</p>
          <p className="text-sm">Add attributes to use them for variations.</p>
        </div>
      )}
        </>
      )}
    </div>
  ), [productType, attributes, addAttribute, updateAttribute, removeAttribute, addAttributeValue, removeAttributeValue]);

  const VariationsTab = useMemo(() => () => (
    <div className="space-y-4">
      {productType === 'simple' ? (
        <div className="rounded-lg p-4 text-center border border-gray-200 bg-gray-50">
          <div className="text-sm font-medium text-gray-800">Not Applicable</div>
          <div className="text-sm mt-1 text-gray-600">Product type is Simple Product. Variations are only available for Variable Products.</div>
        </div>
      ) : productType !== 'variable' ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Variations are available for variable products only.</p>
          <p className="text-sm">Change product type to "Variable product" to manage variations.</p>
        </div>
      ) : isGeneratingVariations ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Generating variations...</p>
        </div>
      ) : variations.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded">
          <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No variations found.</p>
          <p className="text-sm">Add attributes with "Used for variations" enabled to generate variations.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
            <h3 className="text-sm font-medium text-gray-700">
              Variations ({variations.filter(v => v.enabled).length} of {variations.length})
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => bulkUpdateVariations('regularPrice', regularPrice)}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
              >
                Set regular prices
              </button>
              <button
                type="button"
                onClick={() => bulkUpdateVariations('salePrice', salePrice)}
                className="px-3 py-1 border border-gray-300 rounded text-sm bg-white"
              >
                Set sale prices
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded bg-white">
            {variations.map((variation, index) => (
              <div key={variation.id} className={`border-b border-gray-200 last:border-b-0 ${!variation.enabled ? 'bg-gray-50 opacity-60' : ''}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={variation.enabled}
                        onChange={() => toggleVariation(variation.id)}
                        className="h-4 w-4 border-gray-300 rounded accent-[#005660]"
                      />
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">
                          {variation.attributes.map(attr => attr.value).join(' - ') || 'Variation #' + (index + 1)}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {variation.attributes.map(attr => `${attr.name}: ${attr.value}`).join(', ')}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteVariation(variation.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {variation.enabled && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Regular price ($)</label>
                        <input
                          type="number"
                          step="1"
                          placeholder="0.00"
                          value={variation.regularPrice}
                          onChange={e => updateVariation(variation.id, 'regularPrice', e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Sale price ($)</label>
                        <input
                          type="number"
                          step="1"
                          placeholder="0.00"
                          value={variation.salePrice}
                          onChange={e => updateVariation(variation.id, 'salePrice', e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">SKU</label>
                        <input
                          type="text"
                          placeholder="Variation SKU"
                          value={variation.sku}
                          onChange={e => updateVariation(variation.id, 'sku', e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-gray-700">Stock</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={variation.stockQuantity}
                          onChange={e => updateVariation(variation.id, 'stockQuantity', e.target.value)}
                          className="bg-white border border-gray-300 rounded px-2 py-1 w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  ), [productType, variations, isGeneratingVariations, regularPrice, salePrice, weight, stockQuantity, manageStock, updateVariation, toggleVariation, deleteVariation, bulkUpdateVariations]);

  const AdvancedTab = useMemo(() => () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="purchase-note" className="text-sm font-medium text-gray-700">Purchase note</label>
        <textarea
          id="purchase-note"
          placeholder="Enter an optional note sent to the customer after purchase."
          className="bg-white border border-gray-300 rounded px-3 py-2 w-full h-20"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Menu order</label>
        <input
          type="number"
          placeholder="0"
          className="bg-white border border-gray-300 rounded px-3 py-2 w-full"
        />
        <p className="text-xs text-gray-500">Custom ordering position</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="enable-reviews"
            defaultChecked
            className="h-4 w-4 border-gray-300 rounded accent-[#005660]" 
          />
          <label htmlFor="enable-reviews" className="text-sm ml-2 text-gray-700">Enable reviews</label>
        </div>
      </div>
    </div>
  ), []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Preview Modal */}
      <ProductPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        productData={{
          title,
          description,
          shortDescription,
          regularPrice,
          salePrice,
          productType,
          sku,
          status,
          taxStatus,
          taxClass,
          manageStock,
          stockQuantity,
          stockStatus,
          backorders,
          soldIndividually,
          weight,
          dimensions,
          shippingClass,
          categories,
          tags,
          featured,
          virtual,
          downloadable,
          attributes,
          variations,
          images
        }}
      />

      {/* WordPress-style Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-2 px-3 py-2 rounded text-gray-600 hover:text-gray-900"
              onClick={() => navigate(`/products?platform=${platform}`)}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
            
            {/* Platform Selector */}
            <div className="flex items-center gap-2 ml-6 border-l border-gray-200 pl-6">
              <label className="text-sm font-medium text-gray-700">Platform:</label>
              <select 
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#005660]"
              >
                <option value="woocommerce">WooCommerce</option>
                <option value="shopify">Shopify</option>
              </select>
            </div>
            
            {/* Connection Status Indicator */}
            <div className="flex items-center gap-2 ml-4">
              <div className={`w-2 h-2 rounded-full ${
                (platform === 'shopify' ? shopifyStatus : wooCommerceStatus) === 'connected' ? '' : 
                (platform === 'shopify' ? shopifyStatus : wooCommerceStatus) === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              }`} style={(platform === 'shopify' ? shopifyStatus : wooCommerceStatus) === 'connected' ? { backgroundColor: '#005660', boxShadow: '0 0 0 3px rgba(0,86,96,0.08)' } : {}}></div>
              <span className="text-sm text-gray-600">
                {platform === 'shopify' ? 'Shopify' : 'WooCommerce'}: {
                  (platform === 'shopify' ? shopifyStatus : wooCommerceStatus) === 'connected' ? 'Connected' : 
                  (platform === 'shopify' ? shopifyStatus : wooCommerceStatus) === 'disconnected' ? 'Disconnected' : 'Checking...'
                }
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              type="button" 
              className="px-4 py-2 rounded border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            {isEditing && (
              <button 
                type="button" 
                className={`px-4 py-2 rounded text-white font-medium flex items-center gap-2 ${
                  isLoading 
                    ? 'bg-red-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={handleDelete}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Product
                  </>
                )}
              </button>
            )}
            <button 
              type="button" 
              className={`px-4 py-2 rounded text-white font-medium flex items-center gap-2 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : ''
              }`}
              style={{
                backgroundColor: isLoading ? undefined : '#005660'
              }}
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  {isEditing ? (status === 'draft' ? 'Update Draft' : 'Update Product') : 'Save to WooCommerce'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 py-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto pl-3"
              >
                <X className="h-4 w-4 text-red-400 hover:text-red-600" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(0,86,96,0.04)', border: '1px solid rgba(0,86,96,0.12)' }}>
            <div className="flex">
              <div className="flex-shrink-0">
                <Package className="h-5 w-5" style={{ color: '#005660' }} />
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: '#004f50' }}>{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Main Content - WordPress Style */}
          <div className="flex-1 space-y-6">
            {/* Product Title */}
            <div className="bg-white border border-gray-300 rounded-lg p-2">
              <input
                placeholder="Product name"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onFocus={(e) => e.target.select()}
                className="w-full text-lg font-normal border-0 p-0 placeholder-gray-400 focus:outline-none focus:ring-0"
                style={{ boxShadow: 'none', outline: 'none' }}
                required
              />
            </div>

            {/* Product Description */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Product Description</h2>
              </div>
              <div className="p-6">
                <div className="border border-gray-300 rounded-lg bg-white">
                    <textarea 
                    className="min-h-48 border-none bg-transparent resize-none focus:ring-0 w-full p-4"
                    placeholder="Product description..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
            {/* Short Product Description */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Short Product Description</h2>
              </div>
              <div className="p-6">
                <div className="border border-gray-300 rounded-lg bg-white">
                  <textarea 
                    className="min-h-20 border-none bg-transparent resize-none focus:ring-0 w-full p-4"
                    placeholder="Short Product description..."
                    value={shortDescription}
                    onChange={e => setShortDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>


            {/* Pricing Section */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label htmlFor="regular-price" className="text-sm font-medium text-gray-700">Regular price ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="regular-price"
                        type="number"
                        step="1"
                        placeholder="0.00"
                        value={regularPrice}
                        onChange={e => setRegularPrice(e.target.value)}
                        className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sale-price" className="text-sm font-medium text-gray-700">Sale price ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="sale-price"
                        type="number"
                        step="1"
                        placeholder="0.00"
                        value={salePrice}
                        onChange={e => setSalePrice(e.target.value)}
                        className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* <div className="grid grid-cols-3 gap-4 border-t pt-6">
                  <div className="space-y-2">
                    <label htmlFor="cost" className="text-sm font-medium text-gray-700">Cost per item ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="cost"
                        type="number"
                        step="1"
                        placeholder="0.00"
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                        className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Profit</label>
                    <div className="h-10 bg-gray-50 border border-gray-300 rounded flex items-center px-3 text-gray-900">
                      {parsedRegularPrice && parsedCost ? `$${profit.toFixed(2)}` : '---'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Margin</label>
                    <div className="h-10 bg-gray-50 border border-gray-300 rounded flex items-center px-3 text-gray-900">
                      {parsedRegularPrice && parsedCost ? `${margin}%` : '---'}
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* Product Data - WordPress Metabox Style */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300">
                <div className="flex border-b border-gray-300">
                  {[
                    { id: 'general', label: 'General', icon: Settings },
                    { id: 'inventory', label: 'Inventory', icon: Package },
                    { id: 'shipping', label: 'Shipping', icon: Truck },
                    { id: 'attributes', label: 'Attributes', icon: Tag },
                    { id: 'variations', label: 'Variations', icon: BarChart3 },
                    { id: 'advanced', label: 'Advanced', icon: Settings }
                  ].map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 ${
                          activeTab === tab.id
                            ? 'text-[#005660] bg-white'
                            : 'border-transparent text-gray-600 hover:text-gray-800 bg-gray-50'
                        }`}
                        style={activeTab === tab.id ? { borderColor: '#005660', backgroundColor: '#f9fafb' } : {}}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <IconComponent className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'general' && <GeneralTab />}
                {activeTab === 'inventory' && <InventoryTab />}
                {activeTab === 'shipping' && <ShippingTab />}
                {activeTab === 'attributes' && <AttributesTab />}
                {activeTab === 'variations' && <VariationsTab />}
                {activeTab === 'advanced' && <AdvancedTab />}
              </div>
            </div>

            {/* Pricing Section */}
            {/* <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-6 py-4">
                <h2 className="text-lg font-medium text-gray-900">Pricing</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label htmlFor="regular-price" className="text-sm font-medium text-gray-700">Regular price ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="regular-price"
                        type="number"
                        step="1"
                        placeholder="0.00"
                        value={regularPrice}
                        onChange={e => setRegularPrice(e.target.value)}
                        className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="sale-price" className="text-sm font-medium text-gray-700">Sale price ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="sale-price"
                        type="number"
                        step="1"
                        placeholder="0.00"
                        value={salePrice}
                        onChange={e => setSalePrice(e.target.value)}
                        className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 border-t pt-6">
                  <div className="space-y-2">
                    <label htmlFor="cost" className="text-sm font-medium text-gray-700">Cost per item ($)</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        id="cost"
                        type="number"
                        step="1"
                        placeholder="0.00"
                        value={cost}
                        onChange={e => setCost(e.target.value)}
                        className="bg-white border border-gray-300 rounded pl-10 pr-3 py-2 w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Profit</label>
                    <div className="h-10 bg-gray-50 border border-gray-300 rounded flex items-center px-3 text-gray-900">
                      {parsedRegularPrice && parsedCost ? `$${profit.toFixed(2)}` : '---'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Margin</label>
                    <div className="h-10 bg-gray-50 border border-gray-300 rounded flex items-center px-3 text-gray-900">
                      {parsedRegularPrice && parsedCost ? `${margin}%` : '---'}
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>

          {/* Sidebar - WordPress Style */}
          <div className="w-80 space-y-6">
            {/* Publish Metabox */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Publish</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Status:</span>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)} 
                    className="border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="publish">Published</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  {isEditing && (
                    <button 
                      type="button" 
                      className={`flex-1 px-3 py-2 border rounded text-sm font-medium flex items-center justify-center gap-2 ${
                        isLoading 
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' 
                          : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                      onClick={handleDelete}
                      disabled={isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      Move to trash
                    </button>
                  )}
                  <button 
                    type="button" 
                    className={`${isEditing ? 'flex-1' : 'w-full'} px-3 py-2 rounded text-sm font-medium flex items-center justify-center gap-2 ${
                      isLoading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'text-white hover:opacity-90'
                    }`}
                    style={{
                      backgroundColor: isLoading ? undefined : '#005660'
                    }}
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Package className="w-4 h-4" />
                    {isEditing ? (status === 'draft' ? 'Save Draft' : 'Update') : 'Publish Product'}
                  </button>
                </div>
              </div>
            </div>

            {/* Product Categories */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Product categories
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {loadingCategories ? (
                  <div className="text-center py-4 text-gray-500">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#005660' }}></div>
                    <p className="text-sm mt-2">Loading categories...</p>
                  </div>
                ) : availableCategories.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No categories available</p>
                  </div>
                ) : (
                  <>
                    {categories.length === 0 && (
                      <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 p-2 rounded mb-2">
                        No categories selected - will default to "Uncategorized"
                      </div>
                    )}
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableCategories.map((category) => (
                        <div key={category} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            id={`cat-${category}`} 
                            className="h-4 w-4 border-gray-300 rounded accent-[#005660]" 
                            checked={categories.includes(category)}
                            onChange={() => toggleCategory(category)}
                          />
                          <label htmlFor={`cat-${category}`} className="text-sm text-gray-700">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button 
                  type="button" 
                  className="text-sm font-medium mt-3 flex items-center gap-1 hover:opacity-80 transition" 
                  style={{ color: '#005660' }}
                  onClick={() => {
                    // Send users to the category management page
                    const returnTo = encodeURIComponent(location.pathname + location.search);
                    const extra = editingProductId ? `&productId=${editingProductId}` : '';
                    navigate(`/category?returnTo=${returnTo}${extra}`);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add new category
                </button>
              </div>
            </div>

            {/* Product Tags */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Product tags
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {/* Display existing tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full" style={{ color: '#005660', border: '1px solid rgba(0,86,96,0.12)', backgroundColor: 'rgba(0,86,96,0.04)' }}>
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:opacity-70 ml-1"
                        >
                          <X className="w-3 h-3" style={{ color: '#004f50' }} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Input for new tags */}
                <input 
                  type="text" 
                  placeholder="Type and press Enter to add tags..." 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  className="bg-white border border-gray-300 rounded px-3 py-2 w-full text-sm"
                  style={{
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#005660';
                    e.target.style.boxShadow = '0 0 0 3px rgba(0, 86, 96, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <p className="text-xs text-gray-500">Press Enter to add a tag</p>
              </div>
            </div>

            {/* Product Image */}
            <div className="bg-white border border-gray-300 rounded-lg">
              <div className="border-b border-gray-300 px-4 py-3 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
              </div>
              <div className="p-4 space-y-6">
                
                {/* Featured/Main Image Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(0,86,96,0.12)' }}></div>
                    Featured Picture
                  </h4>
                  {images.length > 0 ? (
                    <div className="space-y-3">
                      {/* Show featured image */}
                      {images.length > 0 && (
                        <div className="relative group">
                          <img 
                            src={images[0].url} 
                            alt={images[0].name}
                            className="w-full h-48 object-cover rounded border border-gray-300"
                          />
                          <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(0,86,96,0.12)', color: '#003b3b' }}>
                            Main Product Image
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 rounded">
                            <button
                              type="button"
                              onClick={() => removeImage(images[0].id)}
                              className="p-2 bg-white rounded-full text-red-600"
                              title="Remove featured image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => document.getElementById('image-upload').click()}
                        className="w-full border-2 border-dashed border-gray-300 rounded p-3 text-center transition-colors hover:border-blue-500"
                        onMouseEnter={(e) => e.target.style.borderColor = '#005660'}
                        onMouseLeave={(e) => e.target.style.borderColor = '#d1d5db'}
                      >
                        <span className="text-sm text-gray-600">Change featured image</span>
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded p-8 text-center hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('image-upload').click()}
                    >
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload featured image</p>
                      <p className="text-xs text-gray-500 mt-1">Click to upload</p>
                    </div>
                  )}
                </div>

                {/* Other Images Section */}
                {images.length > 1 && (
                  <div className="border-t border-gray-300 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(200,200,200,0.3)' }}></div>
                      Other Pictures ({images.length - 1})
                    </h4>
                    <div className="grid grid-cols-4 gap-2">
                      {images.slice(1).map((image, index) => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.url} 
                            alt={image.name}
                            className="w-full h-24 object-cover rounded border border-gray-300"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 rounded">
                            <button
                              type="button"
                              onClick={() => {
                                // Move to featured
                                const newImages = [image, ...images.filter(img => img.id !== image.id)];
                                setImages(newImages);
                              }}
                              className="p-1 bg-white rounded text-gray-700 hover:opacity-80"
                              style={{ color: '#005660' }}
                              title="Make featured"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="p-1 bg-white rounded text-red-600 hover:opacity-80"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add More Images Button */}
                <button
                  type="button"
                  onClick={() => document.getElementById('image-upload').click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded p-4 text-center transition-colors hover:border-opacity-80"
                  onMouseEnter={(e) => e.target.style.borderColor = '#005660'}
                  onMouseLeave={(e) => e.target.style.borderColor = '#e5e7eb'}
                >
                  <Plus className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                  <span className="text-sm text-gray-600">Add more images</span>
                </button>

                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
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