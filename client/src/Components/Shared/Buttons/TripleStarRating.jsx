import React, { useState } from "react"

export default function TripleStarRating({
  officialRating,
  setRequestedRating,
  css,
}) {
  const [starHover, setStarHover] = useState(0) //1, 2, 3 for number of stars, 0 for not hover

  return (
    <div
      className={`flex items-center gap-1 hover:${css.hoverBg} transition-all duration-200 ease-out p-3 h-full flex group`}>
      <div
        className={`flex items-center text-${css.starSize} hover:${css.hoverTextColor} transition-all duration-200 ease-out`}>
        <button
          onMouseEnter={() => {
            setStarHover(1)
          }}
          onMouseLeave={() => {
            setStarHover(0)
          }}
          onClick={() => {
            setRequestedRating(1)
          }}>
          {starHover >= 1 || officialRating >= 1 ? (
            // <BiSolidStar className="text-3xl text-amber-400" />
            <span className={`text-pink-600`}>&#10048;</span>
          ) : (
            // <BiStar className="text-3xl" />
            <span className={``}>&#10048;</span>
          )}
        </button>
        <button
          onMouseEnter={() => {
            setStarHover(2)
          }}
          onMouseLeave={() => {
            setStarHover(0)
          }}
          onClick={() => {
            setRequestedRating(2)
          }}>
          {starHover >= 2 || officialRating >= 2 ? (
            // <BiSolidStar className="text-3xl text-amber-400" />
            <span className={` text-pink-600`}>&#10048;</span>
          ) : (
            // <BiStar className="text-3xl" />
            <span className={``}>&#10048;</span>
          )}
        </button>
        <button
          onMouseEnter={() => {
            setStarHover(3)
          }}
          onMouseLeave={() => {
            setStarHover(0)
          }}
          onClick={() => {
            setRequestedRating(3)
          }}>
          {starHover === 3 || officialRating >= 3 ? (
            // <BiSolidStar className="text-3xl text-amber-400" />
            <span className={` text-pink-600`}>&#10048;</span>
          ) : (
            // <BiStar className="text-3xl" />
            <span className={``}>&#10048;</span>
          )}
        </button>
      </div>
      <div>
        {officialRating !== 0 &&
          officialRating !== undefined &&
          officialRating !== null && (
            <button
              onClick={() => {
                setRequestedRating(0)
              }}
              className={`text-${css.fontSize} hover:${css.hoverTextColor} transition-all duration-200 ease-out text-pink-600`}>
              Unrate
            </button>
          )}
        {(officialRating === 0 ||
          officialRating === undefined ||
          officialRating === null) && (
          <span
            className={`text-${css.fontSize} group-hover:${css.hoverTextColor}`}>
            Rate
          </span>
        )}
      </div>
    </div>
  )
}
