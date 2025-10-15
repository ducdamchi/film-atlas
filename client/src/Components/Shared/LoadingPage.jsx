import React from "react"
import { ColorRing } from "react-loader-spinner"

export default function LoadingPage() {
  return (
    <>
      <div className="w-screen h-screen flex flex-col items-center justify-center">
        <span>Loading...</span>
        <ColorRing
          colors={["#000000", "#404040", "#bfbfbf", "#404040", "#000000"]}
        />
      </div>
    </>
  )
}
