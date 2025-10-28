import { useState, useEffect } from "react"

export default function Toggle_Two({
  state,
  setState,
  stateDetails,
  width,
  height,
}) {
  const [activeOption, setActiveOption] = useState(1)

  const getSliderTransform = () => {
    // Each option occupies 50% of the container
    // We move the slider by multiples of 50%
    const transforms = {
      1: "translate-x-0",
      2: "translate-x-[100%]",
    }
    return transforms[activeOption]
  }

  useEffect(() => {
    if (state === stateDetails[1].value) {
      setActiveOption(1)
    } else if (state === stateDetails[2].value) {
      setActiveOption(2)
    }
  }, [state])

  return (
    <div
      className="relative bg-gray-200 rounded-full"
      style={{ width: width, height: height }}>
      <div className="relative flex h-full w-full">
        {/* Slider background */}
        <div
          className={`absolute h-full bg-white rounded-full shadow-md transition-all duration-400 ease-in-out w-1/2 ${getSliderTransform()}`}
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
      </div>
    </div>
  )
}
