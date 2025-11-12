import { useContext, useState, useRef, useEffect } from "react"
import { Link, useMatch, useResolvedPath } from "react-router-dom"
import { AuthContext } from "../../../Utils/authContext"
import { BiSearchAlt2, BiMenu, BiSolidMessageRoundedDots } from "react-icons/bi"
import { MdClose, MdMenu, MdOutlineSettings, MdSearch } from "react-icons/md"
import { TbArrowBigRightLinesFilled } from "react-icons/tb"

export default function NavBar() {
  const { authState, setAuthState, searchModalOpen, setSearchModalOpen } =
    useContext(AuthContext)

  const [menuOpened, setMenuOpened] = useState(false)
  const [settingsOpened, setSettingsOpened] = useState(false)
  const menuRef = useRef(null)
  const menuBorderBottom = useRef(null)
  const menuBorderRight = useRef(null)
  const settingsRef = useRef(null)
  const settingsBorderBottom = useRef(null)
  const settingsBorderRight = useRef(null)

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

  function openMenu() {
    setMenuOpened(true)
    // if (navModalRef.current) {
    //   navModalRef.current.classList.add("open")
    // }
  }

  function closeMenu() {
    setMenuOpened(false)
    // if (navModalRef.current) {
    //   navModalRef.current.classList.remove("open")
    // }
  }

  function openSettings() {
    setSettingsOpened(true)
  }

  function closeSettings() {
    setSettingsOpened(false)
  }

  const logOut = () => {
    localStorage.removeItem("accessToken")
    setAuthState({ username: "", id: 0, status: false })
  }

  useEffect(() => {
    if (
      menuRef.current &&
      menuBorderBottom.current &&
      menuBorderRight.current
    ) {
      let timer
      if (menuOpened) {
        timer = setTimeout(() => {
          menuRef.current.style.opacity = "1"
          menuRef.current.style.transform = "translateY(0px)"
        }, 200)

        menuBorderBottom.current.style.transform = "translateY(0px)"
        menuBorderRight.current.style.transform = "translateY(0px)"

        // menuRef.current.style.borderWidth = "3px"
      } else {
        timer = setTimeout(() => {
          menuRef.current.style.opacity = "1"
          menuRef.current.style.transform = "translateX(-190px)"
        }, 200)
        menuBorderBottom.current.style.transform = "translateX(-200px)"
        menuBorderRight.current.style.transform = "translateY(-160px)"
        // menuRef.current.style.borderWidth = "0px"
      }
      return () => {
        clearTimeout(timer)
      }
    }
  }, [menuOpened])

  useEffect(() => {
    if (
      settingsRef.current &&
      settingsBorderBottom.current &&
      settingsBorderRight.current
    ) {
      let timer
      if (settingsOpened) {
        timer = setTimeout(() => {
          settingsRef.current.style.opacity = "1"
          settingsRef.current.style.transform = "translateY(0px)"
        }, 200)

        settingsBorderBottom.current.style.transform = "translateY(0px)"
        settingsBorderRight.current.style.transform = "translateY(0px)"

        // settingsRef.current.style.borderWidth = "3px"
      } else {
        timer = setTimeout(() => {
          settingsRef.current.style.opacity = "1"
          settingsRef.current.style.transform = "translateX(190px)"
        }, 200)
        settingsBorderBottom.current.style.transform = "translateX(200px)"
        settingsBorderRight.current.style.transform = "translateY(-160px)"
        // settingsRef.current.style.borderWidth = "0px"
      }
      return () => {
        clearTimeout(timer)
      }
    }
  }, [settingsOpened])

  return (
    <div className="flex items-center justify-between w-screen p-0 md:p-3 md:pl-[2rem] md:pr-[2rem] h-[3rem] md:h-[4rem] bg-slate-950 text-white border-b-4 border-[#b8d5e5]">
      <div className="flex items-center justify-center gap-7 min-w-[12rem] ml-3">
        {/* MOBILE - APP NAME */}
        <div className="md:hidden h-full flex items-center justify-center pt-0 z-30">
          <button className="mr-1 ">
            {menuOpened ? (
              <MdClose
                className="text-xl mb-[2px]"
                onClick={() => closeMenu()}
              />
            ) : (
              <MdMenu className="text-xl mb-[2px]" onClick={() => openMenu()} />
            )}
          </button>
          <span className="text-[13px] uppercase font-black flex items-center justify-center p-1">
            The Film Atlas
          </span>
          <button
            className="flex items-center justify-center ml-2 p-[2px] pl-[10px] pr-[10px] rounded-full bg-gray-200 text-gray-600 cursor-pointer"
            onClick={() => {
              setSearchModalOpen(true)
            }}>
            <BiSearchAlt2 className="text-xs" />
          </button>
        </div>

        {/* MOBILE - HAMBURGER MENU CONTENT */}
        <div
          className="absolute z-20 top-[48px] left-0 bg-slate-950 border-[#b8d5e5] w-[calc(50vw)] h-[6.5rem] pl-5 pb-5 pt-3 transition-all ease-out duration-200 font-light"
          ref={menuRef}>
          <ul className="flex flex-col gap-2 text-[13px]">
            <CustomLink to="/map" exact={false}>
              MAP
            </CustomLink>
            <CustomLink to="/films" exact={false}>
              FILMS
            </CustomLink>
            <CustomLink to="/directors" exact={false}>
              DIRECTORS
            </CustomLink>
          </ul>
        </div>
        <div
          className="absolute w-[calc(50vw+0.4rem)] h-[0.4rem] top-[152px] left-0 bg-[#d5e5b8] z-20 transition-all ease-out duration-400"
          ref={menuBorderBottom}></div>
        <div
          className="absolute w-[0.4rem] h-[6.5rem] left-[50%] top-[48px] bg-[#e5b8d5] z-20 transition-all ease-out duration-400"
          ref={menuBorderRight}></div>

        {/* LAPTOP - APP NAME*/}
        <div className="hidden md:block h-full flex items-center justify-center pt-1">
          <span className="text-md uppercase">The Film Atlas</span>
        </div>

        {/* LAPTOP - HORIZONTAL MENU */}
        <div className="hidden md:block text-sm h-full mt-1 flex items-center gap-5">
          <ul className="flex gap-7 p-2 ">
            <CustomLink to="/map" exact={false}>
              MAP
            </CustomLink>
            <CustomLink to="/films" exact={false}>
              FILMS
            </CustomLink>
            <CustomLink to="/directors" exact={false}>
              DIRECTORS
            </CustomLink>
          </ul>
          <button
            className="flex items-center justify-center gap-1 border-0 p-1 pl-2 pr-2 rounded-full bg-gray-200 text-gray-600 cursor-pointer"
            onClick={() => {
              setSearchModalOpen(true)
            }}>
            <BiSearchAlt2 />
            {`\u2318K`}
          </button>
        </div>
      </div>

      {/* MOBILE - USER INFO / AUTH */}

      <div className="md:hidden flex items-center justify-end gap-1 mr-3 text-[13px]">
        {authState.status ? (
          <div className="h-full flex items-center justify-center">
            <span className=" p-1 flex items-center justify-center font-light">{`${authState.username}`}</span>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="p-2 font-light text-[8px] italic">
              {`log in to enjoy all features!`}
            </span>
            {/* <TbArrowBigRightLinesFilled className="text-xs mr-1" /> */}
            {/* <span className="p-1 font-bold text-[9px] italic">&rarr;</span> */}
          </div>
        )}

        {!settingsOpened ? (
          <MdOutlineSettings
            className="text-xl"
            onClick={() => openSettings()}
          />
        ) : (
          <MdClose className="text-xl" onClick={() => closeSettings()} />
        )}

        {authState.status ? (
          <div>
            <div
              className="absolute z-20 top-[48px] right-0 bg-slate-950 border-[#b8d5e5] w-[50vw] h-[2.5rem] pl-5 pb-5 pt-5 transition-all ease-out duration-200 font-light flex justify-end items-center"
              ref={settingsRef}>
              <button className="mr-5 gap-2 text-[13px]" onClick={logOut}>
                log out
              </button>
            </div>
            <div
              className="absolute w-[50vw] h-[0.4rem] top-[88px] right-0 bg-[#e5b8d5] z-20 transition-all ease-out duration-400"
              ref={settingsBorderBottom}></div>
            <div
              className="absolute w-[0.4rem] h-[2.5rem] left-[50%] top-[48px] bg-[#d5e5b8] z-20 transition-all ease-out duration-400"
              ref={settingsBorderRight}></div>
          </div>
        ) : (
          <div>
            <div
              className="absolute z-20 top-[48px] right-0 bg-slate-950 border-[#b8d5e5] w-[50vw] h-[4.8rem] pl-5 pb-5 pt-3 transition-all ease-out duration-200 font-light"
              ref={settingsRef}>
              <ul className="flex flex-col text-right mr-5 gap-2 text-[13px]">
                <CustomLink to="/login">log in</CustomLink>
                <CustomLink to="/register">register</CustomLink>
              </ul>
            </div>
            <div
              className="absolute w-[50vw] h-[0.4rem] top-[125px] right-0 bg-[#e5b8d5] z-20 transition-all ease-out duration-400"
              ref={settingsBorderBottom}></div>
            <div
              className="absolute w-[0.4rem] h-[4.8rem] left-[50%] top-[48px] bg-[#d5e5b8] z-20 transition-all ease-out duration-400"
              ref={settingsBorderRight}></div>
          </div>
        )}
      </div>

      {/* LAPTOP - USER INFO / AUTH */}
      {authState.status ? (
        <div className="hidden md:block flex items-center justify-end gap-2">
          <div className="text-black text-sm h-full flex items-center justify-center">
            <span>welcome,&nbsp;</span>
            <span className="font-bold">{`${authState.username}!`}</span>
          </div>
          <div className="font-thin text-black text-base ">|</div>
          <button className="text-black text-sm" onClick={logOut}>
            log out
          </button>
        </div>
      ) : (
        <div className="hidden md:block flex items-center justify-end gap-2">
          <CustomLink className="text-black text-sm" to="/login">
            log in
          </CustomLink>
          <div className="font-thin text-black text-base ">|</div>
          <CustomLink className="text-black text-sm" to="/register">
            register
          </CustomLink>
        </div>
      )}
    </div>
  )
}
