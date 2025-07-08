import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

export default function LandingPricingCard({ plan, delay = 0 }) {
  return (
    <motion.div
      className={`rounded-lg shadow-lg overflow-hidden ${
        plan.highlighted 
          ? 'border-2 border-[#FF0000] bg-gradient-to-b from-red-50 to-white relative' 
          : 'border border-gray-200 bg-white'
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
    >
      {plan.highlighted && (
        <div className="absolute top-0 inset-x-0 px-4 py-1 bg-[#FF0000] text-white text-xs font-bold uppercase tracking-wider text-center">
          Most Popular
        </div>
      )}
      
      <div className={`px-6 py-8 ${plan.highlighted ? 'pt-10' : ''}`}>
        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
          <span className="ml-1 text-xl font-medium text-gray-500">/{plan.period}</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
        
        <ul className="mt-6 space-y-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <SafeIcon 
                  icon={FiIcons.FiCheck} 
                  className={`h-5 w-5 ${plan.highlighted ? 'text-[#FF0000]' : 'text-green-500'}`} 
                />
              </div>
              <p className="ml-3 text-sm text-gray-700">{feature}</p>
            </li>
          ))}
        </ul>
        
        <div className="mt-8">
          <Link
            to={plan.buttonLink}
            className={`w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md ${
              plan.highlighted 
                ? 'bg-gradient-to-r from-[#FF0000] to-[#FF5C36] text-white hover:from-[#FF0000] hover:to-[#FF7C56] shadow-md'
                : 'bg-white text-[#FF0000] border-[#FF0000] hover:bg-red-50'
            }`}
          >
            {plan.buttonText}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}