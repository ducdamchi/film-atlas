import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react"
import { Map, Source, Layer, Popup } from "react-map-gl/maplibre"

import * as maptilersdk from "@maptiler/sdk"
import "@maptiler/sdk/dist/maptiler-sdk.css"
import "react-range-slider-input/dist/style.css"
import "../App.css"

import { AuthContext } from "../Utils/authContext"
import { getCountryName } from "../Utils/helperFunctions"
import {
  fetchListByParams,
  queryTopRatedFilmByCountryTMDB,
} from "../Utils/apiCalls"
import useCommandK from "../Hooks/useCommandK"
import { usePersistedState } from "../Hooks/usePersistedState"

import NavBar from "./Shared/Navigation-Search/NavBar"
import QuickSearchModal from "./Shared/Navigation-Search/QuickSearchModal"
import FilmUser_Gallery from "./Shared/Films/FilmUser_Gallery"
import FilmTMDB_Gallery from "./Shared/Films/FilmTMDB_Gallery"
import Toggle_Two from "./Shared/Buttons/Toggle_Two"
import Toggle_Three from "./Shared/Buttons/Toggle_Three"
import Toggle_Four from "./Shared/Buttons/Toggle_Four"
import CustomSlider from "./Shared/Buttons/CustomSlider"
import LoadingPage from "./Shared/Navigation-Search/LoadingPage"

import { FaSortNumericDown, FaSortNumericDownAlt } from "react-icons/fa"

export default function MapPage() {
  /* Map const */
  const mapRef = useRef(null)
  const MAPTILER_API_KEY = "0bsarBRVUOINHDtiYsY0"
  const [firstSymbolId, setFirstSymbolId] = useState(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [popupInfo, setPopupInfo] = usePersistedState("map-popupInfo", null)
  const [filmsPerCountryData, setFilmsPerCountryData] = useState({})

  // const [hoverInfo, setHoverInfo] = useState(null)

  /* API request const */
  const [mapFilmData, setMapFilmData] = useState([])
  const [userFilmList, setUserFilmList] = useState([])
  const [suggestedFilmList, setSuggestedFilmList] = usePersistedState(
    "map-suggestedFilmList",
    []
  )
  const [isDiscoverMode, setIsDiscoverMode] = usePersistedState(
    "map-isDiscoverMode",
    false
  )
  const [isLoading, setIsLoading] = useState(false)

  /* Persistent states */
  const [sortBy, setSortBy] = usePersistedState("map-sortBy", "added_date")
  const [sortDirection, setSortDirection] = usePersistedState(
    "map-sortDirection",
    "desc"
  )
  const [queryString, setQueryString] = usePersistedState(
    "map-queryString",
    "discover"
  )
  const [numStars, setNumStars] = usePersistedState("map-numStars", 0)
  const [discoverBy, setDiscoverBy] = usePersistedState(
    "map-discoverBy",
    "vote_average.desc"
  )
  const [scrollPosition, setScrollPosition] = usePersistedState(
    "map-scrollPosition",
    0
  )

  /* Slider - Rating const */
  const [ratingRange, setRatingRange] = usePersistedState(
    "map-ratingRange",
    [0, 7]
  )
  const [tempRatingRange, setTempRatingRange] = usePersistedState(
    "map-tempRating",
    [0, 7]
  )

  /* Slider - Vote Count const */
  const [voteCountRange, setVoteCountRange] = usePersistedState(
    "map-voteCountRange",
    [0, 100]
  )
  const [tempVoteCountRange, setTempVoteCountRange] = usePersistedState(
    "map-tempVoteCount",
    [0, 100]
  )

  /* Authentication */
  const { authState, searchModalOpen, setSearchModalOpen } =
    useContext(AuthContext)

  const loadMoreTrigger = useRef(null)
  // const [page, setPage] = usePersistedState("map-page", 1)
  const [page, setPage] = usePersistedState("map-page", {
    numPages: 1,
    loadMore: false,
  })

  const [hasMore, setHasMore] = useState(true)

  function toggleSearchModal() {
    setSearchModalOpen((status) => !status)
  }
  useCommandK(toggleSearchModal)

  // async function fetchNewPage() {
  //   if (isDiscoverMode && page.numPages !== 1 && page.loadMore === true) {
  //     // console.log("Inside page function, page: ", page)

  //     try {
  //       setIsLoading(true)
  //       if (
  //         popupInfo &&
  //         popupInfo.iso_a2 !== undefined &&
  //         ratingRange.length == 2
  //       ) {
  //         const result = await queryTopRatedFilmByCountryTMDB({
  //           page: page.numPages + 1,
  //           countryCode: popupInfo.iso_a2,
  //           sortBy: discoverBy,
  //           ratingRange: ratingRange,
  //           voteCountRange: voteCountRange,
  //         })

  //         setPage((prevPage) => ({
  //           ...prevPage,
  //           numPages: prevPage.numPages + 1,
  //         }))

  //         const filtered_results = result.filter(
  //           (movie) =>
  //             !(movie.backdrop_path === null || movie.poster_path === null)
  //         )

  //         if (filtered_results.length > 0) {
  //           setSuggestedFilmList((prevResults) => [
  //             ...prevResults,
  //             ...filtered_results,
  //           ])
  //         } else {
  //           setHasMore(false)
  //           console.log("No more pages to load.")
  //         }
  //         // If requested country is different from previously requested country
  //       } else {
  //         setSuggestedFilmList([])
  //       }
  //     } catch (err) {
  //       console.log(err)
  //       throw err
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }
  // }

  useEffect(() => {
    const fetchNewPage = async () => {
      if (!isLoading && page.loadMore === true) {
        console.log("Inside page function, page: ", page)

        try {
          setIsLoading(true)
          if (
            popupInfo &&
            popupInfo.iso_a2 !== undefined &&
            ratingRange.length == 2
          ) {
            const result = await queryTopRatedFilmByCountryTMDB({
              page: page.numPages + 1,
              countryCode: popupInfo.iso_a2,
              sortBy: discoverBy,
              ratingRange: ratingRange,
              voteCountRange: voteCountRange,
            })

            setPage((prevPage) => ({
              ...prevPage,
              numPages: prevPage.numPages + 1,
            }))

            const filtered_results = result.filter(
              (movie) =>
                !(movie.backdrop_path === null || movie.poster_path === null)
            )

            if (filtered_results.length > 0) {
              setSuggestedFilmList((prevResults) => [
                ...prevResults,
                ...filtered_results,
              ])
            } else {
              setHasMore(false)
              console.log("No more pages to load.")
            }
            // If requested country is different from previously requested country
          } else {
            setSuggestedFilmList([])
          }
        } catch (err) {
          console.log(err)
          throw err
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchNewPage()
  }, [page])

  useEffect(() => {
    if (!isLoading) {
      // Tell page function to not load any extra pages upon user return from landing page.
      // setPage((prevPage) => ({ ...prevPage, loadMore: false }))

      if (scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollPosition, 10))
        }, 0)
      } else {
        setTimeout(() => {
          window.scrollTo(0, 0)
        }, 0)
      }

      const handleScroll = () => {
        setScrollPosition(window.scrollY)
      }

      const scrollTimer = setTimeout(() => {
        window.addEventListener("scroll", handleScroll)
      }, 500)

      return () => {
        clearTimeout(scrollTimer)
        window.removeEventListener("scroll", handleScroll)
      }
    }
  }, [isLoading])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) =>
      entries.forEach(
        (entry) => {
          if (entry.isIntersecting) {
            if (!isLoading && suggestedFilmList.length > 0) {
              // console.log("Entry Intersected")
              setPage((prevPage) => ({ ...prevPage, loadMore: true }))
            }
          } else {
            setPage((prevPage) => ({ ...prevPage, loadMore: false }))
          }
        },
        {
          threshold: 1,
        }
      )
    )

    if (loadMoreTrigger.current) {
      observer.observe(loadMoreTrigger.current)
    }

    return () => {
      if (loadMoreTrigger.current) {
        observer.unobserve(loadMoreTrigger.current)
      }
      setPage((prevPage) => ({ ...prevPage, loadMore: false }))
    }
  }, [isLoading])

  /* Fetch User's film list (liked or watchlisted) from App's DB when page first loads */
  useEffect(() => {
    if (authState.status) {
      const fetchInitialLikeData = async () => {
        try {
          setIsLoading(true)
          const result = await fetchListByParams({
            queryString: "watched",
          })
          setMapFilmData(result)
        } catch (err) {
          console.log("Error Fetching User Like Data: ", err)
        } finally {
          setIsLoading(false)
        }
      }
      fetchInitialLikeData()
    } else {
      // alert("Log in to interact with map!")
    }
  }, [])

  /* Hook to handle querying & sorting User Watched Films */
  useEffect(() => {
    if (authState.status) {
      if (popupInfo && popupInfo.iso_a2 !== undefined) {
        const fetchLikedFilmsByCountry = async () => {
          try {
            setIsLoading(true)
            const result = await fetchListByParams({
              queryString: "watched/by_country",
              countryCode: popupInfo.iso_a2,
              setUserFilmList: setUserFilmList,
              sortBy: sortBy,
              sortDirection: sortDirection,
              numStars: numStars,
            })
            setUserFilmList(result)
          } catch (err) {
            console.log("Error Fetching User Film List: ", err)
          } finally {
            setIsLoading(false)
          }
        }
        fetchLikedFilmsByCountry()
      }
    }
    // else {
    //   alert("Log in to interact with map!")
    // }
  }, [popupInfo, sortBy, sortDirection, numStars])

  /* Hook to switch on/off Discover Mode */
  useEffect(() => {
    if (queryString === "discover") {
      setIsDiscoverMode(true)
    } else {
      setIsDiscoverMode(false)
    }
  }, [queryString])

  /* Hook to handle Discover Mode when any of the dependencies below change*/
  useEffect(() => {
    if (isDiscoverMode) {
      const getSuggestions = async () => {
        try {
          // console.log("Inside default function")
          // console.log(page, discoverBy)
          setPage({ numPages: 1, loadMore: false })
          setIsLoading(true)
          setHasMore(true) //restart hasMore var
          if (
            popupInfo &&
            popupInfo.iso_a2 !== undefined &&
            ratingRange.length == 2
          ) {
            // console.log("Popup iso_a2: ", popupInfo.iso_a2)
            // console.log("requested Country: ", requestedCountry)
            // If parameters change but user are looking at the same region

            // This is the standard query whenever any of the parameters change. Default page number is 1.
            const result = await queryTopRatedFilmByCountryTMDB({
              page: 1,
              countryCode: popupInfo.iso_a2,
              sortBy: discoverBy,
              ratingRange: ratingRange,
              voteCountRange: voteCountRange,
            })

            const filtered_results = result.filter(
              (movie) =>
                !(movie.backdrop_path === null || movie.poster_path === null)
            )

            setSuggestedFilmList(filtered_results)

            // If requested country is different from previously requested country
          } else {
            setSuggestedFilmList([])
          }
        } catch (err) {
          console.log(err)
          throw err
        } finally {
          setIsLoading(false)
        }
      }
      getSuggestions()
    }
  }, [isDiscoverMode, popupInfo, discoverBy, ratingRange, voteCountRange])

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
      {isLoading && <LoadingPage />}

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <QuickSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
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

        <div className="flex flex-col items-center justify-center mt-10 w-[30rem] border-1">
          <Toggle_Three
            label="View Mode"
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

          {!isDiscoverMode && (
            <div className="w-full">
              <Toggle_Two
                label="Sort By"
                width={`20rem`}
                height={`2.5rem`}
                state={sortBy}
                setState={setSortBy}
                stateDetails={{
                  1: { value: "added_date", label: "Recently Added" },
                  2: { value: "released_date", label: "Released Year" },
                }}
              />
              <Toggle_Two
                label="Sort Order"
                width={`10rem`}
                height={`2.5rem`}
                state={sortDirection}
                setState={setSortDirection}
                stateDetails={{
                  1: {
                    value: "desc",
                    label: (
                      <FaSortNumericDownAlt className="text-xl mt-0 w-[5rem]" />
                    ),
                  },
                  2: {
                    value: "asc",
                    label: (
                      <FaSortNumericDown className="text-xl mt-0 w-[5rem]" />
                    ),
                  },
                }}
              />
            </div>
          )}
          {!isDiscoverMode && queryString === "watched/rated/by_country" && (
            <Toggle_Four
              label="Rating"
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
          )}
          {isDiscoverMode && (
            <div className="w-full flex flex-col items-center gap-0">
              <Toggle_Two
                label="Sort By"
                width="20rem"
                height="2.5rem"
                state={discoverBy}
                setState={setDiscoverBy}
                stateDetails={{
                  1: { value: "vote_average.desc", label: "Average Rating" },
                  2: { value: "vote_count.desc", label: "Vote Count" },
                }}
              />

              <div className="flex items-center p-2 gap-5 w-full border-1">
                <div className="border-1 w-[7rem] flex justify-end uppercase text-sm">
                  Filter
                </div>
                <div className="flex flex-col items-center justify-center gap-6 p-6 rounded-3xl bg-gray-200 w-[20rem]">
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="text-xs uppercase font-semibold text-gray-600">
                      Average Rating &#x2265; {`${tempRatingRange[1]}`}
                    </div>
                    <CustomSlider
                      width="15rem"
                      id="slider-simple"
                      min={0}
                      max={10}
                      step={0.1}
                      tempRange={tempRatingRange}
                      setTempRange={setTempRatingRange}
                      range={ratingRange}
                      setRange={setRatingRange}
                      thumbsDisabled={[true, false]}
                      rangeSlideDisabled={true}
                    />
                  </div>
                  <div className="w-full flex flex-col items-center justify-center gap-2">
                    <div className="text-xs uppercase font-bold text-gray-600">
                      Vote Count &#x2265; {`${tempVoteCountRange[1]}`}
                    </div>
                    <CustomSlider
                      width="15rem"
                      id="slider-simple"
                      min={0}
                      max={500}
                      step={20}
                      tempRange={tempVoteCountRange}
                      setTempRange={setTempVoteCountRange}
                      range={voteCountRange}
                      setRange={setVoteCountRange}
                      thumbsDisabled={[true, false]}
                      rangeSlideDisabled={true}
                    />
                  </div>
                </div>
              </div>
              <div className="text-xs italic mt-5">
                Results are automatically displayed in descending order.
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

        {isDiscoverMode && hasMore && (
          <div
            ref={loadMoreTrigger}
            className="w-full h-[10rem] flex items-center justify-center mb-0 mt-[20rem]"></div>
        )}

        {isDiscoverMode && !hasMore && (
          <div className="w-full flex items-center justify-center m-10">
            You've reached the end!
          </div>
        )}
      </div>
    </div>
  )
}

/* This hook gets triggered when there's a request to load more pages (when "page" variable is > 1, and when it changes). It queries the specified page, and appends it to the existing Suggestions list. Note: this hook only gets called when all other parameters like countryCode, discoverBy, ratingRange, voteCountRange, are unchanged. If any of these parameters change, the default hook above will be called, which automatically resets the Suggestions List and fill it with content from page 1 of the TMDB query. // only trigger when page is incremented past 1. if page is 1, it means that the default fetch function is handling fetching the first page from TMDB*/
// useEffect(() => {
//   if (isDiscoverMode && page.numPages !== 1 && page.loadMore === true) {

//     const getSuggestions = async () => {
//       try {
//         setIsLoading(true)
//         if (
//           popupInfo &&
//           popupInfo.iso_a2 !== undefined &&
//           ratingRange.length == 2
//         ) {
//           const result = await queryTopRatedFilmByCountryTMDB({
//             page: page.numPages,
//             countryCode: popupInfo.iso_a2,
//             sortBy: discoverBy,
//             ratingRange: ratingRange,
//             voteCountRange: voteCountRange,
//           })

//           const filtered_results = result.filter(
//             (movie) =>
//               !(movie.backdrop_path === null || movie.poster_path === null)
//           )

//           if (filtered_results.length > 0) {
//             setSuggestedFilmList((prevResults) => [
//               ...prevResults,
//               ...filtered_results,
//             ])
//           } else {
//             setHasMore(false)
//             console.log("No more pages to load.")
//           }
//           // If requested country is different from previously requested country
//         } else {
//           setSuggestedFilmList([])
//         }
//       } catch (err) {
//         console.log(err)
//         throw err
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     getSuggestions()
//   }
// }, [page, isDiscoverMode])
