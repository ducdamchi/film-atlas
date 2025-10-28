/* Libraries */
import axios from "axios"
import React, { useEffect, useState, useContext, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"

/* Custom functions */
import { AuthContext } from "../Utils/authContext"
import {
  queryFilmFromTMDB,
  fetchListByParams,
  queryDirectorFromTMDB,
} from "../Utils/helperFunctions"
import useCommandK from "../Utils/useCommandK"

/* Components */
import NavBar from "./Shared/NavBar"
import SearchBar from "./Shared/SearchBar"
import DirectorTMDB_Gallery from "./Shared/DirectorTmdb_Gallery"
import DirectorUser_Gallery from "./Shared/DirectorUser_Gallery"
import QuickSearchModal from "./Shared/QuickSearchModal"
import Toggle_Four from "./Shared/Toggle_Four"
import Toggle_Three from "./Shared/Toggle_Three"
import Toggle_Two from "./Shared/Toggle_Two"
import LoadingPage from "./Shared/LoadingPage"

/* Icons */
import { HiMiniBarsArrowDown, HiMiniBarsArrowUp } from "react-icons/hi2"

export default function Directors() {
  const [searchInput, setSearchInput] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [userDirectorList, setUserDirectorList] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [numStars, setNumStars] = useState(0)

  const [sortDirection, setSortDirection] = useState("asc")
  const [queryString, setQueryString] = useState("directors")
  const { authState } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  function toggleSearchModal() {
    setSearchModalOpen((status) => !status)
  }
  useCommandK(toggleSearchModal)

  /* Query films from TMDB with Quick Search Modal's Search Input */
  useEffect(() => {
    try {
      if (location.state) {
        const { searchInputFromQuickSearch, returnToViewMode } =
          location.state || {}
        // Check if search input is not an empty string or null
        if (typeof searchInputFromQuickSearch === "string") {
          if (searchInputFromQuickSearch.trim().length > 0) {
            setSearchInput(searchInputFromQuickSearch)
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  }, [location.state])

  /* Query films from TMDB with Search Bar */
  useEffect(() => {
    // console.log("Search Input:", searchInput)
    const queryFilm = async () => {
      try {
        if (searchInput.trim().length === 0 || searchInput === null) {
          setIsSearching(false)
        } else {
          setIsSearching(true)
          queryDirectorFromTMDB(searchInput, setSearchResult)
        }
      } catch (err) {
        console.log("Error Querying Film: ", err)
        throw err
      }
    }
    queryFilm()
  }, [searchInput])

  // useEffect(() => {
  //   console.log("search Result: ", searchResult)
  // }, [searchResult])

  // useEffect(() => {
  //   console.log("Directors List: ", userDirectorList)
  // }, [userDirectorList])

  /* Fetch User's Directors list (liked, watchlisted or starred) from App's DB */
  useEffect(() => {
    const fetchUserDirectorList = async () => {
      setIsLoading(true)
      axios
        .get(`http://localhost:3002/profile/me/${queryString}`, {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
          params: {
            sortDirection: sortDirection,
          },
        })
        .then((response) => {
          setUserDirectorList(response.data)
        })
        .catch((err) => {
          console.log("Error: ", err)
          throw err
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
    fetchUserDirectorList()
  }, [sortDirection, queryString])

  return (
    <>
      {/* Quick Search Modal */}
      {searchModalOpen && (
        <QuickSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
          queryString={queryString}
        />
      )}
      {/* Wrapper for entire page */}
      <div className="flex flex-col items-center">
        <NavBar />
        {/* Page title for Liked films*/}
        {/* <div className="text-black mt-20 ">
          <span> Welcome to The Film Atlas</span>
          {authState.status && (
            <span className="font-bold">{`, ${authState.username}`}</span>
          )}
        </div> */}

        <SearchBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          placeholderString={`Search by director's name (or \u2318K) ...`}
        />
        <div className="flex flex-col items-start justify-center mt-20">
          {/* <div className="flex items-center p-2 gap-5">
            <div>View Mode</div>
            <TripleToggleSwitch
              state={queryString}
              setState={setQueryString}
              stateDetails={{
                1: { value: "watched", label: "Watched" },
                2: { value: "watchlisted", label: "Watchlist" },
                3: { value: "starred", label: "Starred" },
              }}
            />
          </div> */}
          {/* <div className="flex items-center p-2 gap-5">
            <div>Sort By</div>
            <ToggleSwitch
              width={`20rem`}
              height={`2.5rem`}
              state={sortBy}
              setState={setSortBy}
              stateDetails={{
                1: { value: "added_date", label: "Recently Added" },
                2: { value: "released_date", label: "Released Year" },
              }}
            />
          </div> */}
          <div className="flex items-center p-2 gap-5">
            <div>Sort Order </div>
            <Toggle_Two
              width={`10rem`}
              height={`2.5rem`}
              state={sortDirection}
              setState={setSortDirection}
              stateDetails={{
                1: {
                  value: "asc",
                  label: "A-Z",
                },
                2: {
                  value: "desc",
                  label: "Z-A",
                },
              }}
            />
          </div>

          <div className="flex items-center p-2 gap-5">
            <div>Rating</div>
            <Toggle_Four
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
        </div>
        {/* If user logged in and is not searching, show them list of liked films */}
        {!isSearching && !isLoading && authState.status && (
          <div className="mt-10">
            {/* <span>Your Films:</span> */}
            <DirectorUser_Gallery
              listOfDirectorObjects={userDirectorList}
              sortDirection={sortDirection}
            />
          </div>
        )}
        {/* If user is searching (even when they're not logged in), show them list of search results */}
        {isSearching && (
          <div className="mt-10">
            <span className="font-bold text-2xl">Search Results:</span>
            <DirectorTMDB_Gallery listOfDirectorObjects={searchResult} />
          </div>
        )}
      </div>
    </>
  )
}
