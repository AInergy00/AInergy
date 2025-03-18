'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/70 bg-clip-text [mask-image:linear-gradient(180deg,#000_0%,rgba(0,0,0,0.8)_100%)] dark:[mask-image:linear-gradient(180deg,#fff_0%,rgba(255,255,255,0.8)_100%)]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && (
          <motion.div 
            className="flex-shrink-0 flex items-center space-x-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
          >
            {actions}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 