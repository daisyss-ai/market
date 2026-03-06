import React from 'react';
import { Heart, Bookmark } from 'lucide-react';

const ProductCard = ({ product }) => {
  const isGreen = product.statusColor === 'bg-green-400';

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-4 relative flex flex-col h-full shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
      {/* image + favorite */}
      <div className="relative mb-3 overflow-hidden rounded-xl bg-gradient-to-b from-gray-50 to-gray-100">
        <button
          aria-label="Favoritar"
          className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
        >
          <Heart className="w-4 h-4" />
        </button>

        <img
          src={product.img || 'https://via.placeholder.com/320x240?text=Produto'}
          alt={product.title}
          className="w-full h-40 md:h-44 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* meta */}
      <div className="flex items-center gap-1 text-[10px] text-gray-500 uppercase tracking-wide mb-1">
        <Bookmark className="w-3 h-3" />
        <span>{product.category}</span>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
        {product.title}
      </h3>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-lg font-extrabold text-gray-900">{product.price}</span>
        <span className="text-xs font-medium text-gray-500">kzs</span>
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between">
        <div className="flex items-center text-xs text-gray-600">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              product.statusColor || 'bg-red-400'
            }`}
          />
          <span>{product.seller}</span>
        </div>
        <span
          className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
            isGreen ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {isGreen ? 'Em stock' : 'Poucas unidades'}
        </span>
      </div>
    </div>
  );
};

export default ProductCard;
