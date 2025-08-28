export interface StarfieldProps {
  /**
   * Number of stars to render in the starfield
   * @default 100
   */
  starCount?: number;
  
  /**
   * Color of the stars in hex format
   * @default '#ffffff'
   */
  starColor?: string;
  
  /**
   * Background color of the canvas
   * @default 'transparent'
   */
  backgroundColor?: string;
  
  /**
   * Minimum size of stars in pixels
   * @default 1
   */
  minStarSize?: number;
  
  /**
   * Maximum size of stars in pixels
   * @default 3
   */
  maxStarSize?: number;
  
  /**
   * Speed of the twinkling animation (opacity change)
   * @default 0.005
   */
  twinkleSpeed?: number;
  
  /**
   * Sensitivity distance for mouse interaction in pixels
   * @default 100
   */
  sensitivity?: number;
  
  /**
   * Additional CSS class names to apply to the canvas
   */
  className?: string;
}

export interface Star {
  /**
   * X position of the star
   */
  x: number;
  
  /**
   * Y position of the star
   */
  y: number;
  
  /**
   * Current size of the star
   */
  size: number;
  
  /**
   * Original size of the star (before mouse interaction)
   */
  originalSize: number;
  
  /**
   * Movement speed of the star
   */
  speed: number;
  
  /**
   * Angle of movement for the star
   */
  angle: number;
  
  /**
   * Distance parameter for star movement
   */
  distance: number;
  
  /**
   * Current opacity of the star
   */
  opacity: number;
  
  /**
   * Direction of twinkling (-1 or 1)
   */
  twinkleDirection: number;
}