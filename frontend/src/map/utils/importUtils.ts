import type { TreeInstance } from "../../features/trees/lib/treeLayer";

// Defining a generic interface for type definition so it will be compatitable for when we get objects from the db
export interface ObjectConfig {
    [key: string]: {
        url?: string;
        scale?: number;
    }
}

export interface GeoJsonProperties {
    id?: string;
    objectType?: string;
    scale?: number;
    [key: string]: string | number | undefined; 
}

export interface GeoJsonFeature {
    type: "Feature";
    geometry: {
        type: "Point";
        coordinates: [number, number]; 
    };
    properties: GeoJsonProperties;
}

// The expected shape of the file content after JSON.parse()
export interface ImportContent {
    __app_signature?: string;
    type?: string; 
    features?: GeoJsonFeature[]; 
    data?: RawImportItem[]; 
    [key: string]: unknown; 
}

// The structure of a raw object extracted from the file (Plain JSON or GeoJSON mapped)
export interface RawImportItem {
    id?: string;
    objectType?: string;
    position?: [number, number]; 
    scale?: number;
    [key: string]: unknown; 
}

export const parseImportedData = (
    jsonContent: ImportContent, 
    availableTypes: ObjectConfig, 
    defaultType: string          
) => {

    // Define the unique signature we use to validate a file is our own before we import
    const APP_SIGNATURE = 'neeghboorhoods';

    // Check for the signature immediately
    if (jsonContent.__app_signature !== APP_SIGNATURE) {
        throw new Error("Invalid file signature. Only files exported from this application can be imported.");
    }

    // Create a Set of keys for fast lookup
    const validTypeKeys = Object.keys(availableTypes);

    // Dynamic Sanitizer
    const sanitizeType = (type: string): string => {
        return validTypeKeys.includes(type) ? type : defaultType;
    };

    // Dynamic Scale Lookup
    const getScale = (instanceScale: number | undefined, type: string): number => {
        if (typeof instanceScale === 'number') return instanceScale;
        return availableTypes[type]?.scale || 1; 
    };

    let rawList: RawImportItem[] = [];

    // Detect GeoJSON or Plain JSON
    if (jsonContent.type === 'FeatureCollection' && Array.isArray(jsonContent.features)) {
        rawList = jsonContent.features.map((f: GeoJsonFeature): RawImportItem => ({ 
            id: f.properties?.id,
            objectType: f.properties?.objectType,
            position: f.geometry?.coordinates,
            scale: f.properties?.scale
        }));
    // Check for Plain JSON payload nested under 'data'
    } else if (jsonContent.data && Array.isArray(jsonContent.data)) { 
        rawList = jsonContent.data.map((item: RawImportItem): RawImportItem => ({ 
            id: item.id,
            objectType: item.objectType,
            position: item.position,
            scale: item.scale
        }));
    } else {
        throw new Error("Unsupported file format or corrupt signed file structure.");
    }

    // Normalize and Return
   return rawList.map((item: RawImportItem) => {
    
        const incomingType = item.objectType ?? defaultType; 
        
        const finalType = sanitizeType(incomingType); 
        
        // Ensure position is valid (fallback to [0, 0] if missing coordinates)
        const position: [number, number] = (item.position && item.position.length === 2) ? item.position : [0, 0];
    
        return {
            id: item.id || crypto.randomUUID(),
            objectType: finalType,
            position: position, // Use the validated position
            scale: getScale(item.scale, finalType),
        } as TreeInstance;
    });
};