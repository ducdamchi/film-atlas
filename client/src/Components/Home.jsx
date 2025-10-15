import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import axios from "axios"
import { BiSearchAlt2 } from "react-icons/bi"
import { useContext } from "react"
import { AuthContext } from "../Utils/authContext"
import { queryFilmFromTMDB } from "../Utils/helperFunctions"

import NavBar from "./Shared/NavBar"
import FilmGalleryDisplay from "./Shared/FilmGalleryDisplay"

export default function Home() {
  const [searchInput, setSearchInput] = useState("")
  const [searchResult, setSearchResult] = useState([])
  const [likedFilms, setLikedFilms] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const { authState } = useContext(AuthContext)

  /* Query films from TMDB with Quick Search Modal's Search Input */
  const location = useLocation()
  const { searchInputFromQuickSearch } = location.state || {}
  useEffect(() => {
    try {
      // console.log("Location.state:", location.state)
      if (location.state) {
        // Check if search input is not an empty string or null
        if (
          searchInputFromQuickSearch.trim().length > 0 &&
          searchInputFromQuickSearch !== null
        ) {
          setSearchInput(searchInputFromQuickSearch)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }, [location.state])

  /* Query films from TMDB with Home Page's Search Input */
  useEffect(() => {
    // console.log("Search Input:", searchInput)
    if (searchInput.trim().length === 0 || searchInput === null) {
      setIsSearching(false)
    } else {
      setIsSearching(true)
      queryFilmFromTMDB(searchInput, setSearchResult)
    }
  }, [searchInput])

  /* Fetch liked films from App's DB */
  useEffect(() => {
    axios
      .get(`http://localhost:3002/profile/me/liked-films`, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        // console.log("Liked films:", response.data)
        setLikedFilms(response.data)
      })
      .catch((err) => {
        console.log("Error: ", err)
      })
  }, [])

  return (
    <>
      {/* Wrapper for entire page */}
      <div className="flex flex-col items-center">
        <NavBar />

        {/* Page title */}
        <div className="text-black mt-20 ">
          <span> Welcome to The Film Atlas</span>
          {authState.status && (
            <span className="font-bold">{`, ${authState.username}`}</span>
          )}
        </div>

        {/* Search bar */}
        <div className="flex items-center justify-center gap-4 mt-10 w-full h-auto ">
          <div className="relative w-[50%] min-w-[10rem] max-w-[40rem] border-1 h-[2.5rem] p-2 flex items-center gap-2">
            <BiSearchAlt2 />
            <input
              className="h-[2.5rem] w-full border-0 focus:outline-0 input:bg-none"
              type="text"
              name="search-bar"
              autoComplete="off"
              placeholder="Search by title..."
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value)
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setSearchInput(event.target.value)
                }
              }}></input>
          </div>
        </div>

        {/* If user logged in and is not searching, show them list of liked films */}
        {!isSearching && authState.status && (
          <FilmGalleryDisplay listOfFilmObjects={likedFilms} />
        )}

        {/* If user is searching (even when they're not logged in), show them list of search results */}
        {isSearching && <FilmGalleryDisplay listOfFilmObjects={searchResult} />}
      </div>
    </>
  )
}
