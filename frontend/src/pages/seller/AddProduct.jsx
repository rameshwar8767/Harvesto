import React, { useState } from 'react';
import { assets, categories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { productApi } from '../../api';

const AddProduct = () => {
    const { products, setProducts, navigate } = useAppContext();

    const [files, setFiles] = useState([]);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [stock, setStock] = useState("25");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);

        const stockNum = Math.max(0, parseInt(stock, 10) || 0);

        const newProduct = {
            _id: `prod_${Date.now()}`,
            name,
            description: description.split("\n").filter(Boolean),
            category: category.toLowerCase(),
            price: Number(price),
            offerPrice: Number(offerPrice),
            stock: stockNum,
            inStock: stockNum > 0,
            image: [assets.upload_area], // Fallback default image
        };

        try {
            const data = await productApi.create(newProduct);
            if (data.success && data.product) {
                setProducts([data.product, ...products]);
                toast.success("Product added successfully!");
                navigate('/seller/products-list');
                return;
            }
        } catch {
            // Add locally to state if server is offline
            setProducts([newProduct, ...products]);
            toast.success("Product added to catalog!");
            navigate('/seller/products-list');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="no-scrollbar flex-1 h-[95vh] overflow-y-scroll flex flex-col justify-between">
            <form onSubmit={onSubmitHandler} className="md:p-10 p-4 space-y-5 max-w-lg">
                <div>
                    <p className="text-base font-semibold text-gray-800">Product Image</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                        {Array(4).fill('').map((_, index) => (
                            <label key={index} htmlFor={`image${index}`}>
                                <input 
                                    onChange={(event) => {
                                        const updatedFiles = [...files];
                                        updatedFiles[index] = event.target.files[0];
                                        setFiles(updatedFiles);
                                    }}  
                                    type="file" 
                                    id={`image${index}`} 
                                    hidden 
                                />
                                <img 
                                    className="max-w-24 h-24 object-contain border border-gray-200 rounded cursor-pointer p-1 hover:border-primary" 
                                    src={files[index] ? URL.createObjectURL(files[index]) : assets.upload_area} 
                                    alt="upload" 
                                    width={100} 
                                    height={100} 
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-sm font-medium text-gray-700" htmlFor="product-name">Product Name</label>
                    <input 
                        onChange={(e) => setName(e.target.value)} 
                        value={name} 
                        id="product-name" 
                        type="text" 
                        placeholder="e.g. Organic Tomatoes" 
                        className="outline-none py-2.5 px-3 rounded border border-gray-300 focus:border-primary text-gray-800" 
                        required 
                    />
                </div>

                <div className="flex flex-col gap-1 max-w-md">
                    <label className="text-sm font-medium text-gray-700" htmlFor="product-description">Product Description</label>
                    <textarea 
                        onChange={(e) => setDescription(e.target.value)} 
                        value={description} 
                        id="product-description" 
                        rows={4} 
                        className="outline-none py-2.5 px-3 rounded border border-gray-300 focus:border-primary resize-none text-gray-800 text-sm" 
                        placeholder="Enter product details, one bullet point per line"
                        required
                    />
                </div>

                <div className="w-full flex flex-col gap-1 max-w-md">
                    <label className="text-sm font-medium text-gray-700" htmlFor="category">Category</label>
                    <select 
                        onChange={(e) => setCategory(e.target.value)} 
                        value={category} 
                        id="category" 
                        className="outline-none py-2.5 px-3 rounded border border-gray-300 focus:border-primary text-gray-800 text-sm capitalize"
                        required
                    >
                        <option value="">Select Category</option>
                        {categories.map((item, index) => (
                            <option value={item.path} key={index} className="capitalize">{item.text || item.path}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-5 flex-wrap max-w-md">
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-price">Regular Price (MRP)</label>
                        <input 
                            onChange={(e) => setPrice(e.target.value)} 
                            value={price} 
                            id="product-price" 
                            type="number" 
                            placeholder="99" 
                            className="outline-none py-2.5 px-3 rounded border border-gray-300 focus:border-primary text-gray-800" 
                            required 
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="offer-price">Selling Price</label>
                        <input 
                            onChange={(e) => setOfferPrice(e.target.value)} 
                            value={offerPrice} 
                            id="offer-price" 
                            type="number" 
                            placeholder="79" 
                            className="outline-none py-2.5 px-3 rounded border border-gray-300 focus:border-primary text-gray-800" 
                            required 
                        />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <label className="text-sm font-medium text-gray-700" htmlFor="product-stock">Stock Quantity</label>
                        <input 
                            onChange={(e) => setStock(e.target.value)} 
                            value={stock} 
                            id="product-stock" 
                            type="number" 
                            min="0"
                            placeholder="25" 
                            className="outline-none py-2.5 px-3 rounded border border-gray-300 focus:border-primary text-gray-800" 
                            required 
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="px-8 cursor-pointer py-2.5 bg-primary hover:bg-primary-dull transition text-white font-medium rounded shadow-sm disabled:opacity-50 mt-4"
                >
                    {loading ? "Adding Product..." : "Add Product"}
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
