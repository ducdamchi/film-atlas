import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BiSearchAlt2 } from "react-icons/bi"

export default function QuickSearchBar({
  searchModalRef,
  searchModalInput,
  setSearchModalInput,
}) {
  const navigate = useNavigate()

  return (
    <>
      <div className="flex items-center justify-center w-full h-auto">
        <div className="relative w-full min-w-[10rem] max-w-[40rem] h-[4rem] p-2 flex items-center gap-3  bg-stone-900/80 text-white backdrop-blur-sm rounded-none border-1 border-stone-500/80">
          <BiSearchAlt2 className="border-white text-2xl ml-3 mt-1" />
          <input
            ref={searchModalRef}
            className="h-[4rem] w-full border-white focus:outline-0 input:bg-none text-xl"
            type="text"
            name="search-bar"
            autoComplete="off"
            placeholder="Quick search by title..."
            value={searchModalInput}
            onChange={(event) => {
              setSearchModalInput(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                const inputValue = event.target.value
                navigate("/", {
                  state: { searchInputFromQuickSearch: inputValue },
                })
              }
            }}></input>
        </div>
      </div>
    </>
  )
}
