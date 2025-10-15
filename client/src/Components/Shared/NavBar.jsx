import { useContext, useEffect } from "react"
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { AuthContext } from "../../Utils/authContext"

export default function NavBar() {
  const { authState, setAuthState } = useContext(AuthContext)

  function CustomLink({ to, children, ...props }) {
    // to: URL path (e.g., "/about", "/contact")
    // children: Content inside the link (text, icons, etc.)
    // ...props: Any other props passed to the component (className, onClick, etc.)
    const resolvedPath = useResolvedPath(to)
    const isActive = useMatch({ path: resolvedPath.pathname, end: true })
    return (
      <div className={isActive ? "active" : ""}>
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
    <div>
      <ul className="flex gap-5 p-2 border-1">
        {/* <CustomLink to="/">Search</CustomLink> */}

        {!authState.status ? (
          <>
            <CustomLink to="/login">Log In</CustomLink>
            <CustomLink to="/register">Register</CustomLink>
          </>
        ) : (
          <>
            <CustomLink to="/">Home</CustomLink>
            <button onClick={logOut}>Log Out</button>
          </>
        )}
      </ul>
    </div>
  )
}
