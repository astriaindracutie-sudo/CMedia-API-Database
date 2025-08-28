import React from 'react';
import Starfield from './Starfield';
import './Starfield.css';

const StarfieldExample: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* Basic starfield with default settings */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '50%', height: '50%' }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Default Starfield</h3>
        <Starfield />
      </div>
      
      {/* Customized starfield with more stars and different colors */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '50%' }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Custom Starfield</h3>
        <Starfield 
          starCount={200}
          starColor="#ffcc00"
          minStarSize={1}
          maxStarSize={4}
          twinkleSpeed={0.01}
          sensitivity={150}
        />
      </div>
      
      {/* Starfield with blue stars */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '50%' }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Blue Starfield</h3>
        <Starfield 
          starCount={150}
          starColor="#00aaff"
          minStarSize={2}
          maxStarSize={5}
          twinkleSpeed={0.008}
          sensitivity={120}
        />
      </div>
      
      {/* Starfield with purple stars */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '50%' }}>
        <h3 style={{ color: 'white', textAlign: 'center', margin: '10px 0' }}>Purple Starfield</h3>
        <Starfield 
          starCount={120}
          starColor="#cc00ff"
          minStarSize={1}
          maxStarSize={3}
          twinkleSpeed={0.015}
          sensitivity={180}
        />
      </div>
    </div>
  );
};

export default StarfieldExample;