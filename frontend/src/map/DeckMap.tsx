import DeckGL from '@deck.gl/react';
import {MapView} from '@deck.gl/core';
import type {Layer, PickingInfo} from '@deck.gl/core';

type Props = {
  layers: Layer[];
  onMapClick?: (info: PickingInfo) => void;
  initialViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch?: number;
    bearing?: number;
  };
};

export default function DeckMap({layers, initialViewState, onMapClick }: Props) {
  return (
    <div onContextMenu={evt => evt.preventDefault()} style={{position: 'absolute', inset: 0}}>
      <DeckGL
        views={new MapView({id: 'main'})}
        controller={true}
        layers={layers}
        initialViewState={initialViewState}
        onClick={onMapClick}
        getCursor={({ isDragging }) => (isDragging ? "grabbing" : "default")}
      />
      <div
        style={{
          position: 'absolute',
          right: 8,
          bottom: 8,
          background: 'rgba(255,255,255,0.8)',
          padding: '2px 6px',
          borderRadius: 6,
          fontSize: 12
        }}
      >
        © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors
      </div>
    </div>
  );
}
