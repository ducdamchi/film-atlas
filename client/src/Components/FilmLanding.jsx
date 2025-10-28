/* Libraries */
import React, { useEffect, useState, useContext, useRef } from "react"
import { useLocation, useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"

/* Custom functions */
import {
  getCountryName,
  getReleaseYear,
  fetchFilmFromTMDB,
  checkLikeStatus,
  checkSaveStatus,
  checkRateStatus,
} from "../Utils/helperFunctions"
import { AuthContext } from "../Utils/authContext"
import useCommandK from "../Utils/useCommandK"

/* Components */
import NavBar from "./Shared/NavBar"
import LoadingPage from "./Shared/LoadingPage"
import QuickSearchModal from "./Shared/QuickSearchModal"
import TripleStarRating from "./Shared/TripleStarRating"

/* Icons */
import {
  BiListPlus,
  BiListCheck,
  BiHeart,
  BiSolidHeart,
  BiStar,
  BiSolidStar,
} from "react-icons/bi"
import { GiLotusFlower } from "react-icons/gi"

export default function FilmLanding() {
  const imgBaseUrl = "https://image.tmdb.org/t/p/original"
  const [isLoading, setIsLoading] = useState(false)
  const [movieDetails, setMovieDetails] = useState({})
  const [directors, setDirectors] = useState([]) //director
  const [dops, setDops] = useState([]) //director of photography
  const [mainCast, setMainCast] = useState([]) //top 5 cast
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [returnToViewMode, setReturnToViewMode] = useState("")
  const [officialRating, setOfficialRating] = useState(0) //0 for unrated; 1, 2, 3 for corresponding stars.
  const [requestedRating, setRequestedRating] = useState(-1) //-1 when neutral (no requests), 0 for unrated; 1, 2, 3 for stars.

  const { authState, loading } = useContext(AuthContext)
  const { tmdbId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  function toggleSearchModal() {
    setSearchModalOpen((status) => !status)
  }
  useCommandK(toggleSearchModal)

  /* Create the request body for API call to App's DB when user 'like' a film */
  function createReqBody() {
    const directorsList = directors.map((director) => ({
      tmdbId: director.id,
      name: director.name,
      profile_path: director.profile_path,
    }))
    const directorNamesForSorting = directors
      .map((director) => director.name)
      .join(", ")

    const req = {
      tmdbId: movieDetails.id,
      title: movieDetails.title,
      runtime: movieDetails.runtime,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      origin_country: movieDetails.origin_country,
      release_date: movieDetails.release_date,
      directors: directorsList,
      directorNamesForSorting: directorNamesForSorting,
    }
    return req
  }

  /* Make API call to App's DB when user 'like' a film */
  function likeFilm() {
    const req = createReqBody()
    return axios
      .post(`http://localhost:3002/profile/me/watched`, req, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)
        } else {
          setIsLiked(true)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error liking film", err)
        throw err
      })
  }
  /* Make API call to App's DB when user 'unlike' a film */
  function unlikeFilm() {
    return axios
      .delete(`http://localhost:3002/profile/me/watched`, {
        data: {
          tmdbId: movieDetails.id,
        },
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)

          // console.log(authState)
        } else {
          setIsLiked(false)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error unliking film", err)
        throw err
      })
  }
  /* Make API call to App's DB when user 'like' a film */
  function saveFilm() {
    const req = createReqBody()
    return axios
      .post(`http://localhost:3002/profile/me/watchlisted`, req, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)
        } else {
          setIsSaved(true)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error saving film", err)
        throw err
      })
  }
  /* Make API call to App's DB when user 'unlike' a film */
  function unsaveFilm() {
    return axios
      .delete(`http://localhost:3002/profile/me/watchlisted`, {
        data: {
          tmdbId: movieDetails.id,
        },
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)

          // console.log(authState)
        } else {
          setIsSaved(false)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error unliking film", err)
        throw err
      })
  }
  function rateFilm(rating) {
    const req = createReqBody()
    req["stars"] = rating

    // console.log(req)
    return axios
      .post(`http://localhost:3002/profile/me/starred`, req, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)
        } else {
          setOfficialRating(rating)
          setRequestedRating(-1)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error rating film", err)
        throw err
      })
  }
  function updateFilmRating(rating) {
    const req = createReqBody()
    req["stars"] = rating

    // console.log(req)
    return axios
      .put(`http://localhost:3002/profile/me/starred`, req, {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)
        } else {
          setOfficialRating(rating)
          setRequestedRating(-1)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error rating film", err)
        throw err
      })
  }
  function unrateFilm() {
    return axios
      .delete(`http://localhost:3002/profile/me/starred`, {
        data: {
          tmdbId: movieDetails.id,
        },
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          console.log("Server: ", response.data.error)
          throw new Error(response.data.error)

          // console.log(authState)
        } else {
          setOfficialRating(0)
          setRequestedRating(-1)
          return response.data
        }
      })
      .catch((err) => {
        console.error("Client: Error unrating film", err)
        throw err
      })
  }

  /* Handle user Like/Unlike interaction */
  async function handleLike() {
    /* If user is logged in, they can like/unlike. */
    if (authState.status) {
      setIsLoading(true)

      try {
        /* If film has not been liked */
        if (!isLiked) {
          await likeFilm()
          /* Automatically removes film from watchlist if it's watched */
          if (isSaved) {
            await unsaveFilm()
          }
          /* If film has already been liked */
        } else {
          /* Important: Automatically unrate a film FIRST if it's unliked, THEN unrate it. */
          if (officialRating > 0) {
            await unrateFilm()
          }
          await unlikeFilm()
        }
      } catch (err) {
        alert("Error handling Like/Unlike, please try again.")
        console.error("Error in handleLike(): ", err)
      } finally {
        setIsLoading(false)
      }
      /* If user not logged in, alert */
    } else {
      alert("Sign In to Like Movies!")
    }
  }
  async function handleSave() {
    /* If user is logged in, they can save/unsave */
    if (authState.status) {
      setIsLoading(true)
      try {
        /* If film has not been saved */
        if (!isSaved) {
          await saveFilm()
          /* Automatically unlikes and unrate a film if it's added to watchlist */
          if (isLiked) {
            await unlikeFilm()
          }

          if (officialRating > 0) {
            await unrateFilm()
          }
          /* If film has already been liked */
        } else {
          await unsaveFilm()
        }
      } catch (err) {
        alert("Error handling Like/Unlike, please try again.")
        console.error("Error in handleLike(): ", err)
      } finally {
        setIsLoading(false)
      }

      /* If user not logged in, alert */
    } else {
      alert("Sign In to Save Movies!")
    }
  }
  async function handleRate() {
    /* If user is logged in, they can like/unlike. */
    if (authState.status) {
      try {
        /* Only take action if requested rating differs from official rating */
        if (requestedRating !== officialRating) {
          /* Rate film if requested rating is in valid range */
          if (requestedRating > 0 && requestedRating <= 3) {
            /* IMPORTANT: If a film has not been liked when it is rated, automatically likes it FIRST, THEN rate the film. */
            if (!isLiked) {
              await likeFilm()
            }
            /* Automatically removes film from watchlist if user rates it */
            if (isSaved) {
              await unsaveFilm()
            }

            // If rating film for first time
            if (officialRating === 0) {
              await rateFilm(requestedRating)
            } else {
              // If modifying existing rating
              await updateFilmRating(requestedRating)
            }
          } else if (requestedRating === 0) {
            // console.log("Trying to unrate film.")
            await unrateFilm()
          } else if (requestedRating == -1) {
            // console.log("Requested rating: back to neutral (-1)")
          } else {
            console.error("Requested rating out of range.")
          }
        }
      } catch (err) {
        alert("Error handling Like/Unlike, please try again.")
        console.error("Error in handleLike(): ", err)
      } finally {
        setIsLoading(false)
      }
      /* If user not logged in, alert */
    } else {
      alert("Sign In to Rate Movies!")
    }
  }

  useEffect(() => {
    handleRate()
  }, [requestedRating])

  /* Fetch film info for Landing Page */
  useEffect(() => {
    const fetchPageData = async () => {
      if (tmdbId) {
        setSearchModalOpen(false)
        setIsLoading(true)
        try {
          fetchFilmFromTMDB(
            tmdbId,
            setMovieDetails,
            setDirectors,
            setDops,
            setMainCast
          )
          checkLikeStatus(tmdbId, setIsLiked)
          checkSaveStatus(tmdbId, setIsSaved)
          checkRateStatus(tmdbId, setOfficialRating)
        } catch (err) {
          console.error("Error loading film data: ", err)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchPageData()
  }, [tmdbId])

  // useEffect(() => {
  //   if (location.state) {
  //     const { currentViewMode } = location.state || {}
  //     console.log("Location.state:", location.state)
  //     console.log("Current View Mode:", currentViewMode)
  //     setReturnToViewMode(currentViewMode)
  //   }
  // }, [location.state])

  if (!movieDetails) {
    return <div>Error loading film. Please try again.</div>
  }

  return (
    <>
      {/* {isLoading && <LoadingPage />} */}

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <QuickSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
        />
      )}

      {/* Landing Page content */}
      <div className="w-screen h-auto flex flex-col justify-center">
        <div className="overflow-hidden">
          <img
            className="w-screen aspect-16/9 object-cover scale-[1.02]"
            src={
              movieDetails.backdrop_path !== null
                ? `${imgBaseUrl}${movieDetails.backdrop_path}`
                : `backdropnotfound.jpg`
            }
            alt=""
          />
        </div>
        <div className="border-2 border-red-500 w-[100%] h-[90%] top-[5%] bg-zinc-50 text-black">
          <NavBar />
          <button
            onClick={() => {
              navigate("/", {
                state: {
                  returnToViewMode: returnToViewMode,
                },
              })
            }}>
            BACK TO FILMS
          </button>
          <img
            className="w-[20rem] min-w-[20rem] aspect-2/3 object-cover transition-all duration-300 ease-out border-2 border-blue-500"
            src={
              movieDetails.poster_path !== null
                ? `${imgBaseUrl}${movieDetails.poster_path}`
                : `posternotfound.png`
            }
            alt=""
          />

          <div className="flex items-center gap-5 border-1 h-[4rem]">
            <button
              alt="Add to watched"
              title="Add to watched"
              className="hover:text-blue-800 transition-all duration-200 ease-out hover:bg-zinc-200/30 p-3 h-full flex items-center"
              onClick={handleLike}>
              {isLiked ? (
                <div className="flex items-center gap-1">
                  <BiSolidHeart className="text-red-800 text-3xl" />
                  <span className="text-red-800 text-xl">Watched</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <BiHeart className="text-3xl" />
                  <span className="text-xl">Watched</span>
                </div>
              )}
            </button>
            <button
              alt="Add to watchlist"
              title="Add to watchlist"
              className="hover:text-blue-800 hover:bg-zinc-200/30 transition-all duration-200 ease-out p-3 h-full flex items-center"
              onClick={handleSave}>
              {isSaved ? (
                <div className="flex items-center gap-1">
                  <BiListCheck className="text-green-800 text-5xl" />
                  <span className="text-green-800 text-xl">Watchlist</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <BiListPlus className="text-5xl" />
                  <span className=" text-xl">Watchlist</span>
                </div>
              )}
            </button>
            <TripleStarRating
              officialRating={officialRating}
              setRequestedRating={setRequestedRating}
            />
          </div>

          {movieDetails.overview && (
            <div className="border-1">
              <span className="font-bold uppercase">Overview:&nbsp;</span>
              <span>{movieDetails.overview}</span>
            </div>
          )}

          {movieDetails.runtime && (
            <div className="border-1">
              <span className="font-bold uppercase">Runtime:&nbsp;</span>
              <span>{`${movieDetails.runtime} minutes`}</span>
            </div>
          )}

          {movieDetails.release_date && (
            <div className="border-1">
              <span className="font-bold uppercase">Year:&nbsp;</span>
              <span>{`${getReleaseYear(movieDetails.release_date)}`}</span>
            </div>
          )}

          {movieDetails.origin_country && (
            <div className="border-1">
              <span className="font-bold uppercase">Origin:&nbsp;</span>
              {movieDetails.origin_country.map((country, key) => {
                return (
                  <span key={key}>
                    <span>{`${getCountryName(country)}`}</span>
                    {/* Add a comma if it's not the last country on the list */}
                    {key !== movieDetails.origin_country.length - 1 && (
                      <span>,&nbsp;</span>
                    )}
                  </span>
                )
              })}
            </div>
          )}

          {directors.length > 0 && (
            <div className="border-1">
              <span className="font-bold uppercase">Director:&nbsp;</span>
              {directors.map((director, key) => {
                return (
                  <span key={key}>
                    <span>{`${director.name}`}</span>
                    {/* Add a comma if it's not the last country on the list */}
                    {key !== directors.length - 1 && <span>,&nbsp;</span>}
                  </span>
                )
              })}
            </div>
          )}

          {dops.length > 0 && (
            <div className="border-1">
              <span className="font-bold uppercase">D.O.P.:&nbsp;</span>
              {dops.map((dop, key) => {
                return (
                  <span key={key}>
                    <span>{`${dop.name}`}</span>
                    {/* Add a comma if it's not the last country on the list */}
                    {key !== dops.length - 1 && <span>,&nbsp;</span>}
                  </span>
                )
              })}
            </div>
          )}

          {mainCast.length > 0 && (
            <div className="border-1">
              <span className="font-bold uppercase">Main cast:&nbsp;</span>
              {mainCast.map((actor, key) => {
                return (
                  <span key={key}>
                    <span>{`${actor.name}`}</span>
                    {/* Add a comma if it's not the last country on the list */}
                    {key !== mainCast.length - 1 && <span>,&nbsp;</span>}
                  </span>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
