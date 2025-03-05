import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedStepProps {
  children: ReactNode;
  isActive: boolean;
  direction?: 'forward' | 'backward'; // The direction of the animation
  className?: string;
}

export const AnimatedStep: React.FC<AnimatedStepProps> = ({
  children,
  isActive,
  direction = 'forward',
  className = '',
}) => {
  // Define animation variants based on direction
  const variants = {
    enter: {
      x: direction === 'forward' ? 100 : -100,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'forward' ? -100 : 100,
      opacity: 0,
    },
  };

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={`animated-step-${isActive}`}
          initial="enter"
          animate="center"
          exit="exit"
          variants={variants}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 