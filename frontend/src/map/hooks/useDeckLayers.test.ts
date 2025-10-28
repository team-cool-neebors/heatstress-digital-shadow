import {renderHook, act, waitFor} from '@testing-library/react';
import type {Layer} from '@deck.gl/core';
import type {Mesh, MeshAttribute} from '@loaders.gl/schema';

jest.mock('../layers/osmLayer', () => ({
  makeOsmTileLayer: jest.fn()
}));
jest.mock('@loaders.gl/core', () => ({
  load: jest.fn()
}));
jest.mock('@loaders.gl/obj', () => ({
  OBJLoader: {name: 'OBJLoader'}
}));
jest.mock('../layers/buildingsLayer', () => ({
  buildObjLayerFromMesh: jest.fn(),
  computeCentroidRD: jest.fn()
}));
jest.mock('../utils/crs', () => ({
  rdToLonLat: jest.fn()
}));

import {useDeckLayers} from './useDeckLayers';
import {makeOsmTileLayer} from '../layers/osmLayer';
import {load} from '@loaders.gl/core';
import {buildObjLayerFromMesh, computeCentroidRD} from '../layers/buildingsLayer';
import {rdToLonLat} from '../utils/crs';

function meshWithPositions(arr: number[]): Mesh {
  const pos = Float32Array.from(arr);
  const POSITION: MeshAttribute = {value: pos, size: 3};
  return {attributes: {POSITION}} as unknown as Mesh;
}

const osmLayerMock: Layer = {id: 'raster-tiles'} as unknown as Layer;

describe('useDeckLayers (Option A: objPath inside hook)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (makeOsmTileLayer as jest.Mock).mockReturnValue(osmLayerMock);
  });

  test('returns only base layer when showBuildings is false', () => {
    const {result} = renderHook(() =>
      useDeckLayers({objPath: 'data/foo.obj', showBuildings: false})
    );
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]).toBe(osmLayerMock);
    expect(result.current.error).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });

  test('returns only base layer when objPath is missing', () => {
    const {result} = renderHook(() =>
      useDeckLayers({showBuildings: true})
    );
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]).toBe(osmLayerMock);
    expect(load).not.toHaveBeenCalled();
  });

  test('loads OBJ and adds buildings layer (single Mesh)', async () => {
    const mesh = meshWithPositions([1, 2, 3, 4, 5, 6]);
    (load as jest.Mock).mockResolvedValue(mesh);
    (computeCentroidRD as jest.Mock).mockReturnValue([10, 20, 0]);
    (rdToLonLat as jest.Mock).mockReturnValue([3.6, 51.5]);
    const buildingsLayer: Layer = {id: 'buildings-obj'} as unknown as Layer;
    (buildObjLayerFromMesh as jest.Mock).mockReturnValue(buildingsLayer);

    const {result} = renderHook(() =>
      useDeckLayers({objPath: 'data/10-72-338-LoD22-3D.obj', showBuildings: true})
    );

    await waitFor(() => expect(result.current.layers).toHaveLength(2));

    // don’t assert the exact URL; just that a string URL was passed and it ends with the path
    expect(load).toHaveBeenCalledWith(
      expect.stringMatching(/data\/10-72-338-LoD22-3D\.obj$/),
      {name: 'OBJLoader'}
    );
    expect(computeCentroidRD).toHaveBeenCalledWith(expect.any(Float32Array));
    expect(rdToLonLat).toHaveBeenCalledWith(10, 20);
    expect(buildObjLayerFromMesh).toHaveBeenCalledWith(
      'buildings-obj',
      mesh,
      [3.6, 51.5],
      expect.objectContaining({
        color: [180, 180, 180, 255],
        zBase: 4.261,
        zLift: 0,
        heightScale: 1
      })
    );

    expect(result.current.layers[0]).toBe(osmLayerMock);
    expect(result.current.layers[1]).toBe(buildingsLayer);
    expect(result.current.error).toBeNull();
  });

  test('loads OBJ and adds buildings layer (array of Mesh)', async () => {
    const meshA = meshWithPositions([0, 0, 0]);
    const meshB = meshWithPositions([1, 1, 1]);
    (load as jest.Mock).mockResolvedValue([meshA, meshB]);
    (computeCentroidRD as jest.Mock).mockReturnValue([0, 0, 0]);
    (rdToLonLat as jest.Mock).mockReturnValue([0.1, 0.2]);
    const buildingsLayer: Layer = {id: 'buildings-obj'} as unknown as Layer;
    (buildObjLayerFromMesh as jest.Mock).mockReturnValue(buildingsLayer);

    const {result} = renderHook(() =>
      useDeckLayers({objPath: 'data/another.obj', showBuildings: true})
    );

    await waitFor(() => expect(result.current.layers).toHaveLength(2));
    expect(load).toHaveBeenCalledWith(expect.any(String), {name: 'OBJLoader'});
    expect(buildObjLayerFromMesh).toHaveBeenCalledWith(
      'buildings-obj',
      meshA,
      [0.1, 0.2],
      expect.any(Object)
    );
  });

  test('sets error and keeps only base layer when load fails', async () => {
    (load as jest.Mock).mockRejectedValue(new Error('boom'));

    const {result} = renderHook(() =>
      useDeckLayers({objPath: 'data/bad.obj', showBuildings: true})
    );

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]).toBe(osmLayerMock);
  });

  test('clears objLayer when showBuildings toggles to false', async () => {
    const mesh = meshWithPositions([1, 2, 3]);
    (load as jest.Mock).mockResolvedValue(mesh);
    (computeCentroidRD as jest.Mock).mockReturnValue([1, 1, 0]);
    (rdToLonLat as jest.Mock).mockReturnValue([1, 1]);
    const buildingsLayer: Layer = {id: 'buildings-obj'} as unknown as Layer;
    (buildObjLayerFromMesh as jest.Mock).mockReturnValue(buildingsLayer);

    const {result, rerender} = renderHook(
      (p: {objPath?: string; showBuildings?: boolean}) => useDeckLayers(p),
      {initialProps: {objPath: 'data/foo.obj', showBuildings: true}}
    );

    await waitFor(() => expect(result.current.layers).toHaveLength(2));
    act(() => rerender({objPath: 'data/foo.obj', showBuildings: false}));
    expect(result.current.layers).toHaveLength(1);
    expect(result.current.layers[0]).toBe(osmLayerMock);
  });
});
