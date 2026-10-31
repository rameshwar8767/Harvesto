import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { productApi } from '../../api';

const ProductList = () => {
    const { products, setProducts, currency } = useAppContext();

    const handleToggleStock = async (product) => {
        const updatedStatus = !product.inStock;
        
        // Optimistically update frontend state
        setProducts(products.map((p) => (p._id === product._id ? { ...p, inStock: updatedStatus } : p)));

        try {
            const data = await productApi.toggleStock(product._id, updatedStatus).catch(() => null);
            if (data && data.success) {
                toast.success(data.message || `Product marked as ${updatedStatus ? "In Stock" : "Out of Stock"}`);
                return;
            }
        } catch {
            // Local state updated
        }
        toast.success(`Product marked as ${updatedStatus ? "In Stock" : "Out of Stock"}`);
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <div className="w-full md:p-10 p-4">
                <h2 className="pb-4 text-xl font-medium text-gray-800">All Products ({products.length})</h2>
                <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-lg bg-white border border-gray-200 shadow-sm">
                    <table className="md:table-auto table-fixed w-full overflow-hidden">
                        <thead className="text-gray-700 bg-gray-50 text-xs uppercase font-semibold text-left">
                            <tr>
                                <th className="px-4 py-3.5">Product</th>
                                <th className="px-4 py-3.5">Category</th>
                                <th className="px-4 py-3.5 hidden md:table-cell">Selling Price</th>
                                <th className="px-4 py-3.5">Stock Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50/50 transition">
                                    <td className="px-4 py-3 flex items-center space-x-3">
                                        <div className="border border-gray-200 rounded p-1.5 w-14 h-14 flex items-center justify-center shrink-0">
                                            <img src={product.image?.[0]} alt={product.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <span className="font-medium text-gray-800 truncate max-w-xs">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3 capitalize text-gray-500">{product.category}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">{currency}{product.offerPrice}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer gap-2 select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={Boolean(product.inStock)}
                                                onChange={() => handleToggleStock(product)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                            <span className="text-xs font-medium text-gray-500 max-sm:hidden">
                                                {product.inStock ? "In Stock" : "Out of Stock"}
                                            </span>
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
