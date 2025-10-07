import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { getCategories } from '../services/inventory';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getCategories();
        const data = Array.isArray(res?.data) ? res.data : (res?.data?.results || []);
        if (mounted) setCategories(data);
      } catch (e) {
        console.error('Failed to load categories', e);
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-extralight tracking-widest text-center uppercase mb-12">
        Shop by Category
      </h2>
      {loading ? (
        <div className="text-center py-12 text-neutral-600">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 text-neutral-600">No categories yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => {
            const id = category.id;
            const name = category.name || 'Category';
            const imageUrl = `https://placehold.co/600x800/EEE/333?text=${encodeURIComponent(name)}`;
            // Link target can be configured later; using /products with query param placeholder
            const to = { pathname: '/products', search: `?category=${id}` };
            return (
              <NavLink key={id || name} to={to} className="relative group overflow-hidden cursor-pointer">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-neutral-900 bg-opacity-30 flex items-center justify-center transition-opacity duration-300 group-hover:bg-opacity-50">
                  <p className="text-white text-xl font-light tracking-wider uppercase">
                    {name}
                  </p>
                </div>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;
