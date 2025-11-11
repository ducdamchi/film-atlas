import { useState, useEffect } from "react"

export default function Toggle_Three({
  state,
  setState,
  stateDetails,
  width,
  height,
  label,
}) {
  const [activeOption, setActiveOption] = useState(1)

  const getSliderTransform = () => {
    // Each option occupies 33.333% of the container
    // We move the slider by multiples of 33.333%
    const transforms = {
      1: "translate-x-0",
      2: "translate-x-[100%]",
      3: "translate-x-[200%]",
    }
    return transforms[activeOption]
  }

  useEffect(() => {
    if (state === stateDetails[1].value) {
      setActiveOption(1)
    } else if (state === stateDetails[2].value) {
      setActiveOption(2)
    } else if (state === stateDetails[3].value) {
      setActiveOption(3)
    }
  }, [state])

  return (
    <div className="flex items-center p-2 gap-5 w-full border-1">
      <div className="border-1 w-[7rem] flex justify-end uppercase text-sm">
        {label}
      </div>
      <div
        className={`relative bg-gray-200 rounded-full w-[${width}] h-[${height}]`}>
        <div className="relative flex w-full h-full">
          {/* Slider background */}
          <div
            className={`absolute h-full bg-white rounded-full shadow-md transition-all duration-400 ease-in-out w-1/3 ${getSliderTransform()}`}
          />

          {/* Options */}
          <button
            onClick={() => {
              setActiveOption(1)
              setState(stateDetails[1].value)
            }}
            className={`flex-1 text-center py-2 rounded-full transition-colors duration-300 z-10 flex items-center justify-center ${
              activeOption === 1 ? "text-black font-semibold" : "text-gray-600"
            }`}>
            {stateDetails[1].label}
          </button>
          <button
            onClick={() => {
              setActiveOption(2)
              setState(stateDetails[2].value)
            }}
            className={`flex-1 text-center py-2 rounded-full transition-colors duration-300 z-10 flex items-center justify-center ${
              activeOption === 2 ? "text-black font-semibold" : "text-gray-600"
            }`}>
            {stateDetails[2].label}
          </button>
          <button
            onClick={() => {
              setActiveOption(3)
              setState(stateDetails[3].value)
            }}
            className={`flex-1 text-center py-2 rounded-full transition-colors duration-300 z-10 flex items-center justify-center ${
              activeOption === 3 ? "text-black font-semibold" : "text-gray-600"
            }`}>
            {stateDetails[3].label}
          </button>
        </div>
      </div>
    </div>
  )
}
