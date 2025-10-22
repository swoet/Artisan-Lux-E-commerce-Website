export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-4">
            Shipping Information
          </h1>
          <p className="text-neutral-600 text-lg">
            Everything you need to know about our shipping policies and delivery options.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Shipping Options */}
          <section>
            <h2 className="font-serif text-3xl text-neutral-900 mb-6">Shipping Options</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-neutral-900 pl-6">
                <h3 className="font-semibold text-xl text-neutral-900 mb-2">Standard Shipping</h3>
                <p className="text-neutral-600 mb-2">Delivery in 5-7 business days</p>
                <p className="text-neutral-600">
                  <span className="font-semibold">Cost:</span> $15 (FREE on orders over $500)
                </p>
              </div>

              <div className="border-l-4 border-neutral-700 pl-6">
                <h3 className="font-semibold text-xl text-neutral-900 mb-2">Express Shipping</h3>
                <p className="text-neutral-600 mb-2">Delivery in 2-3 business days</p>
                <p className="text-neutral-600">
                  <span className="font-semibold">Cost:</span> $35
                </p>
              </div>

              <div className="border-l-4 border-neutral-500 pl-6">
                <h3 className="font-semibold text-xl text-neutral-900 mb-2">Next Day Delivery</h3>
                <p className="text-neutral-600 mb-2">Delivery within 1 business day</p>
                <p className="text-neutral-600">
                  <span className="font-semibold">Cost:</span> $65
                </p>
                <p className="text-sm text-neutral-500 mt-2">
                  Order before 2 PM for next-day delivery. Available in select areas only.
                </p>
              </div>
            </div>
          </section>

          {/* International Shipping */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="font-serif text-3xl text-neutral-900 mb-6">International Shipping</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                We proudly ship to over 50 countries worldwide. International shipping costs and delivery 
                times vary depending on the destination.
              </p>
              <div className="bg-neutral-50 p-4 rounded-md">
                <p className="font-semibold text-neutral-900 mb-2">Popular Destinations:</p>
                <ul className="space-y-1">
                  <li>• Europe: 7-14 business days, from $45</li>
                  <li>• Asia: 10-21 business days, from $55</li>
                  <li>• Australia: 10-18 business days, from $50</li>
                  <li>• South America: 14-21 business days, from $60</li>
                </ul>
              </div>
              <p className="text-sm">
                <span className="font-semibold text-neutral-900">Note:</span> International orders may be 
                subject to customs duties, taxes, and fees determined by your country's customs office. 
                These charges are the responsibility of the recipient.
              </p>
            </div>
          </section>

          {/* Processing Time */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="font-serif text-3xl text-neutral-900 mb-6">Processing Time</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                All orders are processed within 1-2 business days. Orders are not shipped or delivered 
                on weekends or holidays.
              </p>
              <p>
                If we are experiencing a high volume of orders, shipments may be delayed by a few days. 
                We will notify you if this occurs.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md">
                <p className="text-amber-900">
                  <span className="font-semibold">Custom Orders:</span> Handcrafted custom items require 
                  additional production time of 2-4 weeks before shipping.
                </p>
              </div>
            </div>
          </section>

          {/* Tracking */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="font-serif text-3xl text-neutral-900 mb-6">Order Tracking</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                Once your order has shipped, you will receive a confirmation email with a tracking number. 
                You can use this number to track your package on the carrier's website.
              </p>
              <p>
                You can also track your order by logging into your account and visiting the 
                <a href="/orders" className="text-neutral-900 underline hover:text-neutral-700 ml-1">
                  Order History
                </a> page.
              </p>
            </div>
          </section>

          {/* Packaging */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="font-serif text-3xl text-neutral-900 mb-6">Packaging & Insurance</h2>
            <div className="space-y-4 text-neutral-600">
              <p>
                Every item is carefully packaged to ensure it arrives in perfect condition. We use 
                eco-friendly packaging materials whenever possible.
              </p>
              <p>
                All shipments are fully insured during transit. If your item arrives damaged, please 
                contact us immediately with photos, and we'll arrange a replacement or refund.
              </p>
            </div>
          </section>

          {/* Delivery Issues */}
          <section className="border-t border-neutral-200 pt-8">
            <h2 className="font-serif text-3xl text-neutral-900 mb-6">Delivery Issues</h2>
            <div className="space-y-4 text-neutral-600">
              <p className="font-semibold text-neutral-900">Lost or Stolen Packages:</p>
              <p>
                If your tracking shows delivered but you haven't received your package, please check 
                with neighbors or building management. If you still can't locate it, contact us within 
                48 hours and we'll file a claim with the carrier.
              </p>
              <p className="font-semibold text-neutral-900 mt-4">Wrong Address:</p>
              <p>
                Please double-check your shipping address before completing your order. We cannot be 
                held responsible for packages shipped to incorrect addresses provided at checkout.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="border-t border-neutral-200 pt-8">
            <div className="bg-neutral-900 text-white rounded-lg p-6 text-center">
              <h3 className="font-serif text-2xl mb-4">Questions About Shipping?</h3>
              <p className="text-neutral-300 mb-6">
                Our customer support team is here to help with any shipping-related inquiries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-block bg-white text-neutral-900 px-6 py-3 rounded-md font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="/faq"
                  className="inline-block bg-neutral-800 text-white px-6 py-3 rounded-md font-semibold hover:bg-neutral-700 transition-colors"
                >
                  View FAQ
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
