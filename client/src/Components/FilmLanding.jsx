/* Libraries */
import React, { useEffect, useState, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"

/* Custom functions */
import { getCountryName, getReleaseYear } from "../Utils/helperFunctions"
import { fetchFilmFromTMDB } from "../Utils/apiCalls"
import useCommandK from "../Hooks/useCommandK"
import { AuthContext } from "../Utils/authContext"

/* Components */
import NavBar from "./Shared/Navigation-Search/NavBar"
import LoadingPage from "./Shared/Navigation-Search/LoadingPage"
import QuickSearchModal from "./Shared/Navigation-Search/QuickSearchModal"
import InteractionConsole from "./Shared/Buttons/InteractionConsole"

import { MdSunny, MdOutlineTimelapse } from "react-icons/md"
import { IoMdCalendar, IoIosTimer } from "react-icons/io"

export default function FilmLanding() {
  const imgBaseUrl = "https://image.tmdb.org/t/p/original"
  const [isLoading, setIsLoading] = useState(false)
  const [movieDetails, setMovieDetails] = useState({})
  const [directors, setDirectors] = useState([]) //director
  const [dops, setDops] = useState([]) //director of photography
  const [mainCast, setMainCast] = useState([]) //top 5 cast
  const [backdropList, setBackdropList] = useState([])
  const [posterList, setPosterList] = useState([])
  const [trailerLink, setTrailerLink] = useState(null)

  const { authState, searchModalOpen, setSearchModalOpen } =
    useContext(AuthContext)
  const { tmdbId } = useParams()
  const navigate = useNavigate()

  function toggleSearchModal() {
    setSearchModalOpen((status) => !status)
  }
  useCommandK(toggleSearchModal)

  /* Fetch film info for Landing Page */
  useEffect(() => {
    const fetchPageData = async () => {
      if (tmdbId) {
        try {
          setSearchModalOpen(false) // close search modal if it's somehow open
          setIsLoading(true)
          const result = await fetchFilmFromTMDB(tmdbId)
          setMovieDetails(result)
        } catch (err) {
          console.error("Error loading film data: ", err)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchPageData()
  }, [tmdbId])

  useEffect(() => {
    console.log("movieDetails: ", movieDetails)
    if (movieDetails.credits) {
      const directorsList = movieDetails.credits.crew.filter(
        (crewMember) => crewMember.job === "Director"
      )
      const dopsList = movieDetails.credits.crew.filter(
        (crewMember) => crewMember.job === "Director of Photography"
      )

      const backdropList = movieDetails.images.backdrops.slice(
        0,
        Math.min(movieDetails.images.backdrops.length, 5)
      )

      const posterList = movieDetails.images.posters.slice(
        0,
        Math.min(movieDetails.images.posters.length, 5)
      )

      // Pick top 5 cast
      const mainCastList = movieDetails.credits.cast.slice(
        0,
        Math.min(5, movieDetails.credits.cast.length)
      )

      // Filter for YouTube trailers only
      const trailerLinks = movieDetails.videos.results.filter((video) => {
        return video.site === "YouTube" && video.type === "Trailer"
      })
      // Sort trailers by newest to oldest
      const sortedTrailerLinks = trailerLinks.sort((a, b) => {
        const dateA = new Date(a.published_at)
        const dateB = new Date(b.published_at)
        return dateB - dateA
      })

      setDirectors(directorsList)
      setDops(dopsList)
      setMainCast(mainCastList)
      setBackdropList(backdropList)
      setPosterList(posterList)
      if (sortedTrailerLinks.length >= 1) {
        setTrailerLink(sortedTrailerLinks[0].key) // pick newest trailer
      } else {
        setTrailerLink(null)
      }
    }
  }, [movieDetails])

  useEffect(() => {
    const landingBg = document.getElementById(`landing-bg-1`)
    const img = new Image()
    img.crossOrigin = "anonymous"

    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://image.tmdb.org/t/p/w500${movieDetails.backdrop_path}`)}`
    img.src = proxyUrl

    img.onload = () => {
      const colorThief = new ColorThief()
      let domColor
      let brightness
      try {
        domColor = colorThief.getColor(img)
        /* Check brightness of dominant color to ensure readability 
          Formula: https://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx */
        brightness = Math.round(
          Math.sqrt(
            domColor[0] * domColor[0] * 0.241 +
              domColor[1] * domColor[1] * 0.691 +
              domColor[2] * domColor[2] * 0.068
          )
        )
        /* If bg dark enough, font can be white */
        if (brightness < 130) {
          landingBg.style.backgroundColor = `rgba(${domColor[0]}, ${domColor[1]}, ${domColor[2]}, 0.85)`
          /* If bg a little light, reduce each rgb value by 33% */
        } else if (130 <= brightness < 194) {
          landingBg.style.backgroundColor = `rgba(${domColor[0] * 0.66}, ${domColor[1] * 0.66}, ${domColor[2] * 0.66}, 0.85)`
          /* If bg too light, reduce each rgb value by 66% */
        } else {
          landingBg.style.backgroundColor = `rgba(${domColor[0] * 0.33}, ${domColor[1] * 0.33}, ${domColor[2] * 0.33}, 0.85)`
        }
      } catch (err) {
        console.log(err)
      }
    }
  }, [movieDetails])

  if (!movieDetails) {
    return <div>Error loading film. Please try again.</div>
  }

  return (
    <>
      {isLoading && <LoadingPage />}

      {/* Quick Search Modal */}
      {searchModalOpen && (
        <QuickSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
        />
      )}

      {/* Landing Page content */}
      <div className="w-screen h-auto flex flex-col justify-center ">
        <div className="border-red-500 w-[100%] h-[90%] top-[5%] text-stone-200 text-[14px]">
          <NavBar />

          <div className="hidden overflow-hidden">
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

          <div className="md:hidden overflow-hidden relative">
            <img
              className="w-screen aspect-2/3 object-cover scale-[1]"
              src={
                movieDetails.backdrop_path !== null
                  ? `${imgBaseUrl}${movieDetails.backdrop_path}`
                  : `posternotfound.png`
              }
              alt=""
            />
            <div className="border-0 border-red-500 absolute top-0 left-0 h-[25rem] md:h-[15rem] w-full bg-linear-to-b from-black to-transparent"></div>
            <div className="">
              <div className="absolute top-0 left-0 h-[25rem] p-5 w-full border-0">
                {/* Title */}
                {movieDetails.title && (
                  <div className="font-black text-2xl mb-2">
                    {movieDetails.title}
                  </div>
                )}

                {/* Release Date */}
                {movieDetails.release_date && (
                  <div className="w-full flex gap-2 mb-5 text-xs font-extralight">
                    <div className="flex gap-1 items-center">
                      <IoMdCalendar />
                      <span className="">{`${getReleaseYear(movieDetails.release_date)}`}</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      <IoIosTimer />
                      <span className="">{`${movieDetails.runtime} minutes`}</span>
                    </div>
                    {/* <span className="font-black text-base">&nbsp;|&nbsp;</span> */}
                  </div>
                )}

                {/* Director name(s) */}
                {directors.length > 0 && (
                  <div className="text-xs/5 font-extralight mb-2 text-right">
                    {/* <span className="font-black text-base">|&nbsp;</span> */}
                    <span className="font-thin text-[10px] mr-0">
                      directed by
                    </span>
                    {directors.map((director, key) => {
                      return (
                        <span key={key}>
                          <span
                            className="border-b-2 border-r-2 p-[4px] pt-0 inline-block decoration-3 underline-offset-2 drop-shadow-md"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              navigate(`/directors/${director.id}`)
                            }}>{`${director.name}`}</span>
                          {/* Add a comma if it's not the last country on the list */}
                          {/* {key !== directors.length - 1 && <span>,&nbsp;</span>} */}
                        </span>
                      )
                    })}
                  </div>
                )}

                {/* Origin Country */}
                {movieDetails.origin_country &&
                  movieDetails.origin_country.length > 0 && (
                    <div className="text-xs/5 font-extralight text-right">
                      <span className="font-thin text-[10px] mr-0">origin</span>

                      {movieDetails.origin_country.map((country, key) => {
                        return (
                          <span key={key} className="whitespace-nowrap">
                            <span className="border-b-2 border-r-2 p-[4px] pt-0 inline-block decoration-3 underline-offset-2 drop-shadow-md">{`${getCountryName(country)}`}</span>
                            {/* Add a comma if it's not the last country on the list */}
                            {/* {key !== movieDetails.origin_country.length - 1 && (
                              <span className="inline-block">,&nbsp;</span>
                            )} */}
                          </span>
                        )
                      })}
                    </div>
                  )}
              </div>
            </div>
            <div className="border-0 border-red-500 absolute bottom-0 left-0 h-[20rem] md:h-[15rem] w-full bg-gradient-to-t from-black/100 to-transparent"></div>
            <div className="absolute bottom-0 w-full">
              <InteractionConsole
                tmdbId={tmdbId}
                directors={directors}
                movieDetails={movieDetails}
                setIsLoading={setIsLoading}
                css={{
                  textColor: "oklch(92.3% 0.003 48.717)",
                  hoverBg: "oklch(92% 0.004 286.32 / 0.3)",
                  hoverTextColor: "oklch(42.4% 0.199 265.638)",
                  fontSize: "14px",
                  likeSize: "1.1rem",
                  saveSize: "1.6rem",
                  starSize: "1.4rem",
                  flexGap: "0rem",
                  likeColor: "oklch(44.4% 0.177 26.899)",
                  saveColor: "oklch(44.8% 0.119 151.328)",
                  buttonPadding: "10px",
                }}
                showOverview={false}
              />
            </div>
          </div>

          {/* {backdropList.length > 0 && (
            <div className="w-full relative border-1">
              {backdropList.map((backdrop, key) => {
                return (
                  <img
                    key={key}
                    className="w-[40%] top-100 aspect-16/9 object-cover scale-[1.02]"
                    src={
                      backdrop.file_path !== null
                        ? `${imgBaseUrl}${backdrop.file_path}`
                        : `backdropnotfound.jpg`
                    }
                    alt=""
                  />
                )
              })}
            </div>
          )} */}

          <div
            id="landing-bg-1"
            className="flex flex-col items-center p-4 text-black">
            {movieDetails.overview && (
              <div className="p-4 text-xs/5">
                {/* <span className="font-bold uppercase">Overview:&nbsp;</span> */}
                <span>{movieDetails.overview}</span>
              </div>
            )}
            <img
              className="w-[80vw] aspect-2/3 object-cover scale-[1] p-5"
              src={
                movieDetails.poster_path !== null
                  ? `${imgBaseUrl}${movieDetails.poster_path}`
                  : `posternotfound.png`
              }
              alt=""
            />
          </div>

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

          {trailerLink !== null && (
            <div className="w-full aspect-square md:h-[30rem] border-15">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailerLink}`}
                title="YouTube video player"
                allowFullScreen></iframe>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
