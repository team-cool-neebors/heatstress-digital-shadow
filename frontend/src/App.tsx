import React from 'react';
import DeckMap from './map/DeckMap';
import {makeOsmTileLayer} from './map/layers/osmLayer';
import type {Layer} from '@deck.gl/core';

export default function App() {
  const osmBase = React.useMemo<Layer>(() => makeOsmTileLayer(), []);

  return (
    <DeckMap
      layers={[osmBase]}
      initialViewState={{
        longitude: 3.613,
        latitude: 51.5,
        zoom: 14,
        pitch: 45,
        bearing: 0
      }}
    />
  );
}
