"use client";

import { useState } from "react";

const faqs = [
  {
    category: "Orders & Payment",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Bank Transfer, EcoCash, OneMoney, and InnBucks. After placing your order, you'll receive payment instructions with our account details. Simply make the payment and upload proof of payment to confirm your order."
      },
      {
        q: "How do I track my order?",
        a: "Once we confirm your payment, we'll begin processing your order. You'll receive email updates at each stage. You can also check your order status on the payment confirmation page using your order reference number."
      },
      {
        q: "Can I modify or cancel my order?",
        a: "You can modify or cancel your order before making payment. Once you've paid and uploaded proof of payment, please contact us immediately. We'll do our best to accommodate changes if your order hasn't been processed yet."
      },
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "What are your shipping options?",
        a: "We offer Standard (5-7 business days) and Express (2-3 business days) shipping within Zimbabwe. Delivery times and costs vary by location. International shipping is available to select countries - contact us for rates and delivery times."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we can arrange international shipping to select countries. Delivery times and costs vary significantly by destination. Contact us with your location for a shipping quote. International orders may be subject to customs duties and taxes."
      },
      {
        q: "What is your shipping policy?",
        a: "Shipping costs are calculated based on your location and order size. We offer free delivery in select areas of Harare for orders over $100. All items are carefully packaged to ensure safe delivery. For more details, visit our Shipping Info page."
      },
    ]
  },
  {
    category: "Products",
    questions: [
      {
        q: "Are all products handmade?",
        a: "Yes, every item in our collection is handcrafted by skilled artisans. Each piece is unique and may have slight variations that add to its character and authenticity."
      },
      {
        q: "Do you offer customization?",
        a: "Custom orders may be available for certain products. Contact us with your specific requirements and we'll check with our artisans. Please note that custom items require additional time (2-4 weeks) and may have different pricing."
      },
      {
        q: "How do I care for my artisan products?",
        a: "Each product page includes specific care instructions. Generally, handle with care, avoid harsh chemicals or excessive moisture, and store properly when not in use. Contact us if you need specific care advice for your item."
      },
    ]
  },
  {
    category: "Returns & Exchanges",
    questions: [
      {
        q: "What is your return policy?",
        a: "Due to the handcrafted nature of our products, we carefully inspect each item before shipping. If you receive a damaged or defective item, contact us within 48 hours with photos and we'll arrange a replacement or refund. Custom items are non-returnable."
      },
      {
        q: "How do I report a problem with my order?",
        a: "Contact us immediately at shawnmutogo5@gmail.com or +263 78 830 2692 with your order number and photos of the issue. We'll review your case and provide a solution within 24 hours."
      },
      {
        q: "How long do refunds take?",
        a: "Approved refunds are processed within 3-5 business days. For EcoCash/OneMoney refunds, the money is returned instantly. For bank transfers, allow 1-3 business days for the refund to reflect in your account."
      },
    ]
  },
  {
    category: "Account & Security",
    questions: [
      {
        q: "Do I need an account to order?",
        a: "Yes, you need to create an account to place orders. This allows you to track your orders, view order history, and manage your purchases. Registration is quick and free - just click 'Sign Up' to get started."
      },
      {
        q: "Is my payment information secure?",
        a: "Yes. We use secure SSL encryption for all data transmission. Since we use bank transfer and mobile money, you make payments directly through your bank or mobile money provider - we never handle or store your payment credentials."
      },
      {
        q: "How do I verify my payment was received?",
        a: "After uploading your proof of payment, we'll review and confirm it within 24 hours. You'll receive an email confirmation once your payment is verified. You can also contact us directly to check your payment status."
      },
    ]
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-neutral-600 text-lg">
            Find answers to common questions about shopping with Artisan Lux.
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-neutral-900 text-white px-6 py-4">
                <h2 className="font-serif text-2xl">{category.category}</h2>
              </div>
              <div className="divide-y divide-neutral-200">
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openIndex === key;

                  return (
                    <div key={questionIndex}>
                      <button
                        onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-neutral-50 transition-colors"
                      >
                        <span className="font-semibold text-neutral-900 pr-4">{item.q}</span>
                        <span className="text-neutral-600 flex-shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4 text-neutral-600">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-neutral-900 text-white rounded-lg p-8 text-center">
          <h3 className="font-serif text-2xl mb-4">Still Have Questions?</h3>
          <p className="text-neutral-300 mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-neutral-900 px-8 py-3 rounded-md font-semibold hover:bg-neutral-100 transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
