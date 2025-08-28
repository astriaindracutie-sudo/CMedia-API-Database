import React, { useEffect, useRef } from 'react';
import './Starfield.css';

interface Star {
  x: number;
  y: number;
  size: number;
  originalSize: number;
  speed: number;
  angle: number;
  distance: number;
  opacity: number;
  twinkleDirection: number;
}

interface StarfieldProps {
  starCount?: number;
  starColor?: string;
  backgroundColor?: string;
  minStarSize?: number;
  maxStarSize?: number;
  twinkleSpeed?: number;
  sensitivity?: number;
  className?: string;
}

const Starfield: React.FC<StarfieldProps> = ({
  starCount = 100,
  starColor = '#ffffff',
  backgroundColor = 'transparent',
  minStarSize = 1,
  maxStarSize = 3,
  twinkleSpeed = 0.005,
  sensitivity = 100,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mousePositionRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number>(0);

  // Initialize stars
  const initializeStars = (width: number, height: number) => {
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * (maxStarSize - minStarSize) + minStarSize,
        originalSize: Math.random() * (maxStarSize - minStarSize) + minStarSize,
        speed: Math.random() * 0.05 + 0.01,
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * 50 + 10,
        opacity: Math.random() * 0.5 + 0.5,
        twinkleDirection: Math.random() > 0.5 ? 1 : -1,
      });
    }
    starsRef.current = stars;
  };

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    mousePositionRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Handle mouse leaving canvas
  const handleMouseLeave = () => {
    mousePositionRef.current = { x: -1000, y: -1000 };
  };

  // Update star positions and properties
  const updateStars = (width: number, height: number) => {
    const stars = starsRef.current;
    const mousePos = mousePositionRef.current;
    
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      
      // Update twinkling effect
      star.opacity += star.twinkleDirection * twinkleSpeed;
      if (star.opacity >= 1 || star.opacity <= 0.5) {
        star.twinkleDirection *= -1;
      }
      
      // Check if mouse is near the star
      const dx = star.x - mousePos.x;
      const dy = star.y - mousePos.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < sensitivity) {
        // Mouse is near - make star twinkle more and change size
        const influence = 1 - Math.min(distance / sensitivity, 1);
        star.size = star.originalSize * (1 + influence * 2);
      } else {
        // Gradually return to original size
        if (star.size > star.originalSize) {
          star.size -= 0.1;
          if (star.size < star.originalSize) star.size = star.originalSize;
        } else if (star.size < star.originalSize) {
          star.size += 0.1;
          if (star.size > star.originalSize) star.size = star.originalSize;
        }
      }
      
      // Move stars slightly for a calming effect
      star.x += Math.sin(star.angle) * star.speed;
      star.y += Math.cos(star.angle) * star.speed;
      
      // Reset stars that go off-screen
      if (star.x > width + 50) star.x = -50;
      if (star.x < -50) star.x = width + 50;
      if (star.y > height + 50) star.y = -50;
      if (star.y < -50) star.y = height + 50;
    }
  };

  // Render stars on canvas
  const renderStars = (ctx: CanvasRenderingContext2D) => {
    const stars = starsRef.current;
    
    // Clear canvas with transparent background
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw each star
    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `${starColor}${Math.floor(star.opacity * 255).toString(16).padStart(2, '0')}`;
      ctx.fill();
    }
  };

  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    updateStars(canvas.width, canvas.height);
    renderStars(ctx);
    
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Handle canvas resize
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    initializeStars(canvas.width, canvas.height);
  };

  // Setup canvas and event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set initial canvas size
    handleResize();
    
    // Start animation
    animationFrameRef.current = requestAnimationFrame(animate);
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    return () => {
      // Cleanup
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [starCount, minStarSize, maxStarSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`starfield-canvas ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ backgroundColor }}
    />
  );
};

export default Starfield;