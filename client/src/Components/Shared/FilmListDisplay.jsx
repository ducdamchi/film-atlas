import { useEffect } from "react"
import { Link } from "react-router-dom"
import { getReleaseYear } from "../../Utils/helperFunctions"

export default function FilmListDisplay({ listOfFilmObjects }) {
  const imgBaseUrl = "https://image.tmdb.org/t/p/original"

  return (
    <div className="w-full bg-stone-900/80 text-white backdrop-blur-sm rounded-none border border-t-0 border-stone-500/80 text-white p-2">
      {listOfFilmObjects.length === 0 && (
        <div className="">No results found.</div>
      )}
      {listOfFilmObjects.length > 0 && (
        <div className="flex flex-col justify-center gap-0">
          {listOfFilmObjects.slice(0, 7).map((filmObject, key) => (
            /* Each film item */
            <Link
              key={key}
              className="film-item w-full h-[5rem] flex justify-center items-start gap-1 p-2"
              to={`/films/${filmObject.id}`}>
              {/* Backdrop */}
              <div className="group/thumbnail relative max-h-[5rem] max-w-[8rem] aspect-16/10 h-full">
                <img
                  className="h-full w-auto object-cover transition-all duration-300 ease-out group-hover/thumbnail:scale-[1.03]"
                  src={
                    filmObject.backdrop_path !== null
                      ? `${imgBaseUrl}${filmObject.backdrop_path}`
                      : `backdropnotfound.jpg`
                  }
                  alt=""
                />
              </div>

              {/* Text next to backdrop */}
              <div className="text-[0.9rem] w-full p-3">
                <span className="font-bold uppercase transition-all duration-200 ease-out peer-hover:text-blue-800">
                  {`${filmObject.title}`}
                </span>{" "}
                <br />
                {filmObject.release_date && (
                  <span className="">
                    {`${getReleaseYear(filmObject.release_date)}`}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
