import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { getReleaseYear } from "../../../Utils/helperFunctions"
import { fetchFilmFromTMDB } from "../../../Utils/apiCalls"

import InteractionConsole from "../Buttons/InteractionConsole"
import { MdStars } from "react-icons/md"
import { MdPeople } from "react-icons/md"

export default function FilmTMDB_Card({ filmObject, setPage }) {
  const imgBaseUrl = "https://image.tmdb.org/t/p/original"
  const navigate = useNavigate()
  const [hoverId, setHoverId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [movieDetails, setMovieDetails] = useState({})
  const [directors, setDirectors] = useState([]) //director

  /* Fetch TMDB details for a film when it's hovered on --- might become obsolete */
  useEffect(() => {
    // console.log("Hover Id Hook triggered: ", hoverId)
    const fetchPageData = async () => {
      if (hoverId) {
        try {
          setIsLoading(true)
          const result = await fetchFilmFromTMDB(hoverId)
          const directorsList = result.credits.crew.filter(
            (crewMember) => crewMember.job === "Director"
          )
          setMovieDetails(result)
          setDirectors(directorsList)
        } catch (err) {
          console.error("Error loading film data: ", err)
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchPageData()
  }, [hoverId])

  /* Fetch TMDB details for each film card that shows up on screen */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setIsLoading(true)
        const result = await fetchFilmFromTMDB(filmObject.id)
        const directorsList = result.credits.crew.filter(
          (crewMember) => crewMember.job === "Director"
        )
        setMovieDetails(result)
        setDirectors(directorsList)
      } catch (err) {
        console.error("Error loading film data: ", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPageData()
  }, [])

  return (
    <div
      id={`film-card-${filmObject.id}`}
      className="film-item w-[20rem] sm:w-[18rem] min-w-[18rem] aspect-16/10 flex flex-col justify-center items-center md:items-start gap-0 bg-gray-200 text-black rounded-md">
      {/* Poster */}
      <div
        className="group/thumbnail overflow-hidden relative"
        onMouseEnter={() => {
          setHoverId(filmObject.id)
        }}
        onMouseLeave={() => {
          setHoverId(null)
        }}>
        <img
          id={`thumbnail-${filmObject.id}`}
          className="w-[20rem] sm:w-[18rem] min-w-[18rem] aspect-16/10 object-cover transition-all duration-300 ease-out group-hover/thumbnail:scale-[1.03]"
          src={
            filmObject.backdrop_path !== null
              ? `${imgBaseUrl}${filmObject.backdrop_path}`
              : `backdropnotfound.jpg`
          }
          alt=""
          onClick={() => {
            navigate(`/films/${filmObject.id}`)
            setPage((prevPage) => ({ ...prevPage, loadMore: false }))
          }}
        />

        {/* Laptop Interaction Console */}
        {hoverId === filmObject.id && (
          <div className="hidden sm:flex border-0 border-red-500 absolute bottom-0 left-0 w-[18rem] min-w-[18rem] aspect-16/10 object-cover bg-black/70 items-center justify-center">
            <InteractionConsole
              tmdbId={hoverId}
              directors={directors}
              movieDetails={movieDetails}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              css={{
                height: "1rem",
                textColor: "white",
                hoverBg: "none",
                hoverTextColor: "none",
                fontSize: "9px",
                likeSize: "0.9rem",
                saveSize: "1.3rem",
                starSize: "1.1rem",
                flexGap: "2px",
                likeColor: "white",
                saveColor: "white",
                likedBgColor: "oklch(44.4% 0.177 26.899)",
                savedBgColor: "oklch(44.8% 0.119 151.328)",
                buttonPadding: "0px",
                paddingTopBottom: "2px",
                paddingLeftRight: "10px",
                buttonHeight: "1.8rem",
              }}
              showOverview={true}
            />
            <div
              className="border-red-500 absolute w-full h-full z-10"
              onClick={() => {
                navigate(`/films/${filmObject.id}`)
                setPage((prevPage) => ({ ...prevPage, loadMore: false }))
              }}></div>
          </div>
        )}
      </div>

      {/* Text below poster */}
      <div className="w-full p-2 pb-0 flex justify-between sm:mb-3">
        {/* Left side - Title, year*/}
        <div className="border-amber-400 flex flex-row items-center sm:flex-col sm:items-start justify-center gap-0 ml-1">
          {/* Film Title - LAPTOP*/}
          <div className="hidden sm:block">
            <span
              onClick={() => {
                navigate(`/films/${filmObject.id}`)
                setPage((prevPage) => ({ ...prevPage, loadMore: false }))
              }}
              className="font-bold uppercase transition-all duration-200 ease-out hover:text-blue-800 text-xs">
              {`${filmObject.title.slice(0, 20)}`}
            </span>
            {filmObject.title.length >= 21 && (
              <span className="font-bold uppercase transition-all duration-200 ease-out hover:text-blue-800 text-xs">
                ...
              </span>
            )}
          </div>

          {/* Film Title - MOBILE*/}
          <div className="sm:hidden flex items-center justify-start">
            <span
              onClick={() => {
                navigate(`/films/${filmObject.id}`)
                setPage((prevPage) => ({ ...prevPage, loadMore: false }))
              }}
              className="font-bold uppercase transition-all duration-200 ease-out hover:text-blue-800 text-sm">
              {`${filmObject.title.slice(0, 17)}`}
            </span>
            {filmObject.title.length >= 17 && (
              <span className="font-bold uppercase transition-all duration-200 ease-out hover:text-blue-800 text-sm">
                ...
              </span>
            )}
            {filmObject.release_date && (
              <span className="ml-1 text-sm font-thin">
                {`${getReleaseYear(filmObject.release_date)}`}
              </span>
            )}
          </div>

          {/* Release year */}
          <div className="hidden sm:flex items-center justify-center uppercase text-sm sm:text-xs gap-1">
            {filmObject.release_date && (
              <span className="">
                {`${getReleaseYear(filmObject.release_date)}`}
              </span>
            )}
          </div>
        </div>

        {/* Right side - TMDB rating and vote count */}
        <div className="flex items-center gap-2 sm:gap-2 justify-center mr-1">
          <div className="flex items-center justify-center gap-1">
            <MdStars className="sm:text-xs text-sm" />
            <div className="text-xs">
              {Number(filmObject.vote_average).toFixed(1)}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <MdPeople className="sm:text-xs text-base" />
            <div className="text-xs">{filmObject.vote_count}</div>
          </div>
        </div>
      </div>

      <div className="md:hidden mt-[-5px] pb-4 w-full">
        <div className="p-0 pr-3 pl-3 mb-3 w-full">
          <span className="text-[10px] italic">
            {filmObject.overview?.slice(0, 55)}
          </span>
          {filmObject.overview?.length >= 55 && <span>{`...`}</span>}
        </div>
        <InteractionConsole
          tmdbId={filmObject.id}
          directors={directors}
          movieDetails={movieDetails}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          css={{
            height: "1.4rem",
            textColor: "black",
            hoverBg: "none",
            hoverTextColor: "none",
            fontSize: "10px",
            likeSize: "1.0rem",
            saveSize: "1.4rem",
            starSize: "1.2rem",
            flexGap: "0rem",
            likeColor: "white",
            saveColor: "white",
            likedBgColor: "oklch(44.4% 0.177 26.899)",
            savedBgColor: "oklch(44.8% 0.119 151.328)",
            buttonPadding: "4px",
            paddingTopBottom: "0px",
            paddingLeftRight: "10px",
            buttonHeight: "2rem",
          }}
          showOverview={false}
        />
      </div>
    </div>
  )
}

// {
//   queryString && filmObject.directors && (
//     <span className="">
//       <span className="flex gap-1 uppercase text-xs italic font-semibold">
//         {/* <span>|</span> */}
//         {filmObject.directors.map((dir, key) => {
//           return (
//             <span key={key}>
//               <span>{`${dir.name}`}</span>
//               {/* Add a comma if it's not the last country on the list */}
//               {key !== filmObject.directors.length - 1 && (
//                 <span>,</span>
//               )}
//             </span>
//           )
//         })}
//       </span>
//     </span>
//   )
// }
