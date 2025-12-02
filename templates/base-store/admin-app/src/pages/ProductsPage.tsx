import { useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Package, Search, Upload, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { adminApi, Product, formatPrice } from '../api/client';
import { PageHeader } from '../components/PageHeader';
import { Modal } from '../components/Modal';

// Max file size: 2MB
const MAX_FILE_SIZE = 2 * 1024 * 1024;

interface ProductFormData {
  title: string;
  description: string;
  price: string; // Dollars with decimals (e.g., "25.00")
  currency: string;
  imageUrl: string;
  stock: number;
  isActive: boolean;
}

const defaultFormData: ProductFormData = {
  title: '',
  description: '',
  price: '',
  currency: 'usd',
  imageUrl: '',
  stock: 0,
  isActive: true,
};

// Helper functions for price conversion
function centsToDollars(cents: number | undefined): string {
  return ((cents || 0) / 100).toFixed(2);
}

function dollarsToCents(dollars: string): number {
  const parsed = parseFloat(dollars);
  return isNaN(parsed) ? 0 : Math.round(parsed * 100);
}

export function ProductsPage() {
  const { selectedStore, isLoading: storeLoading } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Image upload state
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(file: File) {
    setImageError(null);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setImageError('Please upload an image file');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setImageError('Image must be less than 2MB');
      return;
    }
    
    try {
      const base64 = await fileToBase64(file);
      setFormData({ ...formData, imageUrl: base64 });
    } catch (error) {
      setImageError('Failed to process image');
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }

  function removeImage() {
    setFormData({ ...formData, imageUrl: '' });
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  useEffect(() => {
    loadProducts();
  }, [selectedStore]);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(products.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      ));
    } else {
      setFilteredProducts(products);
    }
  }, [products, searchQuery]);

  async function loadProducts() {
    if (!selectedStore) return;
    setIsLoading(true);
    try {
      const data = await adminApi.getProducts(selectedStore.id);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateModal() {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setImageError(null);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      price: centsToDollars(product.priceCents),
      currency: product.currency,
      imageUrl: product.imageUrl || '',
      stock: product.stock || 0,
      isActive: Boolean(product.isActive),
    });
    setImageError(null);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStore) return;
    
    const priceCents = dollarsToCents(formData.price);
    
    setIsSaving(true);
    try {
      if (editingProduct) {
        await adminApi.updateProduct(selectedStore.id, editingProduct.id, {
          title: formData.title,
          description: formData.description || undefined,
          priceCents,
          imageUrl: formData.imageUrl || undefined,
          stock: formData.stock,
          isActive: formData.isActive,
        });
      } else {
        await adminApi.createProduct(selectedStore.id, {
          title: formData.title,
          description: formData.description || undefined,
          priceCents,
          currency: formData.currency,
          imageUrl: formData.imageUrl || undefined,
          stock: formData.stock,
          isActive: formData.isActive,
        });
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    if (!selectedStore) return;
    try {
      await adminApi.deleteProduct(selectedStore.id, productId);
      setDeleteConfirm(null);
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-surface-100">No store selected</h2>
        <p className="mt-2 text-surface-500">Select a store from the sidebar to manage products.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Products" 
        description={`Manage products for ${selectedStore.slug}`}
        actions={
          <button onClick={openCreateModal} className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-20 card">
          <Package className="w-12 h-12 text-surface-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-surface-100">
            {searchQuery ? 'No products found' : 'No products yet'}
          </h2>
          <p className="mt-1 text-surface-500">
            {searchQuery ? 'Try a different search term' : 'Create your first product to get started'}
          </p>
          {!searchQuery && (
            <button onClick={openCreateModal} className="btn btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-800 overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-surface-600" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-surface-100">{product.title}</p>
                        {product.description && (
                          <p className="text-xs text-surface-500 truncate max-w-[200px]">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="font-mono text-surface-100">
                    {formatPrice(product.priceCents || 0, product.currency)}
                  </td>
                  <td>
                    <span className={product.stock === 0 ? 'text-red-400' : 'text-surface-300'}>
                      {product.stock ?? '∞'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-1.5 text-surface-400 hover:text-surface-100 hover:bg-surface-800 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Price ($) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="input"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="label">Currency *</label>
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="input"
                disabled={!!editingProduct}
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Stock</label>
              <input
                type="number"
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={e => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Product Image</label>
            
            {formData.imageUrl ? (
              // Image Preview
              <div className="relative">
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-surface-800 border border-surface-700">
                  <img 
                    src={formData.imageUrl} 
                    alt="Product preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-surface-900/80 hover:bg-red-500 text-surface-300 hover:text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Upload Area
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  relative flex flex-col items-center justify-center w-full h-48 
                  border-2 border-dashed rounded-lg cursor-pointer transition-colors
                  ${isDragging 
                    ? 'border-primary-500 bg-primary-500/10' 
                    : 'border-surface-700 hover:border-surface-600 bg-surface-800/50 hover:bg-surface-800'
                  }
                `}
              >
                <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-primary-400' : 'text-surface-500'}`} />
                <p className="text-sm text-surface-400">
                  <span className="font-medium text-primary-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-surface-500 mt-1">PNG, JPG, GIF up to 2MB</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {imageError && (
              <p className="mt-2 text-sm text-red-400">{imageError}</p>
            )}
            
            {/* Optional: URL input as fallback */}
            <div className="mt-3">
              <p className="text-xs text-surface-500 mb-1">Or enter image URL:</p>
              <input
                type="url"
                value={formData.imageUrl.startsWith('data:') ? '' : formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="input text-sm"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Product"
        size="sm"
      >
        <p className="text-surface-300 mb-6">
          Are you sure you want to delete this product? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirm(null)}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            className="btn btn-danger"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
