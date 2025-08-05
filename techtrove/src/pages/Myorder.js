import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../index.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const popupRef = useRef();

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Unauthorized! Please log in.");
          setLoading(false);
          return;
        }

        const response = await axios.get("https://techtrovelive.onrender.com/api/orders/my-orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrders(response.data.orders || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Close popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setSelectedOrder(null);
      }
    };

    if (selectedOrder) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectedOrder]);

  // Cancel order
  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`https://techtrovelive.onrender.com/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      alert("Order canceled successfully!");
    } catch (err) {
      alert("Failed to cancel order. Please try again.");
    }
  };

  return (
    <div className="my-orders-container">
      <h2 className="my-orders-title">🔥 My Orders</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500">No orders found.</p>
      ) : (
        <div className="order-grid">
          {orders.map((order) => (
            <div key={order?._id} className="order-card">
              <div className="order-header">
                <h3 className="order-id">
                  Order <span className="text-red">#</span>
                </h3>
                <span className={`order-status ${order?.status?.toLowerCase()}`}>
                  {order?.status}
                </span>
              </div>

              <div className="order-body">
                <div className="order-image">
                  <img
                    src={order?.items[0]?.image || "https://via.placeholder.com/100"}
                    alt={order?.items[0]?.name || "Product"}
                    className="product-image"
                  />
                </div>

                <div className="order-info">
                <p className="order-product-name">
  {order?.items[0]?.name?.split(' ').slice(0, 3).join(' ')}
</p>

                  <p className="order-date">📅 {new Date(order?.createdAt).toLocaleDateString()}</p>
                  <p className="order-total">💰 ₹{order?.totalPrice}</p>
                </div>
              </div>

              <div className="order-buttons">
                <button className="order-btn view-details-btn" onClick={() => setSelectedOrder(order)}>
                  📜 View Details
                </button>
                {order.status !== "Delivered" && (
                  <button className="order-btn cancel-btn" onClick={() => cancelOrder(order._id)}>
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔍 Order Details Modal */}
      {selectedOrder && (
        <div className="popup-overlay">
          <div className="order-details" ref={popupRef}>
            <button className="close-btn-ord" onClick={() => setSelectedOrder(null)}>❌</button>
            <h3>📜 Order Details</h3>
            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Total Price:</strong> ₹{selectedOrder.totalPrice}</p>

            <h4>🛒 Ordered Products:</h4>
            <div className="ordered-items">
              {selectedOrder.items.map((item) => (
                <div key={item.productId} className="ordered-item">
                  <div className="ordered-item-details">
                    <p className="ordered-item-name"><strong>{item.name}</strong></p>
                    <p className="ordered-item-price">💰 ₹{item.price} x {item.quantity}</p>
                    <p className="ordered-item-total">Total: ₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
