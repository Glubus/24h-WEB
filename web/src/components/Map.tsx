import { useEffect, useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { DivIcon } from 'leaflet'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { LatLngBoundsExpression, LatLngExpression } from 'leaflet'
import 'leaflet/dist/leaflet.css'

export type MapCoordinate = {
  id?: string | number
  lat?: number | string | null
  lng?: number | string | null
  latitude?: number | string | null
  longitude?: number | string | null
  label?: ReactNode
}

export type MapProps = {
  coordinates: MapCoordinate[]
  className?: string
  style?: CSSProperties
  height?: CSSProperties['height']
  width?: CSSProperties['width']
  singlePointZoom?: number
  areaRadiusMeters?: number
  areaColor?: string
  emptyCenter?: LatLngExpression
  emptyZoom?: number
}

type NormalizedCoordinate = {
  id: string | number
  position: LatLngExpression
  label?: ReactNode
}

export function Map({
  coordinates,
  className,
  style,
  height = 360,
  width = '100%',
  singlePointZoom = 13,
  areaRadiusMeters = 3000,
  areaColor = '#2563eb',
  emptyCenter = [46.603354, 1.888334],
  emptyZoom = 6,
}: MapProps) {
  const points = useMemo(() => normalizeCoordinates(coordinates), [coordinates])
  const markerIcon = useMemo(() => createMarkerIcon(), [])
  const center = points[0]?.position ?? emptyCenter
  const totalLabel = `${points.length} point${points.length > 1 ? 's' : ''}`

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        minHeight: 240,
        height,
        width,
        ...style,
      }}
    >
      <MapContainer
        center={center}
        zoom={points.length === 1 ? singlePointZoom : emptyZoom}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <MapAutoResize />
        <MapViewport
          emptyCenter={emptyCenter}
          emptyZoom={emptyZoom}
          points={points}
          singlePointZoom={singlePointZoom}
        />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length === 1 ? (
          <Circle
            center={points[0].position}
            color={areaColor}
            fillColor={areaColor}
            fillOpacity={0.12}
            radius={areaRadiusMeters}
            weight={2}
          />
        ) : null}
        {points.map((point) => (
          <Marker
            icon={markerIcon}
            key={point.id}
            position={point.position}
          >
            <Tooltip>
              <div>
                {point.label ?? 'Position'}
                <br />
                Total: {points.length}
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      <div
        aria-label={totalLabel}
        className="badge badge-neutral absolute right-3 top-3 z-[1000]"
        title={totalLabel}
      >
        {points.length}
      </div>
    </div>
  )
}

function MapViewport({
  emptyCenter,
  emptyZoom,
  points,
  singlePointZoom,
}: {
  emptyCenter: LatLngExpression
  emptyZoom: number
  points: NormalizedCoordinate[]
  singlePointZoom: number
}) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 0) {
      map.setView(emptyCenter, emptyZoom)
      return
    }

    if (points.length === 1) {
      map.setView(points[0].position, singlePointZoom)
      return
    }

    map.fitBounds(
      points.map((point) => point.position) as LatLngBoundsExpression,
      { padding: [40, 40], maxZoom: 14 },
    )
  }, [emptyCenter, emptyZoom, map, points, singlePointZoom])

  return null
}

function MapAutoResize() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [map])

  return null
}

function normalizeCoordinates(coordinates: MapCoordinate[]) {
  return coordinates.reduce<NormalizedCoordinate[]>((validCoordinates, coordinate, index) => {
    const latitude = parseCoordinate(coordinate.lat ?? coordinate.latitude)
    const longitude = parseCoordinate(coordinate.lng ?? coordinate.longitude)

    if (latitude === null || longitude === null) {
      return validCoordinates
    }

    validCoordinates.push({
      id: coordinate.id ?? `${latitude}:${longitude}:${index}`,
      position: [latitude, longitude],
      label: coordinate.label,
    })

    return validCoordinates
  }, [])
}

function parseCoordinate(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === '') {
    return null
  }

  const coordinate = typeof value === 'number' ? value : Number(value)

  return Number.isFinite(coordinate) ? coordinate : null
}

function createMarkerIcon() {
  return new DivIcon({
    className: 'map-marker',
    html: '<span class="map-marker-pin"><span class="map-marker-dot"></span></span>',
    iconAnchor: [18, 36],
    iconSize: [36, 36],
    popupAnchor: [0, -32],
    tooltipAnchor: [0, -28],
  })
}
