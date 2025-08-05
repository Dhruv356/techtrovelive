import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./checkout.css";
import { useDispatch } from "react-redux";
import { clearCart } from "../app/features/cart/cartSlice";


const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get cart items & total price from navigation state
  const cartItems = location.state?.cartList || [];
  const buyNowItem = location.state?.orderItems || []; // 👈 Handles "Buy Now" case
  const subTotal = location.state?.totalPrice || buyNowItem.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    city: "",
    state: "",
    paymentMethod: "COD",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  // Fetch user details from profile API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("https://techtrovelive.onrender.com/api/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          address: userData.address || "",
          phone: userData.phoneNumber || "",
        }));
      } catch (error) {
        console.error("Error fetching user profile", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Get final items to checkout (cart + buy-now)
  const finalCheckoutItems = cartItems.length > 0 ? cartItems : buyNowItem;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (finalCheckoutItems.length === 0) {
      alert("No items in cart!");
      return;
    }

    const token = sessionStorage.getItem("token");
    if (!token) {
      alert("Please log in to place an order!");
      return;
    }

    const shippingCharge = subTotal > 500 ? 0 : 40;
    const tax = subTotal * 0.18;
    const totalPrice = subTotal + shippingCharge + tax;

    const orderDetails = {
      name: formData.name,
      address: formData.address,
      phone: formData.phone,
      paymentMethod: formData.paymentMethod,
      cartItems: finalCheckoutItems.map((item) => ({
        productId: item._id || item.productId,
        name: item.productName || item.name,
        price: item.price,
        qty: item.qty,
        imgUrl: item.imageUrl?.startsWith("/uploads")
          ? `https://techtrovelive.onrender.com${item.imageUrl}`
          : item.imgUrl || "/fallback-image.jpg",
      })),
      totalPrice,
    };

    if (formData.paymentMethod === "Online") {
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // ✅ Razorpay demo key (works without login)
        amount: Math.round(totalPrice * 100),
        currency: "INR",
        name: "TechTrove",
        description: "Demo Payment",
        handler: async function (response) {
          try {
            setLoading(true);

            const updatedOrderDetails = {
              ...orderDetails,
              razorpayPaymentId: response.razorpay_payment_id,
            };

            await axios.post("https://techtrovelive.onrender.com/api/orders", updatedOrderDetails, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            dispatch(clearCart());
            alert("✅ Payment Successful & Order Placed!");
            navigate("/myorders");
          } catch (err) {
            console.error("❌ Order not saved:", err);
            setError("Payment success but order failed to save.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: "test@example.com",
          contact: formData.phone,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    }

    // COD order
    try {
      setLoading(true);
      await axios.post("https://techtrovelive.onrender.com/api/orders", orderDetails, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });

      dispatch(clearCart());
      alert("🎉 COD Order Placed Successfully!");
      navigate("/myorders");
    } catch (error) {
      console.error("❌ COD Order Error:", error);
      setError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  // Shipping & Tax Logic
  const shippingCharge = subTotal > 500 ? 0 : 40; // Free shipping over ₹500
  const tax = subTotal * 0.18; // 18% GST
  const totalPrice = subTotal + shippingCharge + tax;
  return (
    <div className="checkout-wrapper">
      {/* Checkout Form */}
      <div className="checkout-container checkout-form">
        <h2>Checkout</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
          </div>
          <div>
            <label>Phone:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div>
            <label>City:</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} required />
          </div>
          <div>
            <label>State:</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} required />
          </div>
          <div>
            <label>Payment Method:</label>
            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange}>
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div className="checkout-container order-summary">
        <h3>Order Summary</h3>
        {finalCheckoutItems.length > 0 ? (
          finalCheckoutItems.map((item) => (
            <div key={item.productId || item._id} className="order-item">
              <img
                src={
                  item.imageUrl?.startsWith("/uploads")
                    ? `https://techtrovelive.onrender.com${item.imageUrl}`
                    : item.imgUrl || "https://via.placeholder.com/150"
                }
                alt={item.productName || item.name}
                width="100"
              />
              <p>
                {item.productName || item.name} - ₹{item.price} x {item.qty}
              </p>
            </div>
          ))
        ) : (
          <p>No items in cart</p>
        )}
        <div className="order-total-checkout">
          <p>Subtotal: ₹{subTotal}</p>
          <p>Shipping: ₹{shippingCharge === 0 ? "Free" : shippingCharge}</p>
          <p>Tax (18%): ₹{tax.toFixed(2)}</p>
          <hr />
          <h3>Total: ₹{totalPrice.toFixed(2)}</h3>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
