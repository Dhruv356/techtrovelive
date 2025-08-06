import { useEffect, useState } from "react";
import { Container, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../Images/logo1.png";
import SearchBar from "../SeachBar/SearchBar";
import "./navbar.css";

const NavBar = () => {
  const [expand, setExpand] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userRole, setUserRole] = useState("");
  const { cartList } = useSelector((state) => state.cart);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const isLoggedIn = !!token;

  useEffect(() => {
    const role = sessionStorage.getItem("userRole");
    setUserRole(role || "");
  }, []);

  useEffect(() => {
    const scrollHandler = () => {
      setIsFixed(window.scrollY >= 100);
    };
    window.addEventListener("scroll", scrollHandler);
    return () => window.removeEventListener("scroll", scrollHandler);
  }, []);

  const handleLogout = () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      sessionStorage.removeItem(`cartList_${userId}`);
    }
    sessionStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
   <Navbar
  fixed="top"
  expanded={expand}
  expand="md"
  className={`navbar ${isFixed ? "fixed" : ""} ${expand ? "expanded" : ""}`}
>
  <Container className="navbar-container">
    <Navbar.Brand to="/">
      <img src={logo} alt="TechTrove Logo" style={{ height: "35px", width: "auto" }} />
      <Link to="/" className="navbar-link" onClick={() => setExpand(false)}>
        <span className="nav-link-label"><h2>TechTrove</h2></span>
          </Link>
        </Navbar.Brand>

        <div className="d-flex">
          <Navbar.Toggle
            aria-controls="basic-navbar-nav"
          onClick={() => setExpand(!expand)}

          >
            <span></span>
            <span></span>
            <span></span>
          </Navbar.Toggle>
        </div>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="justify-content-end flex-grow-1 pe-3">
            <SearchBar />

            <Nav.Item>
              <Link className="navbar-link" to="/shop" onClick={() => setExpand(false)}>
                <span className="nav-link-label">Products</span>
              </Link>
            </Nav.Item>

            {isLoggedIn && userRole === "seller" && (
              <Nav.Item>
                <Link className="navbar-link" to="/admin/dashboard" onClick={() => setExpand(false)}>
                  <span className="nav-link-label">Dashboard</span>
                </Link>
              </Nav.Item>
            )}

            <Nav.Item>
              <Link to="/cart" className="cart" data-num={cartList.length}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="nav-icon">
                  <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 15h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                </svg>
              </Link>
            </Nav.Item>

            {isLoggedIn && (
              <Nav.Item className="profile-dropdown">
                <Dropdown show={showDropdown} onToggle={(isOpen) => setShowDropdown(isOpen)}>
                  <Dropdown.Toggle
                    variant="link"
                    id="profile-dropdown"
                    className="navbar-link profile-dropdown-toggle"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="nav-icon">
                      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="profile-dropdown-menu">
                    <Dropdown.Item as={Link} to="/profile">Profile</Dropdown.Item>
                    <Dropdown.Item as={Link} to="/Myorders">My Orders</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav.Item>
            )}

            {!isLoggedIn && (
              <Nav.Item>
                <Link
                  to="/login"
                  className="navbar-link"
                  onClick={() => setExpand(false)}
                >
                  <span className="nav-link-label">Login</span>
                </Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
