import {BitmapLayer} from '@deck.gl/layers';
import type {Layer} from '@deck.gl/core';

export type LonLatBBox = [west: number, south: number, east: number, north: number];

type MakeOpts = {
  id?: string;
  baseUrl: string;
  layerName: string;
  bounds: LonLatBBox;
  width?: number;
  height?: number;
  style?: string;
  format?: 'image/png' | 'image/jpeg';
  transparent?: boolean;
  opacity?: number;
};

function buildGetMapUrl({
  baseUrl,
  layerName,
  bounds,
  width = 2048,
  height = 2048,
  style = 'default',
  format = 'image/png',
  transparent = true
}: MakeOpts) {
  const [west, south, east, north] = bounds;
  const bboxParam = `${south},${west},${north},${east}`;

  const p = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetMap',
    LAYERS: layerName,
    STYLES: style,
    FORMAT: format,
    TRANSPARENT: transparent ? 'TRUE' : 'FALSE',
    CRS: 'EPSG:4326',
    BBOX: bboxParam,
    WIDTH: String(width),
    HEIGHT: String(height)
  });

  return `${baseUrl}${baseUrl.endsWith('?') ? '' : '?'}${p.toString()}`;
}

export function makeWmsLayer(opts: MakeOpts): Layer {
  const url = buildGetMapUrl(opts);
  return new BitmapLayer({
    id: opts.id ?? 'wms-bitmap-4326',
    image: url,
    bounds: opts.bounds,
    opacity: opts.opacity ?? 1
  });
}

export function buildGetFeatureInfoUrl({
  baseUrl,
  layerName,
  bounds,
  width,
  height,
  coord,
  style = 'default',
  infoFormat = 'application/json'
}: {
  baseUrl: string;
  layerName: string;
  bounds: LonLatBBox;
  width: number;
  height: number;
  coord: [number, number];
  style?: string;
  infoFormat?: string;
}) {
  const [west, south, east, north] = bounds;
  const [lon, lat] = coord;

  const bboxParam = `${south},${west},${north},${east}`;

  const xFrac = (lon - west) / (east - west);
  const yFrac = (north - lat) / (north - south);
  const I = Math.round(xFrac * width);
  const J = Math.round(yFrac * height);

  const p = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetFeatureInfo',
    LAYERS: layerName,
    QUERY_LAYERS: layerName,
    STYLES: style,
    CRS: 'EPSG:4326',
    BBOX: bboxParam,
    WIDTH: String(width),
    HEIGHT: String(height),
    I: String(I),
    J: String(J),
    INFO_FORMAT: infoFormat,
    FEATURE_COUNT: '1'
  });

  return `${baseUrl}${baseUrl.endsWith('?') ? '' : '?'}${p.toString()}`;
}