import type { MeasureType, ObjectInstance } from "./objectLayer";

// Config
const APP_SIGNATURE = 'neeghboorhoods';
const DEFAULT_OBJECT_TYPE = 'object_1'; 

interface GeoJsonFeature {
    type: 'Feature';
    geometry: {
        type: 'Point';
        coordinates: number[];
    };
    properties: Record<string, unknown>; 
}

interface RawObjectData {
    id?: string;
    objectType?: string;
    position?: number[];
    scale?: number;
    height?: number;
    radius?: number;
    geometry?: string;
}

// Export Logic
export function generateExportString(objects: ObjectInstance[], format: 'geojson' | 'json'): { data: string, filename: string } {
    const dateStr = new Date().toISOString().slice(0, 10);
    
    if (format === 'geojson') {
        const geojson = {
            type: 'FeatureCollection',
            __app_signature: APP_SIGNATURE,
            features: objects.map(obj => ({
                type: "Feature",
                geometry: { type: "Point", coordinates: obj.position },
                properties: { ...obj }
            }))
        };
        return { 
            data: JSON.stringify(geojson, null, 2), 
            filename: `neighborhood_${dateStr}.geojson` 
        };
    } else {
        const raw = {
            __app_signature: APP_SIGNATURE,
            data: objects
        };
        return { 
            data: JSON.stringify(raw, null, 2), 
            filename: `neighborhood_raw_${dateStr}.json` 
        };
    }
}

// Import Logic 
export async function parseImportFile(file: File, objectTypes: MeasureType[]): Promise<ObjectInstance[]> {
    const text = await file.text();
    const json = JSON.parse(text);

    let candidates: Partial<ObjectInstance>[] = [];

    // Detect format
    if (json.type === 'FeatureCollection' && Array.isArray(json.features)) {
        candidates = json.features.map((f: GeoJsonFeature) => ({
            ...(f.properties as RawObjectData), 
            position: f.geometry.coordinates as [number, number, number]
        }));
    } else if (Array.isArray(json.data)) {
        candidates = json.data;
    } else {
        throw new Error("Unknown file format");
    }

    // Config Map for scaling
    const configMap = objectTypes.reduce((acc, t) => {
        acc[t.name] = { scale: t.scale };
        return acc;
    }, {} as Record<string, { scale: number }>);

    // Validate & Normalize
    return candidates.map(item => {
        const type = item.objectType || DEFAULT_OBJECT_TYPE;
        const configScale = configMap[type]?.scale ?? 1;
        
        return {
            id: item.id || `IMP-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            objectType: type,
            position: (item.position?.length === 3) ? item.position : [0, 0, 0],
            scale: item.scale ?? configScale,
            height: item.height,
            radius: item.radius,
            geometry: item.geometry
        };
    });
}