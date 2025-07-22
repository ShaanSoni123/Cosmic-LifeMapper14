import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';
import { PlanetGrid } from './PlanetGrid';

interface SimplePlanetListProps {
  onPlanetSelect: (planetName: string) => void;
}

export const SimplePlanetList: React.FC<SimplePlanetListProps> = ({ onPlanetSelect }) => {
  const handlePlanetSelect = (planetName: string) => {
    onPlanetSelect(planetName);
  };

  return (
    <div>
      <PlanetGrid onPlanetSelect={handlePlanetSelect} />
    </div>
  );
};