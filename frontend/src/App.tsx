import DeckGL from "@deck.gl/react";
import Map from "react-map-gl/maplibre";
import { GeoJsonLayer } from "@deck.gl/layers";

function App() {

  const INITIAL_VIEW_STATE = {
    longitude: 5.1214, // roughly center of NL
    latitude: 52.0907,
    zoom: 12,
    pitch: 60,
    bearing: -20,
  };

  const buildingsUrl = "https://api.3dbag.nl/collections/pand/items/NL.IMBAG.Pand.1655100000500568";

const layers = [
  new GeoJsonLayer({
    id: "buildings",
    data: buildingsUrl,
    extruded: true,
    getFillColor: [200, 200, 200],
    getElevation: (f) => f.properties.height || 10,
  }),
];

  return (
    <>
      <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}>
  <Map
    mapLib={import("maplibre-gl")}
    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  />
</DeckGL>
    </>
  )
}

export default App
