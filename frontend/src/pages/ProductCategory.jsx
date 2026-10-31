import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useParams } from 'react-router-dom';
import { categories } from '../assets/assets';
import ProductCard from '../components/ProductCard';

const ProductCategory = () => {
    const { products } = useAppContext();
    const { category } = useParams();

    const searchCategory = categories.find((item) => item.path.toLowerCase() === category?.toLowerCase());
    const filterProducts = products.filter((product) => product.category.toLowerCase() === category?.toLowerCase());

    return (
        <div className='mt-12 flex flex-col mb-16'>
            <div className='flex flex-col items-start w-max mb-6'>
                <p className='text-2xl md:text-3xl font-semibold text-gray-800'>
                    {searchCategory ? searchCategory.text : category}
                </p>
                <div className='w-16 h-1 bg-primary rounded-full mt-1.5'></div>
            </div>

            {filterProducts.length > 0 ? (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6'> 
                    {filterProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div className='flex flex-col items-center justify-center min-h-[50vh] text-center'>
                    <p className='font-medium text-gray-500 text-xl'>No products found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default ProductCategory;
