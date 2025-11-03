import { useContext, useEffect } from "react"
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { AuthContext } from "../../Utils/authContext"

export default function NavBar() {
  const { authState, setAuthState } = useContext(AuthContext)

  function CustomLink({ to, children, exact = true, ...props }) {
    // to: URL path (e.g., "/about", "/contact")
    // children: Content inside the link (text, icons, etc.)
    // ...props: Any other props passed to the component (className, onClick, etc.)
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: exact })
    return (
      <div
        className={
          isActive
            ? "underline decoration-solid decoration-2 underline-offset-4"
            : ""
        }>
        <Link to={to} {...props}>
          {children}
        </Link>
      </div>
    )
  }

  const logOut = () => {
    localStorage.removeItem("accessToken")
    setAuthState({ username: "", id: 0, status: false })
  }

  return (
    <div className="flex items-center justify-between w-full p-3 pl-[2rem] pr-[2rem] h-[4rem]">
      <div className="h-full flex items-center justify-center">
        <span className="text-md uppercase font-semibold ">The Film Atlas</span>
      </div>

      <div className="text-sm h-full mt-1">
        <ul className="flex gap-7 p-2 ">
          {/* <CustomLink to="/">Search</CustomLink> */}

          {!authState.status ? (
            <>
              <CustomLink to="/" exact={true}>
                FILMS
              </CustomLink>
              <CustomLink to="/directors">DIRECTORS</CustomLink>
              <CustomLink to="/map">MAP</CustomLink>
              <CustomLink to="/login">LOG IN</CustomLink>
              <CustomLink to="/register">REGISTER</CustomLink>
            </>
          ) : (
            <>
              <CustomLink to="/">FILMS</CustomLink>
              <CustomLink to="/directors">DIRECTORS</CustomLink>
              <CustomLink to="/map">MAP</CustomLink>
              {/* <CustomLink to="/watchlist">WATCHLIST</CustomLink> */}

              <button onClick={logOut}>LOG OUT</button>
            </>
          )}
        </ul>
      </div>

      {authState.status && (
        <div className="text-black text-sm h-full flex items-center justify-center">
          <span>Welcome,&nbsp;</span>
          <span className="font-bold">{`${authState.username}!`}</span>
        </div>
      )}
    </div>
  )
}
