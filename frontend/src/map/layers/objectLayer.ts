import { ScenegraphLayer } from '@deck.gl/mesh-layers';
import { GLTFLoader } from '@loaders.gl/gltf';
import type { Layer } from '@deck.gl/core';

// Define the type for the processed data features
export type ObjectFeature = {
    position: [number, number, number]; // [longitude, latitude, elevation]
    scale: number; // The scale factor derived from the tree's height (in meters)
};

// Define the common scale multiplier for the model
const SCENEGRAPH_SIZE_SCALE = 0.5;

/**
 * Creates a ScenegraphLayer configured for displaying 3D objects (like trees).
 * * @param id Layer ID.
 * @param data Array of TreeFeature objects (WGS84 coordinates).
 * @param modelUrl URL to the GLB/GLTF model.
 * @returns A configured ScenegraphLayer.
 */
export function makeScenegraphLayerForObjects(
    id: string,
    data: ObjectFeature[],
    modelUrl: string
): Layer {
    return new ScenegraphLayer<ObjectFeature>({
        id: id,
        data,
        scenegraph: modelUrl,
        loaders: [GLTFLoader],

        // General visual properties
        sizeScale: SCENEGRAPH_SIZE_SCALE,
        _lighting: 'pbr',
        pickable: true,

        // Accessors matching the TreeFeature type
        getPosition: d => d.position,
        getScale: d => [d.scale, d.scale, d.scale],
        getOrientation: [0, 0, 90],

        updateTriggers: {
            // Redraw if data length changes (new features loaded)
            getScale: [data.length]
        }
    });
}
