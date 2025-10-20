import React, { useRef, useState } from "react"
// import { Source, Layer, Popup } from "react-map-gl/maplibre"
import { Map, Source, Layer, Popup } from "react-map-gl/maplibre"
import NavBar from "./Shared/NavBar"
import "maplibre-gl/dist/maplibre-gl.css"
// import ControlPanel from "./control-panel"
import {
  clusterLayer,
  clusterCountLayer,
  unclusteredPointLayer,
} from "./Layers"

export default function MapPage() {
  const mapRef = useRef(null)
  // const [viewState, setViewState] = useState({
  //   longitude: -122.4,
  //   latitude: 37.8,
  //   zoom: 14,
  // })

  const onClick = async (event) => {
    const feature = event.features[0]
    if (!feature) {
      return
    }
    const clusterId = feature.properties.cluster_id

    const geojsonSource = mapRef.current.getSource("earthquakes")

    const zoom = await geojsonSource.getClusterExpansionZoom(clusterId)

    mapRef.current.easeTo({
      center: feature.geometry.coordinates,
      zoom,
      duration: 500,
    })
  }
  return (
    <div className="w-screen h-screen">
      <NavBar />
      {/* <div className="border-1">
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://demotiles.maplibre.org/style.json"
        />
      </div> */}
      <Map
        initialViewState={{
          latitude: 25,
          longitude: 150,
          zoom: 1.2,
        }}
        // mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        mapStyle="https://api.maptiler.com/maps/dataviz/style.json?key=0bsarBRVUOINHDtiYsY0"
        // interactiveLayerIds={[clusterLayer.id]}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        // onClick={onClick}
        ref={mapRef}>
        <Source
          id="earthquakes"
          type="geojson"
          data="https://maplibre.org/maplibre-gl-js/docs/assets/earthquakes.geojson"
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}>
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>
      </Map>
      {/* <ControlPanel /> */}
    </div>
  )
}
