import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import LandingFeatureCard from './LandingFeatureCard';
import LandingHero from './LandingHero';
import LandingTestimonial from './LandingTestimonial';
import LandingPricingCard from './LandingPricingCard';

export default function LandingPage() {
  // Features section data
  const features = [
    {
      id: 1,
      title: 'Smart Organization',
      description: 'Organize bookmarks with nested folders, tags, and smart collections. Find anything in seconds.',
      icon: FiIcons.FiFolder,
      color: 'from-blue-500 to-blue-600',
      delay: 0.1
    },
    {
      id: 2,
      title: 'AI Summaries',
      description: 'Get instant AI-powered summaries of articles, videos, and web pages - save time and extract key insights.',
      icon: FiIcons.FiCpu,
      color: 'from-purple-500 to-purple-600',
      delay: 0.2
    },
    {
      id: 3,
      title: 'Cross-Device Sync',
      description: 'Access your bookmarks from any device or browser. Changes sync instantly across all platforms.',
      icon: FiIcons.FiSmartphone,
      color: 'from-green-500 to-green-600',
      delay: 0.3
    },
    {
      id: 4,
      title: 'Video Bookmarks',
      description: 'Save YouTube videos with automatic metadata extraction. Track watched status and organize by topic.',
      icon: FiIcons.FiYoutube,
      color: 'from-red-500 to-red-600',
      delay: 0.4
    },
    {
      id: 5,
      title: 'Powerful Search',
      description: 'Find any bookmark instantly with full-text search across titles, descriptions, tags, and AI summaries.',
      icon: FiIcons.FiSearch,
      color: 'from-yellow-500 to-yellow-600',
      delay: 0.5
    },
    {
      id: 6,
      title: 'Visual Analytics',
      description: 'Track your bookmarking habits with beautiful visualizations. Discover patterns and improve productivity.',
      icon: FiIcons.FiPieChart,
      color: 'from-indigo-500 to-indigo-600',
      delay: 0.6
    }
  ];

  // Testimonials section data
  const testimonials = [
    {
      id: 1,
      quote: "Bookmarkify has transformed how I organize information. The AI summaries save me hours each week!",
      name: "Alex Johnson",
      title: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 2,
      quote: "The nested categories and drag-and-drop interface make organizing hundreds of bookmarks a breeze.",
      name: "Sarah Chen",
      title: "UX Designer",
      avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
    },
    {
      id: 3,
      quote: "As a researcher, I can finally keep track of all my sources and access AI-powered summaries whenever I need them.",
      name: "Michael Torres",
      title: "Academic Researcher",
      avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=256&q=80"
    }
  ];

  // Pricing plans
  const pricingPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for casual users',
      features: [
        'Up to 100 bookmarks',
        'Basic categorization',
        '5 AI summaries per month',
        'Single device sync',
        'Standard support'
      ],
      buttonText: 'Get Started',
      buttonLink: '/signup',
      highlighted: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For power users and professionals',
      features: [
        'Unlimited bookmarks',
        'Advanced organization',
        '50 AI summaries per month',
        'Multi-device sync',
        'Priority support',
        'Full analytics dashboard',
        'No advertisements'
      ],
      buttonText: 'Try Free for 14 Days',
      buttonLink: '/signup?plan=pro',
      highlighted: true
    },
    {
      id: 'team',
      name: 'Team',
      price: '$19',
      period: 'per month',
      description: 'For teams and organizations',
      features: [
        'Everything in Pro',
        'Team sharing features',
        '100 AI summaries per month',
        'Collaborative collections',
        'Admin dashboard',
        'Team analytics',
        'API access'
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact',
      highlighted: false
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div 
                className="flex-shrink-0 flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SafeIcon 
                  icon={FiIcons.FiBookmark} 
                  className="h-8 w-8 text-[#FF0000]" 
                />
                <span className="ml-2 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF0000] to-[#FF5C36]">
                  Bookmarkify
                </span>
              </motion.div>
              
              <div className="hidden sm:ml-10 sm:flex space-x-8">
                <motion.a 
                  href="#features"
                  className="border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Features
                </motion.a>
                <motion.a 
                  href="#testimonials"
                  className="border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Testimonials
                </motion.a>
                <motion.a 
                  href="#pricing"
                  className="border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  whileHover={{ y: -2 }}
                  whileTap={{ y: 0 }}
                >
                  Pricing
                </motion.a>
              </div>
            </div>
            
            <div className="flex items-center">
              <motion.div
                className="flex space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-gradient-to-r from-[#FF0000] to-[#FF5C36] text-white px-4 py-2 rounded-md text-sm font-medium hover:from-[#FF0000] hover:to-[#FF7C56] shadow-md hover:shadow-lg transition-all duration-300"
                >
                  Sign Up Free
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <LandingHero />

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              All the tools you need to organize your online life
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Bookmarkify brings structure to your digital chaos with powerful features designed for modern web users.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <LandingFeatureCard key={feature.id} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How Bookmarkify Works
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Get organized in minutes with our intuitive workflow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Save Content</h3>
              <p className="text-gray-600">
                Quickly save any webpage, article, or YouTube video with a single click. Our system automatically extracts important metadata.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Organize</h3>
              <p className="text-gray-600">
                Create custom folders, add tags, and use our AI-powered categorization to keep everything neatly structured.
              </p>
            </motion.div>

            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Access & Share</h3>
              <p className="text-gray-600">
                Find your bookmarks instantly with powerful search. Generate AI summaries and share collections with colleagues.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Loved by thousands of users
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Don't just take our word for it - see what our users have to say.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <LandingTestimonial 
                key={testimonial.id} 
                testimonial={testimonial} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Start with our free plan and upgrade as your needs grow
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <LandingPricingCard 
                key={plan.id} 
                plan={plan} 
                delay={index * 0.1} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#FF0000] to-[#FF5C36] relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=80')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-white text-opacity-90">
              Join thousands of users who have already transformed how they organize their online content.
            </p>
            <div className="mt-8 flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  to="/signup" 
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#FF0000] bg-white hover:bg-gray-100 shadow-lg"
                >
                  Sign Up Free
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">What's New</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tutorials</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <SafeIcon icon={FiIcons.FiBookmark} className="h-6 w-6 text-[#FF0000]" />
              <span className="ml-2 text-lg font-bold text-white">Bookmarkify</span>
            </div>
            <p className="mt-4 md:mt-0 text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Bookmarkify. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <SafeIcon icon={FiIcons.FiTwitter} className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <SafeIcon icon={FiIcons.FiFacebook} className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <SafeIcon icon={FiIcons.FiInstagram} className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <SafeIcon icon={FiIcons.FiGithub} className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}