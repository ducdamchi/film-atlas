import axios from "axios"
import React, { useState } from "react"
import { BiStar, BiSolidStar, BiX } from "react-icons/bi"
import { RiDeleteBack2Fill } from "react-icons/ri"

export default function TripleStarRating({
  officialRating,
  setRequestedRating,
}) {
  const [starHover, setStarHover] = useState(0) //1, 2, 3 for number of stars, 0 for not hover

  return (
    <div className="flex items-center gap-1 hover:bg-zinc-200/30 transition-all duration-200 ease-out p-3 h-full flex">
      <div className="flex items-center hover:text-blue-800 transition-all duration-200 ease-out peer">
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
            <span className="text-4xl text-pink-600">&#10048;</span>
          ) : (
            // <BiStar className="text-3xl" />
            <span className="text-4xl">&#10048;</span>
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
            <span className="text-4xl text-pink-600">&#10048;</span>
          ) : (
            // <BiStar className="text-3xl" />
            <span className="text-4xl">&#10048;</span>
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
            <span className="text-4xl text-pink-600">&#10048;</span>
          ) : (
            // <BiStar className="text-3xl" />
            <span className="text-4xl">&#10048;</span>
          )}
        </button>
      </div>
      <div>
        {officialRating !== 0 && (
          <button
            onClick={() => {
              console.log("clicked")
              setRequestedRating(0)
            }}
            className="text-xl hover:text-blue-800 transition-all duration-200 ease-out text-pink-600">
            Un-star
          </button>
        )}
        {officialRating === 0 && <span className="text-xl">Starred</span>}
      </div>
    </div>
  )
}
