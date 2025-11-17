import React, { useState } from "react"

export default function TripleStarRating({
  officialRating,
  setRequestedRating,
  css,
}) {
  const [starHover, setStarHover] = useState(0) //1, 2, 3 for number of stars, 0 for not hover

  return (
    <div
      className={`flex items-center justify-center gap-1 hover:bg-[var(--hover-bg-color)] transition-all duration-200 ease-out h-full flex group`}
      style={{ "--hover-bg-color": css.hoverBg, padding: css.buttonPadding }}>
      <div
        className={`flex items-center justify-center hover:text-[var(--hover-text-color)] transition-all duration-200 ease-out`}
        style={{
          "--hover-text-color": css.hoverTextColor,
          fontSize: css.starSize,
        }}>
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
              className={`hover:text-[var(--hover-text-color)] transition-all duration-200 ease-out text-pink-600 mb-[3px]`}
              style={{
                "--hover-text-color": css.hoverTextColor,
                fontSize: css.fontSize,
              }}>
              Unrate
            </button>
          )}
        {(officialRating === 0 ||
          officialRating === undefined ||
          officialRating === null) && (
          <span
            className={` group-hover:text-[var(--hover-text-color)] mb-[3px]`}
            style={{
              "--hover-text-color": css.hoverTextColor,
              fontSize: css.fontSize,
            }}>
            Rate
          </span>
        )}
      </div>
    </div>
  )
}
