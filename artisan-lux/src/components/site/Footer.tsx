export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl text-white mb-4">Artisan Lux</h3>
            <p className="text-sm text-neutral-400">
              Premier luxury e-commerce platform for exceptional craftsmanship.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/categories" className="hover:text-white transition-colors">All Categories</a></li>
              <li><a href="/search" className="hover:text-white transition-colors">Search Products</a></li>
              <li><a href="/wishlist" className="hover:text-white transition-colors">Wishlist</a></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/orders" className="hover:text-white transition-colors">Order History</a></li>
              <li><a href="/signin" className="hover:text-white transition-colors">Sign In</a></li>
              <li><a href="/signup" className="hover:text-white transition-colors">Sign Up</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="/faq" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="/shipping" className="hover:text-white transition-colors">Shipping Info</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Artisan Lux. All rights reserved.
          </p>
          
          {/* Developer Watermark */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-neutral-500">
            <span>
              Crafted by{" "}
              <a 
                href="https://github.com/swoet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors font-medium"
              >
                Shawn Mutogo
              </a>
            </span>
            <span className="hidden md:inline">•</span>
            <a 
              href="mailto:shawnmutogo5@gmail.com"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              shawnmutogo5@gmail.com
            </a>
            <span className="hidden md:inline">•</span>
            <a 
              href="tel:+263788302692"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              +263 78 830 2692
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
