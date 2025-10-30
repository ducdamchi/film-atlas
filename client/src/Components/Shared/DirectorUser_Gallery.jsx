import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getReleaseYear } from "../../Utils/helperFunctions"
import { group } from "d3"

export default function DirectorUser_Gallery({
  listOfDirectorObjects,
  sortDirection,
  sortBy,
  // queryString,
}) {
  const imgBaseUrl = "https://image.tmdb.org/t/p/original"
  const navigate = useNavigate()
  const [groupedDirectors, setGroupedDirectors] = useState([])
  const [hoverId, setHoverId] = useState(null)

  useEffect(() => {
    /* User reduce() to group list of films by year */
    if (listOfDirectorObjects) {
      // console.log(sortBy)
      if (sortBy === "name") {
        const directorGroups = listOfDirectorObjects.reduce(
          (groups, director) => {
            let targetKey //the key to be used for each Group Object
            let groupName //the name to be displayed for each Group Object in HTML

            if (!director.name) {
              console.error("Director's Name not found.")
              return groups
            }
            targetKey = director.name.slice(0, 1)

            if (!groups[targetKey]) {
              groups[targetKey] = {}
              groups[targetKey].directors = []
            }
            groups[targetKey].directors.push(director)
            return groups
          },
          {}
        )
        console.log("before sorting: ", directorGroups)

        /* Convert grouped list to array and sort based on sortDirection */
        let sortedDirectorGroups
        if (directorGroups) {
          sortedDirectorGroups = Object.entries(directorGroups)
            .map(([key, value]) => ({
              key,
              ...value,
            }))
            .sort((a, b) => {
              return sortDirection === "desc" ? b - a : a - b
            })

          sortedDirectorGroups = Object.entries(directorGroups).sort(
            ([a], [b]) => {
              const scoreA = parseInt(a)
              const scoreB = parseInt(b)
              return sortDirection === "desc"
                ? scoreB - scoreA
                : scoreA - scoreB
            }
          )
        }
        console.log("after sorting: ", sortedDirectorGroups)

        const finalArray = []
        for (const group of sortedDirectorGroups) {
          finalArray.push(group[0])
          for (const director of group[1].directors) {
            finalArray.push(director)
          }
        }

        setGroupedDirectors(finalArray)
      } else if (sortBy == "score") {
        const directorGroups = listOfDirectorObjects.reduce(
          (groups, director) => {
            let targetKey //the key to be used for each Group Object
            let groupName //the name to be displayed for each Group Object in HTML

            if (!director.WatchedDirectors.score) {
              console.error("Director's Score not found.")
              return groups
            }
            //director.score is a float number (max 4 digits, max 2 decimal points) written as a string. First, split() the string, which will return two parts, the integer and the decimal points. Then, use the integer part as the targetKey
            const splits = director.WatchedDirectors.score.split(".")
            targetKey = splits[0]

            if (!groups[targetKey]) {
              groups[targetKey] = {}
              groups[targetKey].directors = []
              // groups[targetKey].groupName = ""
            }
            groups[targetKey].directors.push(director)
            // groups[targetKey].groupName = groupName
            return groups
          },
          {}
        )
        console.log("before sorting: ", directorGroups)

        /* Convert grouped list to array and sort based on sortDirection */
        let sortedDirectorGroups
        if (directorGroups) {
          sortedDirectorGroups = Object.entries(directorGroups).sort(
            ([a], [b]) => {
              const scoreA = parseInt(a)
              const scoreB = parseInt(b)
              return sortDirection === "desc"
                ? scoreB - scoreA
                : scoreA - scoreB
            }
          )
        }
        console.log("after sorting: ", sortedDirectorGroups)

        const finalArray = []
        for (const group of sortedDirectorGroups) {
          finalArray.push(group[0])
          for (const director of group[1].directors) {
            finalArray.push(director)
          }
        }

        setGroupedDirectors(finalArray)
      }
    }
  }, [listOfDirectorObjects, sortBy, sortDirection])
  // console.log(listOfDirectorObjects)

  /* Avg_rating: total stars / total films watched. max value = 3
  watchScore: use logarithm function that rewards a director when a user watches multiple films from them. max value = 1 (when user watches 10 or more films, watchScore = 1) 
  finalScore: max(avg_rating) = 3; max(watchScore) = 1; multiply avg_rating by 2 (max 6); multiply watchScore by 4 (max 4). This will achieve a score on a scale of 10, where avg_rating has 60% weight, and num_watched_films has 40% weight.*/

  return (
    <div>
      {listOfDirectorObjects.length === 0 && (
        <div className="mt-10">No directors found.</div>
      )}

      {listOfDirectorObjects.length > 0 && groupedDirectors !== undefined && (
        <div className="grid grid-cols-4 gap-2 mt-10 border-0">
          {groupedDirectors.map((groupObject, key) => {
            if (typeof groupObject === "string") {
              return (
                <div
                  key={key}
                  className="font-bold text-6xl flex items-center justify-center border-0 w-[7rem] aspect-4/5 min-w-[5rem] animate-[spin-y_7s_linear_infinite] [transform-style:preserve-3d] text-shadow-lg">
                  {groupObject}
                </div>
              )
            } else {
              return (
                <div
                  key={key}
                  className="flex flex-col gap-1 items-center justify-center border-0 w-[7rem] aspect-4/5 group/thumbnail">
                  <div
                    className="relative aspect-4/5 overflow-hidden w-[85%] min-w-[5rem] border-3 rounded-none  flex justify-center items-center"
                    onMouseEnter={() => {
                      setHoverId(key)
                    }}
                    onMouseLeave={() => {
                      setHoverId(null)
                    }}>
                    <img
                      className="object-cover w-full transition-all duration-300 ease-out group-hover/thumbnail:scale-[1.03] grayscale transform  brightness-110"
                      src={
                        groupObject.profile_path !== null
                          ? `${imgBaseUrl}${groupObject.profile_path}`
                          : `profilepicnotfound.jpg`
                      }
                    />
                    {hoverId === key && (
                      <div className="absolute text-xs w-full h-full bg-black/60 text-white p-1 flex flex-col justify-center items-start">
                        <span>
                          {`Watched: ${groupObject.WatchedDirectors.num_watched_films}`}
                        </span>

                        <span>
                          {`Score: ${groupObject.WatchedDirectors.score}`}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs italic border-0 text-center">
                    {groupObject.name}
                  </div>
                </div>
              )
            }
          })}
        </div>
      )}
    </div>
  )
}

// <div
//   key={`${groupKey}`}
//   className="grid grid-cols-3 gap-6 border-1">
//   <div className="font-bold text-5xl border-1 flex items-center justify-center">
//     {groupObject.key}
//   </div>

//   {groupObject.directors.map((directorObject, directorKey) => (
//     /* Each film item */
//     <div
//       key={directorKey}
//       className="relative aspect-square overflow-hidden w-[7rem] min-w-[5rem] border-3 rounded-none">
//       <img
//         className="object-cover w-full transition-all duration-300 ease-out group-hover/thumbnail:scale-[1.03] grayscale transform -translate-y-1/10 z-10 brightness-110"
//         src={
//           directorObject.profile_path !== null
//             ? `${imgBaseUrl}${directorObject.profile_path}`
//             : `profilepicnotfound.jpg`
//         }
//       />
//     </div>
//   ))}
// </div>

/* Right side - director's photo*/
// {
//   queryString && directorObject.directors && (
//     <div className=" border-amber-400 flex items-center gap-1 justify-center">
//       {directorObject.directors.map((dir, key) => {
//         return (
//           <img
//             className="max-w-[3.5rem] aspect-square object-cover rounded-full grayscale"
//             key={key}
//             src={
//               dir.profile_path !== null
//                 ? `${imgBaseUrl}${dir.profile_path}`
//                 : "profilepicnotfound.jpg"
//             }
//           />
//         )
//       })}
//     </div>
//   )
// }

/* Release year & Director's name */
{
  /* <div className="flex items-center uppercase text-sm gap-1">
  {directorObject.release_date && (
    <span className="">{`${getReleaseYear(directorObject.release_date)}`}</span>
  )}
  {queryString && directorObject.directors && (
    <span className="">
      <span className="flex gap-1">
        <span>|</span>
        {directorObject.directors.map((dir, key) => {
          return (
            <span key={key}>
              <span>{`${dir.name}`}</span>
              
              {key !== directorObject.directors.length - 1 && <span>,</span>}
            </span>
          )
        })}
      </span>
    </span>
  )}
</div> */
}
