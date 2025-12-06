import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../admin/components/AdminLayout';
import { productsAPI, uploadAPI } from '../api';
import { showSuccess, showError, confirmDelete } from '../utils/alerts';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    name_th: '',
    name_en: '',
    description_th: '',
    description_en: '',
    price: '',
    stock: '',
    category: '',
    images: [],
    discount: {
      type: 'none',
      value: 0,
      startDate: '',
      endDate: '',
    },
  });

  const [previewImages, setPreviewImages] = useState([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      };
      const response = await productsAPI.getAll(params);
      setProducts(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      showError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/categories`);
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('discount.')) {
      const discountField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        discount: { ...prev.discount, [discountField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Preview images
    const newPreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
    }));
    setPreviewImages((prev) => [...prev, ...newPreviews]);
  };

  const uploadImages = async (productId) => {
    const filesToUpload = previewImages.filter((p) => p.file);
    if (filesToUpload.length === 0) return formData.images;

    setUploadingImages(true);
    const uploadedImages = [...formData.images];

    try {
      for (const preview of filesToUpload) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', preview.file);
        formDataUpload.append('productId', productId || 'new');

        const response = await uploadAPI.productSingle(formDataUpload);
        if (response.data.success) {
          uploadedImages.push({
            url: response.data.data.url,
            publicId: response.data.data.publicId,
            isPrimary: uploadedImages.length === 0,
          });
        }
      }
      return uploadedImages;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    } finally {
      setUploadingImages(false);
    }
  };

  const removePreviewImage = (index) => {
    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index].preview);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const removeExistingImage = async (index) => {
    const image = formData.images[index];
    if (image.publicId) {
      try {
        await uploadAPI.deleteFile(image.publicId);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
      }
    }
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let productId = editingProduct?._id;
      let uploadedImages = formData.images;

      // Upload new images
      if (previewImages.length > 0) {
        uploadedImages = await uploadImages(productId);
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        images: uploadedImages,
        discount: {
          ...formData.discount,
          value: parseFloat(formData.discount.value) || 0,
        },
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct._id, productData);
        showSuccess('Product updated successfully!');
      } else {
        await productsAPI.create(productData);
        showSuccess('Product created successfully!');
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name_th: product.name_th || '',
      name_en: product.name_en || '',
      description_th: product.description_th || '',
      description_en: product.description_en || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '',
      category: product.category || '',
      images: product.images || [],
      discount: product.discount || {
        type: 'none',
        value: 0,
        startDate: '',
        endDate: '',
      },
    });
    setPreviewImages([]);
    setShowModal(true);
  };

  const handleDelete = async (product) => {
    const result = await confirmDelete(product.name_en || product.name_th);
    if (result.isConfirmed) {
      try {
        // Delete images from Cloudinary
        if (product.images?.length > 0) {
          for (const img of product.images) {
            if (img.publicId) {
              try {
                await uploadAPI.deleteFile(img.publicId);
              } catch (e) {
                console.error('Failed to delete image:', e);
              }
            }
          }
        }
        await productsAPI.delete(product._id);
        showSuccess('Product deleted successfully!');
        fetchProducts();
      } catch (error) {
        showError('Failed to delete product');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name_th: '',
      name_en: '',
      description_th: '',
      description_en: '',
      price: '',
      stock: '',
      category: '',
      images: [],
      discount: {
        type: 'none',
        value: 0,
        startDate: '',
        endDate: '',
      },
    });
    setPreviewImages([]);
    setEditingProduct(null);
    setShowModal(false);
  };

  const getProductImage = (product) => {
    if (product.images?.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      return primary?.url || product.images[0]?.url;
    }
    return product.image || 'https://via.placeholder.com/100';
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">📦 Product Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>➕</span> Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-48">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name_en || cat.name}>
                    {cat.name_en || cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-2">📦</p>
              <p>No products found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <img
                        src={getProductImage(product)}
                        alt={product.name_en}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{product.name_en}</div>
                      <div className="text-sm text-gray-500">{product.name_th}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{product.category}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">฿{product.price?.toLocaleString()}</div>
                      {product.finalPrice && product.finalPrice < product.price && (
                        <div className="text-sm text-green-600">฿{product.finalPrice?.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          product.stock > 10
                            ? 'bg-green-100 text-green-800'
                            : product.stock > 0
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.discount?.type !== 'none' && product.discount?.value > 0 ? (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {product.discount.type === 'percentage'
                            ? `${product.discount.value}%`
                            : `฿${product.discount.value}`}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                  </h2>
                  <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 text-2xl">
                    ×
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name TH */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Thai) *
                    </label>
                    <input
                      type="text"
                      name="name_th"
                      value={formData.name_th}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Name EN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (English) *
                    </label>
                    <input
                      type="text"
                      name="name_en"
                      value={formData.name_en}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description TH */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Thai) *
                    </label>
                    <textarea
                      name="description_th"
                      value={formData.description_th}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description EN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (English) *
                    </label>
                    <textarea
                      name="description_en"
                      value={formData.description_en}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (฿) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.name_en || cat.name}>
                          {cat.name_en || cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Discount Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                    <select
                      name="discount.type"
                      value={formData.discount.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="none">No Discount</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (฿)</option>
                    </select>
                  </div>

                  {formData.discount.type !== 'none' && (
                    <>
                      {/* Discount Value */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Value
                        </label>
                        <input
                          type="number"
                          name="discount.value"
                          value={formData.discount.value}
                          onChange={handleInputChange}
                          min="0"
                          max={formData.discount.type === 'percentage' ? 100 : undefined}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Discount Dates */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          name="discount.startDate"
                          value={formData.discount.startDate?.split('T')[0] || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          name="discount.endDate"
                          value={formData.discount.endDate?.split('T')[0] || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Images Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>

                  {/* Existing Images */}
                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {formData.images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img.url}
                            alt={`Product ${index + 1}`}
                            className={`w-24 h-24 object-cover rounded-lg border-2 ${
                              img.isPrimary ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          />
                          {img.isPrimary && (
                            <span className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 rounded-br">
                              Main
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1 rounded-lg">
                            {!img.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimaryImage(index)}
                                className="p-1 bg-blue-500 text-white rounded text-xs"
                                title="Set as main"
                              >
                                ⭐
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="p-1 bg-red-500 text-white rounded text-xs"
                              title="Remove"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Preview Images */}
                  {previewImages.length > 0 && (
                    <div className="flex flex-wrap gap-4 mb-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.preview}
                            alt={`New ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-lg border-2 border-dashed border-green-400"
                          />
                          <span className="absolute top-0 left-0 bg-green-500 text-white text-xs px-1 rounded-br">
                            New
                          </span>
                          <button
                            type="button"
                            onClick={() => removePreviewImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-dashed border-gray-400 transition">
                      <span className="flex items-center gap-2">
                        <span>📷</span>
                        <span>Add Images</span>
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.images.length + previewImages.length} image(s) selected
                    </span>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploadingImages}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploadingImages ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>{editingProduct ? 'Update Product' : 'Create Product'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
