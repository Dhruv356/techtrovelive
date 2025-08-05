import { useState, useEffect, Fragment } from "react";
import ShopList from "../components/ShopList";
import Banner from "../components/Banner/Banner";
import useWindowScrollToTop from "../hooks/useWindowScrollToTop";
import "../index.css";
import all from "../Images/all.jpg";
import { useLocation } from "react-router-dom";
import SidebarFilter from "../components/sidebarfiltter/Sidebarfiltter";

const Shop = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  const [allProducts, setAllProducts] = useState([]); // ✅ Dynamic Products Only
  const [filterList, setFilterList] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [filters, setFilters] = useState({
    priceRange: [0, 100000],
    brand: "",
    rating: "",
    inStock: false,
  });
  
  useWindowScrollToTop();

  // ✅ Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("https://techtrovelive.onrender.com/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch products");

        const data = await response.json();
        setAllProducts(data);
        setFilterList(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setAllProducts([]); // ✅ No fallback
        setFilterList([]);
      }
    };

    fetchProducts();
  }, []);

  // ✅ Handle search functionality
  useEffect(() => {
    if (searchQuery) {
      const searchedProducts = allProducts.filter((item) =>
        item.productName?.toLowerCase().includes(searchQuery)
      );
      setFilterList(searchedProducts);
      setActiveCategory("All");
    } else {
      setFilterList(allProducts);
    }
  }, [searchQuery, allProducts]);

  // ✅ Generate categories dynamically
  const categories = [
    "All",
    ...new Set(allProducts.map((product) =>
      typeof product.category === "string" ? product.category : "Unknown"
    )),
  ];

  // ✅ Get the first uploaded image for each category
  const categoryImages = {};
  allProducts.forEach((product) => {
    if (!categoryImages[product.category] && product.imageUrl?.trim()) {
      categoryImages[product.category] = `https://techtrovelive.onrender.com${product.imageUrl}`; // Ensure full URL
    }
  });

  // ✅ Handle category filtering
  const filterByCategory = (category) => {
    setActiveCategory(category);
    setFilterList(
      category === "All"
        ? allProducts
        : allProducts.filter((item) => item.category === category)
    );
  };

  // ✅ Handle filters from sidebar
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters); // ✅ Save new filters in state
  
    let filtered = allProducts;
  
    if (newFilters.priceRange) {
      filtered = filtered.filter(
        (item) =>
          item.price >= newFilters.priceRange[0] &&
          item.price <= newFilters.priceRange[1]
      );
    }
  
    if (newFilters.brand) {
      filtered = filtered.filter(
        (item) =>
          item.brand?.toLowerCase() === newFilters.brand.toLowerCase()
      );
    }
  
    if (newFilters.rating) {
      filtered = filtered.filter(
        (item) => item.rating >= Number(newFilters.rating)
      );
    }
  
    if (newFilters.inStock) {
      filtered = filtered.filter((item) => item.stock > 0);
    }
  
    setFilterList(filtered);
  };
  
  return (
    <Fragment>
      <Banner title="Products" />


      {/* Category Cards */}
      <section className="category-section">
        <h2 className="section-title">Browse by Category</h2>
        <div className="category-container">
          {categories.map((category) => (
            <div
              key={category}
              className={`category-card ${activeCategory === category ? "active" : ""}`}
              onClick={() => filterByCategory(category)}
            >
              <img
                src={categoryImages[category] || all} // ✅ First uploaded image or default
                alt={category}
                className="category-image"
              />
              <p className="category-name">{category}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sidebar Filters */}
      <div className="filter-container">
        <SidebarFilter onFilterChange={handleFilterChange} />
      </div>
      <div className="active-filters">
  <p>
    Showing: 
    {filters.rating && ` ${filters.rating}★ & up`}
    {filters.inStock && ` | In Stock Only`}
    {filters.priceRange && ` | ₹${filters.priceRange[0]} - ₹${filters.priceRange[1]}`}
  </p>
</div>
      {/* Product List */}
      <section className="products-section">
        <ShopList productItems={filterList} />
      </section>
    </Fragment>
  );
};

export default Shop;
