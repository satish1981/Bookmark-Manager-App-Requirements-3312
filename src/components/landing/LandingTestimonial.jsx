import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function LandingTestimonial({ testimonial, delay = 0 }) {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <SafeIcon icon={FiIcons.FiMessageCircle} className="h-8 w-8 text-gray-200 absolute right-6 top-6" />
      <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
      <div className="flex items-center">
        <img 
          src={testimonial.avatar} 
          alt={testimonial.name} 
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <h4 className="text-sm font-semibold text-gray-900">{testimonial.name}</h4>
          <p className="text-xs text-gray-500">{testimonial.title}</p>
        </div>
      </div>
    </motion.div>
  );
}