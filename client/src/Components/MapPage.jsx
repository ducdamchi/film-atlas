import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react"
import { Map, Source, Layer, Popup } from "react-map-gl/maplibre"
import axios from "axios"
import { csv } from "d3-fetch"
import * as maptilersdk from "@maptiler/sdk"
import "@maptiler/sdk/dist/maptiler-sdk.css"
import RangeSlider from "react-range-slider-input"
import "react-range-slider-input/dist/style.css"
import "../App.css"

import { AuthContext } from "../Utils/authContext"
import {
  getCountryName,
  fetchListByParams,
  queryTopRatedFilmByCountryTMDB,
} from "../Utils/helperFunctions"
import useCommandK from "../Utils/useCommandK"

import NavBar from "./Shared/NavBar"
import QuickSearchModal from "./Shared/QuickSearchModal"
import FilmUser_Gallery from "./Shared/FilmUser_Gallery"
import FilmTMDB_Gallery from "./Shared/FilmTmdb_Gallery"
import Toggle_Two from "./Shared/Toggle_Two"
import Toggle_Three from "./Shared/Toggle_Three"
import Toggle_Four from "./Shared/Toggle_Four"
// import CustomSlider from "./Shared/CustomSlider"

// import "maplibre-gl/dist/maplibre-gl.css"`
import { FaSortNumericDown, FaSortNumericDownAlt } from "react-icons/fa"

export default function MapPage() {
  const MAPTILER_API_KEY = "0bsarBRVUOINHDtiYsY0"
  const [mapFilmData, setMapFilmData] = useState([])
  const [userFilmList, setUserFilmList] = useState([])
  const [suggestedFilmList, setSuggestedFilmList] = useState([])
  const [firstSymbolId, setFirstSymbolId] = useState(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [popupInfo, setPopupInfo] = useState(null)
  const [hoverInfo, setHoverInfo] = useState(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [filmsPerCountryData, setFilmsPerCountryData] = useState({})
  const [isDiscoverMode, setIsDiscoverMode] = useState(false)
  const [sortBy, setSortBy] = useState("added_date")
  const [sortDirection, setSortDirection] = useState("desc")
  const [queryString, setQueryString] = useState("discover")
  const [numStars, setNumStars] = useState(0)
  const [voteAverage, setVoteAverage] = useState(7)
  const [tempVoteAverage, setTempVoteAverage] = useState(7)
  const [ratingRange, setRatingRange] = useState([7, 10])
  const [tempRatingRange, setTempRatingRange] = useState([7, 10])
  const [voteCount, setVoteCount] = useState(50)
  const [tempVoteCount, setTempVoteCount] = useState(50)
  const [displaySliderValue, setDisplaySliderValue] = useState(false)
  const sliderRef = useRef(null)
  const voteAvgThumbDisplayRef = useRef(null)

  const { authState } = useContext(AuthContext)

  // const rangeSliderElement = rangeSlider(element)

  // const [queryString, setQueryString] = useState("watched/by_country")

  // const rangeSlider = document.querySelector("#range-slider")
  // useEffect(() => {
  //   const rangeSlider = document.querySelector("#range-slider")
  //   console.log(rangeSlider)
  // }, [])

  function toggleSearchModal() {
    setSearchModalOpen((status) => !status)
  }
  useCommandK(toggleSearchModal)

  const mapRef = useRef(null)

  useEffect(() => {
    if (voteAvgThumbDisplayRef.current) {
      if (displaySliderValue) {
        voteAvgThumbDisplayRef.current.style.opacity = 1
      } else {
        setTimeout(() => {
          voteAvgThumbDisplayRef.current.style.opacity = 0
        }, 200)
      }
    }
  }, [displaySliderValue])

  /* Fetch User's film list (liked or watchlisted) from App's DB */
  useEffect(() => {
    if (authState.status) {
      const fetchInitialLikeData = async () => {
        fetchListByParams({
          queryString: "watched",
          setUserFilmList: setMapFilmData,
        })
      }
      fetchInitialLikeData()
    } else {
      alert("Log in to interact with map!")
    }
  }, [])

  /* Hook to handle querying & sorting User Watched Films */
  useEffect(() => {
    // console.log(popupInfo)
    if (authState.status) {
      if (popupInfo && popupInfo.iso_a2 !== undefined) {
        const fetchLikedFilmsByCountry = async () => {
          fetchListByParams({
            queryString: "watched/by_country",
            countryCode: popupInfo.iso_a2,
            setUserFilmList: setUserFilmList,
            sortBy: sortBy,
            sortDirection: sortDirection,
            numStars: numStars,
          })
        }
        fetchLikedFilmsByCountry()
      }
    } else {
      alert("Log in to interact with map!")
    }
  }, [popupInfo, sortBy, sortDirection, numStars])

  /* Hook to switch on/off Discover Mode */
  useEffect(() => {
    if (queryString === "discover") {
      setIsDiscoverMode(true)
    } else {
      setIsDiscoverMode(false)
    }
  }, [queryString])

  /* Hook to handle Discover Mode */
  useEffect(() => {
    if (isDiscoverMode) {
      const getSuggestions = async () => {
        try {
          if (popupInfo && popupInfo.iso_a2 !== undefined) {
            queryTopRatedFilmByCountryTMDB(
              popupInfo.iso_a2,
              setSuggestedFilmList
            )
          } else {
            setSuggestedFilmList([])
          }
        } catch (err) {
          console.log(err)
          throw err
        }
      }
      getSuggestions()
    }
  }, [isDiscoverMode, popupInfo])

  useEffect(() => {
    // console.log("DisoverMode:", isDiscoverMode)
    // console.log("Suggested Film List: ", suggestedFilmList)
    // console.log("Vote Avg:", voteAverage)
    // console.log("Vote Count:", voteCount)
    console.log("Rating range:", ratingRange)
  }, [suggestedFilmList, isDiscoverMode, voteAverage, voteCount, ratingRange])

  useEffect(() => {
    // console.log(mapFilmData)
    const data = {}
    mapFilmData.forEach((film) => {
      film.origin_country.forEach((country) => {
        // If country already added as key, increment film counter
        if (country in data) {
          // console.log("Country already added as key: ", country)
          data[country].num_watched_films++
          // If country shows up first time, set film counter = 0
        } else {
          data[country] = {
            name: getCountryName(country),
            num_watched_films: 1,
          }
        }
      })
    })
    // console.log(data)
    setFilmsPerCountryData(data)
  }, [mapFilmData])

  const setFeatureStates = useCallback(() => {
    if (!mapRef.current) return

    const map = mapRef.current
    const countries = map.queryRenderedFeatures({
      layers: ["countriesLayer"],
    })
    countries.forEach((country) => {
      if (
        country.properties.iso_a2 &&
        filmsPerCountryData[country.properties.iso_a2]
      ) {
        map.setFeatureState(
          {
            source: "countriesData",
            sourceLayer: "administrative",
            id: country.id,
          },
          {
            num_watched_films:
              filmsPerCountryData[country.properties.iso_a2].num_watched_films,
          }
        )

        // if (country.properties.iso_a2 === "")
      }
      //921 & 907: iso_i3 for West Bank and Gaza
      if (country.id === 921 || country.id === 907) {
        // console.log("Detected films from PS.")
        map.setFeatureState(
          {
            source: "countriesData",
            sourceLayer: "administrative",
            id: country.id,
          },
          {
            custom_name: "Palestine",
          }
        )
        if (filmsPerCountryData["PS"]) {
          // console.log("Detected films from PS.")
          map.setFeatureState(
            {
              source: "countriesData",
              sourceLayer: "administrative",
              id: country.id,
            },
            {
              custom_name: "Palestine",
              num_watched_films: filmsPerCountryData["PS"].num_watched_films,
            }
          )
        }
      }
    })
  }, [filmsPerCountryData])

  const onData = useCallback(
    (event) => {
      if (event.sourceId === "countriesData" && event.isSourceLoaded) {
        // console.log("statesData source loaded, setting feature states...")
        setFeatureStates()
      }
    },
    [setFeatureStates]
  )

  const onMapLoad = useCallback(
    (event) => {
      mapRef.current = event.target // Store the map instance in the ref
      const map = mapRef.current // use the ref to access the map

      map.on("data", onData)

      if (mapRef.current.isSourceLoaded("countriesData")) {
        setFeatureStates()
      }

      const layers = map.getStyle().layers
      const firstSymbolLayerId = layers.find(
        (layer) => layer.type === "symbol"
      ).id

      if (firstSymbolLayerId) {
        setFirstSymbolId(firstSymbolLayerId)
      }

      setIsMapLoaded(true)
    },
    [onData, setFeatureStates]
  )

  const onMapClick = useCallback((event) => {
    let clickedFeature
    let numWatchedFilms
    let countryName
    let customName
    let isoA2

    // console.log("clicked")
    // console.log("event: ", event)
    if (!mapRef.current) return

    const features = mapRef.current.queryRenderedFeatures(event.point, {
      layers: ["countriesLayer"],
    })

    // console.log(features)

    if (features.length > 0) {
      clickedFeature = features[0]
      numWatchedFilms = clickedFeature.state?.num_watched_films
      customName = clickedFeature.state?.custom_name
      countryName = clickedFeature.properties?.name
      if (customName === "Palestine") {
        isoA2 = "PS"
      } else {
        isoA2 = clickedFeature.properties?.iso_a2
      }
    }

    setPopupInfo({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat,
      num_watched_films: numWatchedFilms >= 1 ? numWatchedFilms : 0,
      country_name: countryName,
      custom_name: customName,
      iso_a2: isoA2,
    })
  }, [])

  /* Clean up event listeners when map unmounts */
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.off("data", onData)
      }
    }
  }, [onData])

  return (
    <div>
      {/* Quick Search Modal */}
      {searchModalOpen && (
        <QuickSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
          // queryString={queryString}
        />
      )}
      <NavBar />
      <div className="w-screen h-[40rem] flex flex-col items-center relative">
        <Map
          className=""
          ref={mapRef}
          onLoad={onMapLoad}
          onClick={onMapClick}
          // onMouseEnter={onMapClick}
          mapboxAccessToken={MAPTILER_API_KEY}
          initialViewState={{ latitude: 25, longitude: 150, zoom: 1.2 }}
          mapStyle={
            "https://api.maptiler.com/maps/0199f849-b24f-7c0c-a482-2c1149331519/style.json?key=0bsarBRVUOINHDtiYsY0"
          }>
          <Source
            id="countriesData"
            type="vector"
            url="https://api.maptiler.com/tiles/countries/tiles.json?key=0bsarBRVUOINHDtiYsY0">
            <Layer
              id="countriesLayer"
              source="countriesData"
              source-layer="administrative"
              type="fill"
              paint={{
                "fill-color": [
                  "case",
                  [
                    "!=",
                    ["to-number", ["feature-state", "num_watched_films"]],
                    0,
                  ],
                  [
                    "interpolate",
                    ["linear"],
                    ["feature-state", "num_watched_films"],
                    1,
                    "rgba(247, 227, 222, 1)",
                    10,
                    "rgba(140, 23, 10, 1)",
                  ],
                  "rgba(126, 126, 126, 0)",
                ],
                "fill-opacity": 1,
                "fill-outline-color": "rgba(140, 206, 34, 0.7)",
              }}
              filter={["==", "level", 0]}
              beforeId={firstSymbolId}></Layer>
            <Layer
              id="countriesLayer"
              source="countriesData"
              source-layer="administrative"
              type="symbol"
              layout={{
                "text-field": [
                  "case",
                  ["!=", ["feature-state", "custom_name"], ""],
                  ["feature-state", "custom_name"], // Use custom name if available
                  ["get", "NAME"], // Fallback to original name
                ],
                "text-size": 12,
                "text-font": ["Open Sans Bold"],
                "text-allow-overlap": false,
                "text-optional": true,
              }}
              paint={{
                "text-color": "#000000",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1,
              }}
              filter={["==", "level", 0]}
              beforeId={firstSymbolId}></Layer>
          </Source>

          {popupInfo && (
            <Popup
              longitude={popupInfo.longitude}
              latitude={popupInfo.latitude}
              anchor="bottom"
              closeOnClick={false}
              onClose={() => setPopupInfo(null)}>
              <div className="flex flex-col items-center justify-center hover:text-blue-600 cursor-pointer">
                {popupInfo.custom_name !== undefined && (
                  <span className="font-bold">{popupInfo.custom_name}</span>
                )}
                {popupInfo.custom_name === undefined && (
                  <span className="font-bold">{popupInfo.country_name}</span>
                )}

                <span>
                  <span className="font-bold">
                    {`${popupInfo.num_watched_films}`}&nbsp;
                  </span>
                  <span>{`watched films`}</span>
                </span>
              </div>
            </Popup>
          )}
        </Map>
      </div>

      <div className="flex flex-col items-center">
        {popupInfo &&
          popupInfo.iso_a2 !== null &&
          popupInfo.iso_a2 !== undefined && (
            <div className="uppercase font-bold text-3xl flex items-center justify-center w-full mt-10">{`${getCountryName(popupInfo.iso_a2)}`}</div>
          )}

        <div className="flex flex-col items-start justify-center mt-10">
          <div className="flex items-center p-2 gap-5">
            <div>View Mode</div>
            <Toggle_Three
              width={`20rem`}
              height={`2.5rem`}
              state={queryString}
              setState={setQueryString}
              stateDetails={{
                1: { value: "discover", label: "Discover" },
                2: { value: "watched/by_country", label: "Watched" },
                3: { value: "watched/rated/by_country", label: "Rated" },
              }}
            />
          </div>
          {!isDiscoverMode && (
            <div>
              <div className="flex items-center p-2 gap-5">
                <div>Sort By</div>
                <Toggle_Two
                  width={`20rem`}
                  height={`2.5rem`}
                  state={sortBy}
                  setState={setSortBy}
                  stateDetails={{
                    1: { value: "added_date", label: "Recently Added" },
                    2: { value: "released_date", label: "Released Year" },
                  }}
                />
              </div>
              <div className="flex items-center p-2 gap-5">
                <div>Sort Order </div>
                <Toggle_Two
                  width={`10rem`}
                  height={`2.5rem`}
                  state={sortDirection}
                  setState={setSortDirection}
                  stateDetails={{
                    1: {
                      value: "desc",
                      label: <FaSortNumericDownAlt className="text-xl mt-0" />,
                    },
                    2: {
                      value: "asc",
                      label: <FaSortNumericDown className="text-xl mt-0" />,
                    },
                  }}
                />
              </div>
            </div>
          )}
          {!isDiscoverMode && queryString === "watched/rated/by_country" && (
            <div className="flex items-center p-2 gap-5">
              <div>Rating</div>
              <Toggle_Four
                width={`20rem`}
                height={`2.5rem`}
                state={numStars}
                setState={setNumStars}
                stateDetails={{
                  1: {
                    value: 0,
                    label: <span className="">All</span>,
                  },
                  2: {
                    value: 3,
                    label: (
                      <span className="text-2xl text-pink-600">
                        &#10048;&#10048;&#10048;
                      </span>
                    ),
                  },
                  3: {
                    value: 2,
                    label: (
                      <span className="text-2xl text-pink-600">
                        &#10048;&#10048;
                      </span>
                    ),
                  },
                  4: {
                    value: 1,
                    label: (
                      <span className="text-2xl text-pink-600">&#10048;</span>
                    ),
                  },
                }}
              />
            </div>
          )}
          {setIsDiscoverMode && (
            // <CustomSlider value={voteAverage} setValue={setVoteAverage} />
            <div className="w-full">
              <div
                className="w-full flex items-center gap-5"
                onMouseEnter={() => setDisplaySliderValue(true)}
                onMouseLeave={() => setDisplaySliderValue(false)}>
                <div>TMDB Vote Average</div>
                <div className="w-full flex items-center gap-2">
                  <small>0</small>
                  <div
                    className="w-full flex justify-center"
                    // onHover={() => console.log("hovering")}
                  >
                    <RangeSlider
                      id="range-slider"
                      className="range-slider"
                      min={0}
                      max={10}
                      step={0.1}
                      value={[tempRatingRange[0], tempRatingRange[1]]}
                      onInput={(value, userInteraction) => {
                        // if (userInteraction) {
                        setTempRatingRange([value[0], value[1]])
                        // }
                      }}
                      onThumbDragEnd={() =>
                        setRatingRange([tempRatingRange[0], tempRatingRange[1]])
                      }
                      onRangeDragEnd={() =>
                        setRatingRange([tempRatingRange[0], tempRatingRange[1]])
                      }
                    />
                    {displaySliderValue && (
                      <small
                        ref={voteAvgThumbDisplayRef}
                        className="absolute w-[4rem]flex items-center justify-center mt-2 z-10 transition-all duration-600 ease-out opacity-0">{`${tempRatingRange[0]} - ${tempRatingRange[1]}`}</small>
                    )}
                  </div>
                  <small>10</small>
                </div>
              </div>
            </div>
          )}
        </div>

        {authState.status && !isDiscoverMode && (
          <FilmUser_Gallery
            listOfFilmObjects={userFilmList}
            queryString={`watched`}
            sortDirection={sortDirection}
            sortBy={sortBy}
          />
        )}
        {isDiscoverMode && suggestedFilmList && (
          <FilmTMDB_Gallery listOfFilmObjects={suggestedFilmList} />
        )}
      </div>
    </div>
  )
}

{
  /* <div className="flex items-center gap-5">
                <div>Minimum Vote Average</div>
                <input
                  className="w-[15rem]"
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={voteAverage}
                  onChange={(event) =>
                    setVoteAverage(Number(event.target.value))
                  }
                />
              </div> */
}
{
  /* <div className="flex items-center gap-5">
                <div>Mininum Vote Count</div>
                <input
                  className="w-[15rem]"
                  type="range"
                  min="0"
                  max="1000"
                  step="20"
                  value={voteCount}
                  onChange={(event) => setVoteCount(Number(event.target.value))}
                />
              </div> */
}

// <div className="flex items-center gap-5">
//   <div>Minimum Vote Average</div>
//   <input
//     className="w-[15rem]"
//     type="range"
//     min="0"
//     max="10"
//     step="0.1"
//     value={voteAverage}
//     onChange={(event) =>
//       setVoteAverage(Number(event.target.value))
//     }
//   />
// </div>
// <div className="flex items-center gap-5">
//   <div>Mininum Vote Count</div>
//   <input
//     className="w-[15rem]"
//     type="range"
//     min="0"
//     max="1000"
//     step="20"
//     value={tempVoteCount}
//     onChange={(event) =>
//       setTempVoteCount(Number(event.target.value))
//     }
//     onPointerUp={() => setVoteCount(tempVoteCount)}
//     onMouseUp={() => setVoteCount(tempVoteCount)}
//     onKeyUp={() => setVoteCount(tempVoteCount)}
//   />
// </div>
