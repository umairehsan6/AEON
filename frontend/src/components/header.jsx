import React, { useState } from 'react';
// NOTE: NavLink import removed to prevent console errors if component is not
// rendered inside a <BrowserRouter> or other Router component.
// All instances replaced with <a> tags.

function Header() {
  // State to control the visibility of the sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State to control which main accordion section (WOMEN/MAN/KIDS) is open
  const [openSection, setOpenSection] = useState(null);
  // State to control which nested accordion section (e.g., CLOTHING) is open
  // This uses a unique ID like 'WOMEN-CLOTHING'
  const [openNestedSection, setOpenNestedSection] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    // Close all accordions when sidebar closes
    if (isSidebarOpen) {
        setOpenSection(null);
        setOpenNestedSection(null);
    }
  };

  const toggleSection = (title) => {
    // If the clicked section is already open, close it, otherwise open the new section
    setOpenSection(openSection === title ? null : title);
    // Also close any nested section when a new main section is opened
    setOpenNestedSection(null); 
  };
  
  const toggleNestedSection = (id) => {
    // If the clicked nested section is already open, close it, otherwise open the new section
    setOpenNestedSection(openNestedSection === id ? null : id);
  };


  // Define the comprehensive category data with nested structures for the sidebar
  const categories = [
    {
      title: 'WOMEN',
      slug: '/women',
      sections: [
        { title: 'NEW ARRIVALS', slug: '/women/new-arrivals' },
        {
            title: 'CLOTHING',
            nestedCategories: [
                { title: 'DRESSES', slug: '/women/dresses' },
                { title: 'TOPS', slug: '/women/tops' },
                { title: 'SKIRTS', slug: '/women/skirts' },
                { title: 'JEANS', slug: '/women/jeans' },
                { title: 'OUTERWEAR', slug: '/women/outerwear' },
                { title: 'KNITWEAR', slug: '/women/knitwear' },
                { title: 'SHORTS', slug: '/women/shorts' },
                { title: 'CO-ORDS', slug: '/women/co-ords' },
            ]
        },
        { title: 'SHOES', slug: '/women/shoes' },
        { title: 'ACCESSORIES', slug: '/women/accessories' },
        { title: 'SALE', slug: '/women/sale', isSale: true },
      ],
    },
    {
      title: 'MAN',
      slug: '/man',
      sections: [
        { title: 'NEW ARRIVALS', slug: '/man/new-arrivals' },
        {
            title: 'CLOTHING',
            nestedCategories: [
                { title: 'SHIRTS', slug: '/man/shirts' },
                { title: 'T-SHIRTS & POLOS', slug: '/man/tshirts-polos' },
                { title: 'TROUSERS', slug: '/man/trousers' },
                { title: 'DENIM', slug: '/man/denim' },
                { title: 'JACKETS & COATS', slug: '/man/jackets-coats' },
                { title: 'SUITS & BLAZERS', slug: '/man/suits-blazers' },
                { title: 'SWEATERS & CARDIGANS', slug: '/man/knitwear' },
            ]
        },
        { title: 'SHOES', slug: '/man/shoes' },
        { title: 'ACCESSORIES', slug: '/man/accessories' },
        { title: 'SALE', slug: '/man/sale', isSale: true },
      ],
    },
    {
      title: 'KIDS',
      slug: '/kids',
      // For kids, we keep it mostly flat as is common for smaller collections
      sections: [
        { title: 'BABY (0-12M)', slug: '/kids/baby' },
        { title: 'TODDLER (1-5Y)', slug: '/kids/toddler' },
        { title: 'GIRL (6-14Y)', slug: '/kids/girl' },
        { title: 'BOY (6-14Y)', slug: '/kids/boy' },
        { title: 'OUTERWEAR', slug: '/kids/outerwear' },
        { title: 'SHOES', slug: '/kids/shoes' },
        { title: 'ACCESSORIES', slug: '/kids/accessories' },
        { title: 'SALE', slug: '/kids/sale', isSale: true },
      ],
    },
  ];

  return (
    <div className="font-['Inter']">
      
      {/* Header (Minimalistic Zara Style) 
          Changed 'fixed top-0' to 'sticky top-0' so the header reserves its space in the document flow, 
          pushing content down, while still sticking to the top when scrolling.
      */}
      <header className="sticky top-0 w-full bg-white text-black p-4 md:py-6 md:px-8 flex justify-between items-center shadow-2xl border-b border-gray-100 z-50">
        
        {/* LEFT SIDE: Menu Button */}
        <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 focus:outline-none hover:bg-gray-50 rounded-md transition duration-300"
              aria-label="Open sidebar menu"
            >
              {/* Simple Hamburger Icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
        </div>

        {/* CENTER: Logo/Brand Name (Clickable to home) */}
        <div className="flex-grow text-center">
            {/* Using <a> tag with href="/" for home link */}
            <a href="/" className="inline-block" onClick={() => isSidebarOpen && toggleSidebar()}>
                {/* Logo with high tracking and light font weight, typical of luxury fashion brands */}
                <h1 className="text-xl md:text-3xl font-light tracking-[0.45em] uppercase hover:opacity-75 transition-opacity">
                  AEON
                </h1>
            </a>
        </div>

        {/* RIGHT SIDE: Actions (Login & Cart) */}
        <div className="flex items-center space-x-6 md:space-x-8">
          
          <a 
            href="/login" 
            className="font-light text-sm tracking-wide uppercase hover:underline hover:text-gray-700 transition-all duration-200"
          >
            LOGIN
          </a>
          {/* Cart Icon - Using text as requested */}
          <a 
            href="/cart" 
            className="font-light text-sm tracking-wide uppercase hover:underline hover:text-gray-700 transition-all duration-200"
          >
            CART
          </a>
        </div>
      </header>

      {/* Sidebar (Full Navigation) */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-xs sm:max-w-sm bg-white shadow-xl transform transition-transform duration-500 ease-in-out z-[60] overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 md:p-8 pt-6">
          
          {/* Sidebar Header/Close Button */}
          <div className="flex justify-end mb-10">
            <button
              onClick={toggleSidebar}
              className="p-2 text-gray-800 hover:text-black focus:outline-none transition duration-300 hover:bg-gray-50 rounded-md"
              aria-label="Close sidebar menu"
            >
              {/* Close X Icon */}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Sidebar Content: Main Accordions (WOMEN, MAN, KIDS) */}
          <div className="flex flex-col space-y-4">
            {categories.map((section) => {
                const isMainOpen = openSection === section.title;
                return (
                    <div key={section.title} className="group border-b border-gray-100 last:border-b-0">
                        {/* Level 1: Accordion Toggle Button (Gender) */}
                        <button
                            onClick={() => toggleSection(section.title)}
                            className="flex justify-between items-center w-full text-3xl font-normal uppercase tracking-widest py-3 hover:text-gray-600 transition-colors focus:outline-none text-left"
                        >
                            <span>{section.title}</span>
                            {/* Chevron Icon that rotates */}
                            <svg 
                                className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isMainOpen ? 'rotate-180' : 'rotate-0'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </button>

                        {/* Level 1: Accordion Content (Subsections) */}
                        <div 
                            className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${
                                isMainOpen ? 'max-h-[800px]' : 'max-h-0'
                            }`}
                        >
                            <div className="pl-4 space-y-3 pb-4 pt-1">
                                
                                {/* Link to the main category overview page (e.g., VIEW ALL WOMEN) */}
                                <a
                                    href={section.slug}
                                    onClick={toggleSidebar}
                                    className="block text-base font-medium uppercase tracking-wider text-black hover:text-red-600 transition-colors duration-200 pt-1"
                                >
                                    VIEW ALL {section.title}
                                </a>
                                
                                {/* Mapping over all internal sections (NEW ARRIVALS, CLOTHING, SHOES, etc.) */}
                                {section.sections.map((subSection) => {
                                    const isNestedOpen = openNestedSection === `${section.title}-${subSection.title}`;
                                    const uniqueId = `${section.title}-${subSection.title}`;

                                    // Case 1: SubSection has nested categories (e.g., CLOTHING) -> Make it a nested accordion
                                    if (subSection.nestedCategories) {
                                        return (
                                            <div key={uniqueId}>
                                                <button
                                                    onClick={() => toggleNestedSection(uniqueId)}
                                                    className="flex justify-between items-center w-full text-sm font-light uppercase tracking-wider text-gray-700 hover:text-black transition-colors duration-200 focus:outline-none text-left py-1"
                                                >
                                                    <span>{subSection.title}</span>
                                                    {/* Smaller Chevron Icon that rotates */}
                                                    <svg 
                                                        className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isNestedOpen ? 'rotate-180' : 'rotate-0'}`} 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24" 
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7"></path>
                                                    </svg>
                                                </button>
                                                
                                                {/* Level 2: Nested Accordion Content (e.g., TOPS, SKIRTS) */}
                                                <div 
                                                    className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                                                        isNestedOpen ? 'max-h-[500px]' : 'max-h-0'
                                                    }`}
                                                >
                                                    <div className="pl-4 space-y-2 py-1">
                                                        {subSection.nestedCategories.map((nestedCat) => (
                                                            <a
                                                                key={nestedCat.slug}
                                                                href={nestedCat.slug} 
                                                                onClick={toggleSidebar}
                                                                className="block text-xs font-light uppercase tracking-wider text-gray-500 hover:text-black transition-colors duration-200"
                                                            >
                                                                {nestedCat.title}
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } 
                                    
                                    // Case 2: SubSection is a direct link (e.g., NEW ARRIVALS, SHOES)
                                    return (
                                        <a
                                            key={subSection.slug}
                                            href={subSection.slug} 
                                            onClick={toggleSidebar}
                                            className="block text-sm font-light uppercase tracking-wider text-gray-700 hover:text-black transition-colors duration-200 py-1"
                                        >
                                            {subSection.title}
                                        </a>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
          
          {/* Footer links for help/stores */}
          <div className="mt-16 pt-6 border-t border-gray-100 space-y-2">
            <a href="/help" onClick={toggleSidebar} className="block text-sm font-light uppercase tracking-wider text-gray-500 hover:text-black transition-colors duration-200 py-1">
                HELP
            </a>
            <a href="/stores" onClick={toggleSidebar} className="block text-sm font-light uppercase tracking-wider text-gray-500 hover:text-black transition-colors duration-200 py-1">
                STORES
            </a>
          </div>

        </div>
      </div>

      {/* Backdrop to close sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-[55] transition-opacity duration-500 ease-in-out"
          onClick={toggleSidebar}
        ></div>
      )}
      
    </div>
  );
}

export default Header;
