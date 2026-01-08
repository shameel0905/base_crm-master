import { useState, useEffect } from "react";
import { 
  Plus, 
  Search,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from "lucide-react";
import woocommerceService from '../services/woocommerceService';
import shopifyService from '../services/shopifyService';
import githubUploadService from '../services/githubUploadService';

export function CategoriesPage({ platform = 'woocommerce' }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [bulkAction, setBulkAction] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    parent: "0",
    description: "",
    image: null,
    categoryId: null // For tracking unique category ID
  });
  const [previousImage, setPreviousImage] = useState(null); // Track previous image for updates

  // Check connection and load categories
  useEffect(() => {
    checkConnection();
  }, [platform]);

  const checkConnection = async () => {
    try {
      setConnectionStatus('checking');
      if (platform === 'shopify') {
        await shopifyService.testConnection();
      } else {
        await woocommerceService.testConnection();
      }
      setConnectionStatus('connected');
      await fetchCategories();
    } catch (error) {
      console.error(`${platform} connection failed:`, error);
      setConnectionStatus('disconnected');
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (platform === 'shopify') {
        // Fetch Shopify collections
        const response = await shopifyService.getCollections();
        if (response.success) {
          console.log('✅ Shopify Collections fetched:', response.data);
          setCategories(response.data || []);
        } else {
          throw new Error(response.error || 'Failed to fetch Shopify collections');
        }
      } else {
        // Fetch WooCommerce categories
        const response = await woocommerceService.getAllCategories({
          per_page: 100, // Get all categories
          orderby: 'id',
          order: 'desc' // Latest categories first
        });
        
        if (response.success) {
          console.log('✅ Categories fetched:', response.categories);
          console.log('📸 Category images sample:', response.categories.slice(0, 3).map(c => ({
            name: c.name,
            hasImage: !!c.image,
            imageType: typeof c.image,
            imageSrc: c.image && typeof c.image === 'string' ? c.image : (c.image?.src || 'no src'),
            rawImage: c.image
          })));
          setCategories(response.categories);
        } else {
          throw new Error(response.error || 'Failed to fetch categories');
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(category => {
    const name = (category.name || category.title || '').toString();
    const description = (category.description || category.body_html || '').toString();
    const slug = (category.slug || category.handle || '').toString();
    const q = (searchTerm || '').toLowerCase();
    if (!q) return true;
    return (
      name.toLowerCase().includes(q) ||
      description.toLowerCase().includes(q) ||
      slug.toLowerCase().includes(q)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + itemsPerPage);

  // Handle image upload to GitHub
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Generate unique category ID if not already set
      const categoryId = formData.categoryId || `cat-${Date.now()}`;
      
      console.log(`📤 Uploading category image: ${file.name} (Category ID: ${categoryId})`);
      
      // If editing and replacing image, delete old one first
      if (editingCategory?.image && editingCategory.image !== formData.image) {
        console.log(`🗑️  Deleting old image before uploading new one`);
        await deleteImageFromGitHub(editingCategory.id);
      }

      // Upload to GitHub with category-specific folder
      const uploadResult = await githubUploadService.uploadImage(
        file,
        null, // productId not used for categories
        `category-${categoryId}` // Use category ID as identifier instead of SKU
      );

      if (uploadResult.success) {
        console.log(`✅ Image uploaded successfully: ${uploadResult.url}`);
        
        // Add cache-busting parameter to force browser to reload new image
        const cacheBustUrl = `${uploadResult.url}?t=${Date.now()}`;
        
        setFormData(prev => ({ 
          ...prev, 
          image: uploadResult.url,  // Store original URL for WooCommerce
          categoryId: categoryId
        }));
        setImagePreview(cacheBustUrl);  // Display with cache-buster
        setPreviousImage(null);  // Clear previous image tracker
        
        console.log(`🎨 Image preview updated with cache-buster`);
      } else {
        throw new Error(uploadResult.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading category image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Delete category image from GitHub
  const deleteImageFromGitHub = async (categoryId) => {
    try {
      console.log(`🗑️  Deleting category images with ID: ${categoryId}`);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/upload/github/delete-by-category`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ categoryId: `category-${categoryId}` })
        }
      );

      const data = await response.json();

      if (data.success) {
        console.log(`✅ Category images deleted: ${data.deletedCount}`);
        return { success: true, deletedCount: data.deletedCount };
      } else {
        console.error('❌ Delete failed:', data.error);
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Delete error:', error);
      return { success: false, error: error.message };
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    // If there was a previous image during edit, mark it for deletion
    if (editingCategory?.image) {
      setPreviousImage(editingCategory.image);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(paginatedCategories.map(cat => cat.id));
    } else {
      setSelectedCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBulkAction = async () => {
    if (bulkAction === "delete" && selectedCategories.length > 0) {
      if (window.confirm(`Are you sure you want to delete ${selectedCategories.length} categories? This action cannot be undone. Associated images will also be deleted.`)) {
        try {
          setSaving(true);
          
          // Delete categories one by one with their images
          for (const categoryId of selectedCategories) {
            const category = categories.find(c => c.id === categoryId);
            
            // Delete images from GitHub
            if (category?.image) {
              console.log(`🗑️  Deleting images for category: ${getDisplayName(category)}`);
              await deleteImageFromGitHub(categoryId);
            }
            
            // Delete category from WooCommerce
            await woocommerceService.deleteCategory(categoryId);
          }
          
          // Refresh categories list
          await fetchCategories();
          setSelectedCategories([]);
          alert('Categories and their images deleted successfully!');
        } catch (error) {
          console.error('Error deleting categories:', error);
          alert('Error deleting categories: ' + error.message);
        } finally {
          setSaving(false);
        }
      }
    }
    setBulkAction("");
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (platform === 'shopify') {
        // Create Shopify collection
        const collectionData = {
          title: formData.name,
          body_html: formData.description || '',
          handle: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          parent: formData.parent ? parseInt(formData.parent) : 0,
          image: formData.image ? { src: formData.image } : undefined
        };

        console.log('📝 Creating Shopify collection with data:', collectionData);

        const response = await shopifyService.createCollection(collectionData);
        
        if (response.success) {
          console.log(`✅ Shopify collection created with ID: ${response.data.id}`);
          await fetchCategories(); // Refresh the list
          setIsAddModalOpen(false);
          resetForm();
          alert('Collection created successfully!');
        } else {
          throw new Error(response.error || 'Failed to create collection');
        }
      } else {
        // Create WooCommerce category
        const categoryData = {
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          parent: parseInt(formData.parent),
          image: formData.image // GitHub URL
        };

        console.log('📝 Creating category with data:', categoryData);

        const response = await woocommerceService.createCategory(categoryData);
        
        if (response.success) {
          console.log(`✅ Category created with ID: ${response.category.id}`);
          await fetchCategories(); // Refresh the list
          setIsAddModalOpen(false);
          resetForm();
          alert('Category created successfully!');
        } else {
          throw new Error(response.error || 'Failed to create category');
        }
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error creating category: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      if (platform === 'shopify') {
        // Update Shopify collection
        const collectionData = {
          title: formData.name,
          body_html: formData.description || '',
          handle: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          parent: formData.parent ? parseInt(formData.parent) : 0,
          image: formData.image ? { src: formData.image } : undefined
        };

        console.log('✏️  Updating Shopify collection with data:', collectionData);

        const response = await shopifyService.updateCollection(editingCategory.id, collectionData);
        
        if (response.success) {
          console.log(`✅ Shopify collection updated successfully`);
          await fetchCategories(); // Refresh the list
          setIsEditModalOpen(false);
          resetForm();
          alert('Collection updated successfully!');
        } else {
          throw new Error(response.error || 'Failed to update collection');
        }
      } else {
        // If image was replaced, delete the old one
        if (previousImage && formData.image !== previousImage) {
          console.log(`🗑️  Replacing image - deleting old image from GitHub`);
          await deleteImageFromGitHub(editingCategory.id);
        } else if (!formData.image && editingCategory?.image) {
          // If image was removed, delete it
          console.log(`🗑️  Image removed - deleting from GitHub`);
          await deleteImageFromGitHub(editingCategory.id);
        }
        
        const categoryData = {
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          parent: parseInt(formData.parent),
          image: formData.image // GitHub URL or null
        };

        console.log('✏️  Updating WooCommerce category with data:', categoryData);

        const response = await woocommerceService.updateCategory(editingCategory.id, categoryData);
        
        if (response.success) {
          console.log(`✅ WooCommerce category updated successfully`);
          await fetchCategories(); // Refresh the list
          setIsEditModalOpen(false);
          resetForm();
          setPreviousImage(null);
          alert('Category updated successfully!');
        } else {
          throw new Error(response.error || 'Failed to update category');
        }
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error updating category: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(`Are you sure you want to delete this ${platform === 'shopify' ? 'collection' : 'category'}? This action cannot be undone.`)) {
      try {
        setSaving(true);
        
        const category = categories.find(c => c.id === categoryId);
        
        if (platform === 'shopify') {
          // Delete Shopify collection
          const response = await shopifyService.deleteCollection(categoryId);
          
          if (response.success) {
            console.log(`✅ Shopify collection deleted successfully`);
            await fetchCategories(); // Refresh the list
            alert('Collection deleted successfully!');
          } else {
            throw new Error(response.error || 'Failed to delete collection');
          }
        } else {
          // Delete images from GitHub if they exist
          if (category?.image) {
            console.log(`🗑️  Deleting images for category: ${getDisplayName(category)}`);
            await deleteImageFromGitHub(categoryId);
          }
          
          // Delete category from WooCommerce
          const response = await woocommerceService.deleteCategory(categoryId);
          
          if (response.success) {
            console.log(`✅ Category and images deleted successfully`);
            await fetchCategories(); // Refresh the list
            alert('Category and its images deleted successfully!');
          } else {
            throw new Error(response.error || 'Failed to delete category');
          }
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category: ' + error.message);
      } finally {
        setSaving(false);
      }
    }
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    const imageUrl = category.image && typeof category.image === 'string' ? category.image : (category.image?.src || null);
    setFormData({
      name: category.name || category.title || '',
      slug: category.slug || category.handle || '',
      parent: (category.parent !== undefined && category.parent !== null) ? String(category.parent) : '0',
      description: category.description || category.body_html || '',
      image: imageUrl,
      categoryId: category.id // Store the category ID for image management
    });
    setImagePreview(imageUrl);
    setPreviousImage(imageUrl); // Track the original image
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      parent: "0",
      description: "",
      image: null,
      categoryId: null
    });
    setImagePreview(null);
    setEditingCategory(null);
    setPreviousImage(null);
  };

  const generateSlug = (name) => {
    setFormData(prev => ({
      ...prev,
      slug: name.toLowerCase().replace(/\s+/g, '-')
    }));
  };

  const getDisplayName = (cat) => (cat?.name || cat?.title || '').toString();
  const getDescription = (cat) => (cat?.description || cat?.body_html || '').toString();
  const getSlug = (cat) => (cat?.slug || cat?.handle || '').toString();
  const getCount = (cat) => (cat?.count || cat?.products_count || 0);

  const getParentName = (parentId) => {
    if (!parentId || parentId === 0) return null;
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? (parent.name || parent.title || null) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        /* Dropdown option styles. Note: native select option styling can be limited
           on some platforms/browsers (especially Windows/Chromium). */
        select option {
          background-color: white;
          color: #333;
          padding: 8px;
        }
        /* Preferred selected color: use theme #005660 */
        select option:checked {
          background: linear-gradient(#005660, #005660);
          background-color: #005660 !important;
          color: #ffffff !important;
        }
        /* Slightly tinted hover to hint selection */
        select option:hover {
          background: linear-gradient(#e6f6f5, #e6f6f5);
          background-color: #e6f6f5 !important;
        }
        /* For some browsers that support it, style the select when an option is selected */
        select { color: #333; }
        select:focus { outline: none; }
      `}</style>
      {/* Header - Outside dark bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{platform === 'shopify' ? 'Collections' : 'Product Categories'}</h1>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-700">
                <span className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'checking' ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
                {platform === 'shopify' ? 'Shopify' : 'WooCommerce'} — {connectionStatus}
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {platform === 'shopify' ? 'Manage your Shopify collections (create, delete, list, link products).' : 'Manage your product categories and organize your store.'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              disabled={connectionStatus !== 'connected'}
              className="inline-flex items-center px-4 py-2 bg-[#005660] text-white rounded-md hover:bg-[#024952] focus:outline-none focus:ring-2 focus:ring-[#024952] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              + {platform === 'shopify' ? 'Collection' : 'Category'}
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'disconnected'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus === 'checking' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            {connectionStatus === 'connected' && <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>}
            {connectionStatus === 'disconnected' && <AlertCircle className="w-3 h-3 mr-1" />}
            {platform === 'shopify' ? 'Shopify' : 'WooCommerce'}: {connectionStatus === 'connected' ? 'Connected' : connectionStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
          </div>
          {connectionStatus === 'disconnected' && (
            <button
              onClick={checkConnection}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Retry
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-[#005660] animate-spin" />
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      )}

      {/* Bulk Actions and Search */}
      {!loading && !error && (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-xl p-4 mb-6 shadow-lg border border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Bulk Actions */}
            <div className="flex items-center gap-3">
              <select 
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                disabled={saving}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-transparent disabled:opacity-50"
              >
                <option value="">Bulk Actions</option>
                <option value="delete">Delete</option>
              </select>
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || selectedCategories.length === 0 || saving}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Apply
              </button>
              <span className="text-sm text-gray-500">
                {selectedCategories.length} of {filteredCategories.length} selected
              </span>
            </div>

            {/* Search */}
            <div className="relative flex-1 lg:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-black/40 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-transparent transition"
              />
            </div>
          </div>
        </div>
      )}





      {/* Categories Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={selectedCategories.length === paginatedCategories.length && paginatedCategories.length > 0}
                      className="h-4 w-4 text-[#005660] focus:ring-[#024952] border-gray-300 rounded"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedCategories.length > 0 ? (
                  paginatedCategories.map((category) => {
                    const parentName = getParentName(category.parent);
                    return (
                      <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.id)}
                            onChange={() => handleSelectCategory(category.id)}
                            className="h-4 w-4 text-[#005660] focus:ring-[#024952] border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-10 w-10">
                            {category.image && (typeof category.image === 'string' || (category.image && category.image.src)) ? (
                              <img
                                className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                                src={typeof category.image === 'string' ? category.image : category.image.src}
                                alt={getDisplayName(category)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextElementSibling) {
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div 
                              className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center"
                              style={{ display: category.image ? 'none' : 'flex' }}
                            >
                              <ImageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {parentName && (
                                  <span className="text-gray-400 mr-2">↳</span>
                                )}
                                {getDisplayName(category)}
                              </div>
                              {parentName && (
                                <div className="text-sm text-gray-500">
                                  Parent: {parentName}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {getDescription(category) || (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getSlug(category)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {getCount(category)} products
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditModal(category)}
                              disabled={saving}
                              className="text-[#005660] hover:text-blue-900 transition-colors disabled:opacity-50"
                              title="Edit category"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              disabled={saving}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Delete category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="text-gray-400 text-lg font-medium mb-2">
                          No categories found
                        </div>
                        <p className="text-gray-500 text-sm mb-4">
                          {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first category'}
                        </p>
                        {!searchTerm && connectionStatus === 'connected' && (
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-[#005660] text-white rounded-md hover:bg-[#024952] focus:outline-none focus:ring-2 focus:ring-[#024952] focus:ring-offset-2 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Category
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredCategories.length > 0 && (
            <div className="bg-white px-6 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(startIndex + itemsPerPage, filteredCategories.length)}
                  </span>{" "}
                  of <span className="font-medium">{filteredCategories.length}</span> results
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">First</span>
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </button>
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{" "}
                  <span className="font-medium">{totalPages}</span>
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="sr-only">Last</span>
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Add New {platform === 'shopify' ? 'Collection' : 'Category'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddCategory} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        {uploadingImage ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#005660] mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-2">Uploading...</p>
                          </div>
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a category image. This will be displayed on your store.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {platform === 'shopify' ? 'Collection Name' : 'Category Name'} *
                </label>
                <input
                  type="text"
                  id="category-name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, name: e.target.value }));
                    if (!formData.slug) {
                      generateSlug(e.target.value);
                    }
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#024952] focus:border-transparent"
                  placeholder={platform === 'shopify' ? 'Enter collection name' : 'Enter category name'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {platform === 'shopify' 
                    ? 'The name is how it appears on your store.'
                    : 'The name is how it appears on your site.'}
                </p>
              </div>

              {/* Slug field (for both platforms) */}
              <div>
                <label htmlFor="category-slug" className="block text-sm font-medium text-gray-700 mb-2">
                  {platform === 'shopify' ? 'Handle' : 'Slug'}
                </label>
                <input
                  type="text"
                  id="category-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#024952] focus:border-transparent"
                  placeholder={platform === 'shopify' ? 'collection-handle' : 'category-slug'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {platform === 'shopify' 
                    ? 'The handle is the URL-friendly version. Usually all lowercase with hyphens.'
                    : 'The "slug" is the URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.'}
                </p>
              </div>

              {/* Parent Category field (for both platforms) */}
              <div>
                <label htmlFor="category-parent" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  id="category-parent"
                  value={formData.parent}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-transparent"
                >
                  <option value="0">None</option>
                  {categories.filter(cat => Number(cat.parent || 0) === 0).map(category => (
                    <option key={category.id} value={category.id}>
                      {getDisplayName(category)}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {platform === 'shopify' 
                    ? 'Link this collection to a parent collection (optional).'
                    : 'Categories can have a hierarchy. You might have a Jazz category, and under that have children categories for Bebop and Big Band. Totally optional.'}
                </p>
              </div>

              <div>
                <label htmlFor="category-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="category-description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#024952] focus:border-transparent"
                  placeholder="Enter category description (optional)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  The description is not prominent by default; however, some themes may show it.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#005660] text-white rounded-md hover:bg-[#024952] transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add New {platform === 'shopify' ? 'Collection' : 'Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Edit {platform === 'shopify' ? 'Collection' : 'Category'}
              </h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditCategory} className="p-6 space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                        {uploadingImage ? (
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#005660] mx-auto"></div>
                            <p className="text-xs text-gray-500 mt-2">Uploading...</p>
                          </div>
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
                      <Upload className="w-4 h-4 mr-2" />
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">
                      Upload a category image. This will be displayed on your store.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="edit-category-name" className="block text-sm font-medium text-gray-700 mb-2">
                  {platform === 'shopify' ? 'Collection Name' : 'Category Name'} *
                </label>
                <input
                  type="text"
                  id="edit-category-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#024952] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="edit-category-slug" className="block text-sm font-medium text-gray-700 mb-2">
                  {platform === 'shopify' ? 'Handle' : 'Slug'}
                </label>
                <input
                  type="text"
                  id="edit-category-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#024952] focus:border-transparent"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {platform === 'shopify' 
                    ? 'The handle is the URL-friendly version. Usually all lowercase with hyphens.'
                    : 'The "slug" is the URL-friendly version of the name.'}
                </p>
              </div>

              {/* Parent Category field (for both platforms) */}
              <div>
                <label htmlFor="edit-category-parent" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  id="edit-category-parent"
                  value={formData.parent}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#005660] focus:border-transparent"
                >
                  <option value="0">None</option>
                  {categories
                    .filter(cat => Number(cat.parent || 0) === 0 && cat.id !== editingCategory.id)
                    .map(category => (
                    <option key={category.id} value={category.id}>
                      {getDisplayName(category)}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  {platform === 'shopify' 
                    ? 'Link this collection to a parent collection (optional).'
                    : 'Set a parent category for hierarchy (optional).'}
                </p>
              </div>

              <div>
                <label htmlFor="edit-category-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="edit-category-description"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#024952] focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#005660] text-white rounded-md hover:bg-[#024952] transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default CategoriesPage;