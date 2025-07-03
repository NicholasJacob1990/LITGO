import React from 'react';
import GoogleMap from './GoogleMap';
// import MapboxMap from './MapboxMap'; // Futuro, se desejar alternância

interface MapComponentProps {
  lawyers: any[];
  center: { latitude: number; longitude: number };
  selectedLawyer?: any;
  onLawyerSelect: (lawyer: any) => void;
  onLawyerPress: (lawyer: any) => void;
}

export function MapComponent(props: MapComponentProps) {
  // Alternância futura: process.env.EXPO_PUBLIC_MAP_PROVIDER === 'mapbox'
  return <GoogleMap {...props} />;
} 