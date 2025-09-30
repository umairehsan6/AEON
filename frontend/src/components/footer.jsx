import React from 'react';

function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-200 p-8 md:p-12 shadow-inner">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center text-sm space-y-4 md:space-y-0">
        <div className="text-center md:text-left">
          <h3 className="font-bold tracking-wide uppercase text-lg">AEON</h3>
          <p className="mt-2 text-xs">&copy; 2024 AEON. All Rights Reserved.</p>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200" aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.5" y1="6.5" y2="6.5"/>
            </svg>
          </a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
              <path d="M22 4s-2.1 1.6-4.6 3.6c-.6.4-1.2.7-1.8.9s-1.2.5-1.8.6c-2.4.4-4.8-.8-6.4-2.8l-1-2c-1.4 2-2.4 4.5-2.8 6.5s-.8 4 .8 5.6c.4.4.8.8 1.2 1.1s.8.6 1.2.8c-1 .2-2 .1-3-.2s-2-.7-3-1.6c1.6 1.4 3.2 2.3 5 2.8s3.6.8 5.4.4c.8-.1 1.6-.3 2.4-.6s1.6-.7 2.4-1.2c2.4-2 4-4.5 4.8-7s.8-5.5-.4-8.8c.8.2 1.6.4 2.4.6s1.6.3 2.4.4z"/>
            </svg>
          </a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors duration-200" aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
