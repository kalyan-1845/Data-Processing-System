import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useVelocity, useTransform } from 'framer-motion';
import { cn } from '@/utils/cn';

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Smooth mouse tracking with spring physics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Dynamic rotation based on velocity (tilting the pencil as it moves)
  const xVelocity = useVelocity(mouseX);
  const tilt = useTransform(xVelocity, [-1000, 1000], [-15, 15]);
  const rotation = useTransform(tilt, (v) => v - 45); // Base rotation is -45

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('input') || 
        target.closest('textarea') || 
        target.closest('select') ||
        window.getComputedStyle(target).cursor === 'pointer';
        
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', moveMouse);
    window.addEventListener('mouseover', handleHover);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    return () => {
      window.removeEventListener('mousemove', moveMouse);
      window.removeEventListener('mouseover', handleHover);
      document.body.style.cursor = 'auto';
    };
  }, [mouseX, mouseY, isVisible]);

  // Don't show on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{
        x: cursorX,
        y: cursorY,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isHovering ? -15 : 0, // This is relative to the base rotation
          scale: isHovering ? 1.2 : 1,
          x: -4,
          y: -24,
        }}
        style={{ rotate: rotation }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="relative"
      >
        {/* The Pencil SVG */}
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "drop-shadow-[0_2px_8px_rgba(var(--accent),0.5)] transition-colors duration-300",
            isHovering ? "text-accent" : "text-slate-400 dark:text-white"
          )}
        >
          {/* Pencil Body */}
          <path 
            d="M13.5 6.5L17.5 10.5M5 19L5 15L15.3 4.7C15.9 4.1 16.9 4.1 17.5 4.7L19.3 6.5C19.9 7.1 19.9 8.1 19.3 8.7L9 19H5Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Tip highlight */}
          <path 
            d="M5 15L9 19M5 15L5 19H9" 
            fill="currentColor" 
            className="opacity-40" 
          />
          {/* Neural Glow Core */}
          <circle 
            cx="5" 
            cy="19" 
            r="1.5" 
            fill="rgb(var(--accent))" 
            className={cn(
              "animate-pulse",
              isHovering ? "opacity-100" : "opacity-0"
            )}
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
