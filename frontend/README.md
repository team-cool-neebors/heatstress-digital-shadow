## Frontend Architecture

The frontend uses a **feature-based structure**.  
Each map capability (buildings, trees, WMS overlay, etc.) lives in its own folder under `src/features/`.  
A single hook (`useDeckLayers`) composes all features into Deck.gl layers.

### Structure

```
src/
  App.tsx
  map/
    DeckMap.tsx               # Renders DeckGL map (dumb component)
    hooks/
      useDeckLayers.ts        # Combines all feature layers
    utils/
      deckUtils.ts            # Shared map helpers

  features/
    base-map/
      lib/
        osmLayer.ts           # OSM tile layer

    buildings-3d/
      useBuildingLayer.ts
      lib/
        buildingsLayer.ts
        crs.ts
        bbox.ts

    wms-overlay/
      useWMSLayers.ts
      lib/
        wmsLayer.ts
        qgisFeatureInfo.ts
        qgisLayers.ts

    trees/
      useStaticTreesLayer.ts  # trees from dataset
      useUserTreesLayer.ts    # user-placed trees
      lib/
        treeLayer.ts
```

### Principles

- **Each domain feature has its own folder**  
  (`buildings-3d`, `trees`, `wms-overlay`, `base-map`).

- **Hooks = feature API**  
  Each feature exposes a hook that returns:
  - a Deck.gl `Layer` (or `null`),
  - optional `error`,
  - optional handlers (e.g. `handleInteraction`, `saveTrees`, etc.).

- **Layer factories live in `lib/` and contain no React code**

- **`useDeckLayers` only composes features**  
  It calls feature hooks and builds the final `layers[]` array.

- **`DeckMap` stays dumb**  
  It only receives:
  - `layers`
  - `initialViewState`
  - `onMapInteraction`

- **UI (Menu, buttons, toggles) does not contain map logic**  
  It only updates state via props.

### Adding a new feature (example)

1. Create a folder:  
   `src/features/<name>/`

2. Add a hook:  
   `use<Name>Layer.ts`

3. Put Deck.gl layer logic in:  
   `lib/<name>Layer.ts`

4. Import the hook in `useDeckLayers` and add its layer to the list.

This keeps the frontend modular, predictable, and easy to extend.
