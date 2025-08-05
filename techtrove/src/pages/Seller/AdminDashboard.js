         import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaUsers, FaBoxOpen, FaChartBar, FaBars, FaTimes } from "react-icons/fa";
import "./admin.css";
import { Manageuser } from "./Manageuser";
import { ManageProduct } from "./ManageProduct";
import ProductList from "./Productlist";
import SellerOrders from "./SellerOrder";
import "./admin.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("");  // Updated state name
  const navigate = useNavigate();

  useEffect(() => {
    const verifySeller = () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) throw new Error("No token found");
  
        const base64Payload = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(base64Payload));
        console.log("Decoded Token:", decodedPayload);
  
        if (decodedPayload.role !== "seller") {
          throw new Error("Unauthorized access");
        }
      } catch (error) {
        alert("Access Denied: Sellers only!");
        localStorage.clear();
        navigate("/login");
      }
    };
  
    verifySeller(); 
  
    const name = sessionStorage.getItem("userName");
    if (name) setUserName(name);
  
  }, [navigate]);
  

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Manager Panel</h2>
        </div>

        <nav>
          <ul>
            <li>
              <Link to="/admin/dashboard" className="nav-link" onClick={() => setIsOpen(false)}>
                <FaChartBar /> Dashboard
              </Link>
            </li>
            
            <li>
            <li>
              <Link to="/admin/sellerorder" className="nav-link" onClick={() => setIsOpen(false)}>
                <FaUsers /> Manage orders
              </Link>
            </li>
              <Link to="/admin/manage-products" className="nav-link" onClick={() => setIsOpen(false)}>
                <FaBoxOpen /> Manage Products
              </Link>
            </li>
            <li>
              <Link to="/admin/product-list" className="nav-link" onClick={() => setIsOpen(false)}>
                <FaBars /> Product List
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <nav className="admin-navbar">
        <h2 className="navbar-title"> Hello Seller </h2>

        </nav>

        <div className="content-area">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
          
            <Route path="manage-products" element={<ManageProduct />} />
            <Route path="product-list" element={<ProductList />} />
            <Route path="sellerorder" element={<SellerOrders />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};
// Dashboard with Orders & Revenue
const Dashboard = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const [totalProducts, setTotalProducts] = useState(0); // Keep for card

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    const fetchStats = async () => {
      try {
        const response = await axios.get("https://techtrovelive.onrender.com/api/orders/seller/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching seller stats:", error);
      }
    };

    const fetchProductCount = async () => {
      try {
        const res = await axios.get("https://techtrovelive.onrender.com/api/products/seller/count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTotalProducts(res.data.totalProducts);
      } catch (err) {
        console.error("Error fetching product count:", err);
      }
    };

    fetchStats();
    fetchProductCount();
  }, []);

  const data = {
    labels: ["Orders", "Revenue"], 
    datasets: [
      {
        label: "Statistics",
        data: [stats.totalOrders, stats.totalRevenue], 
        backgroundColor: ["#f59e0b", "#10b981"],
      },
    ],
  };

  return (
    <div>
      <h1 className="page-title">Seller Dashboard</h1>
      <div className="grid-container">
        <Card title="Total Orders" number={stats.totalOrders} icon={<FaBoxOpen />} />
        <Card title="Total Revenue" number={`₹${stats.totalRevenue}`} icon={<FaChartBar />} />
        <Card title="Total Products" number={totalProducts} icon={<FaBars />} /> {/* ✅ Card remains */}
      </div>

      {/* Chart Section */}
      <div className="chart-container">
        <Bar data={data} />
      </div>
    </div>
  );
};

// Card Component
const Card = ({ title, number, icon }) => (
  <div className="card">
    <div className="card-icon">{icon}</div>
    <h3 className="card-title">{title}</h3>
    <p className="card-number">{number}</p>
  </div>
);

export default AdminDashboard;
