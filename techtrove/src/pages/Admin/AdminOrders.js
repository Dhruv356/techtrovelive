import React, { useEffect, useState } from "react";
import axios from "axios";
import "./adminorder.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // ✅ selected order for modal

  useEffect(() => {
    fetchAdminOrders();
  }, []);

  const fetchAdminOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("https://techtrovelive.onrender.com/api/orders/admin-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.orders);
    } catch (error) {
      console.error("Error fetching admin orders:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-orders-container">
      <h2>📊 Admin Order Management</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <div className="orders-table-wrapper">
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Price</th>
                  <th>Order Date</th>
                  <th>Status</th>
                  <th>Actions</th> {/* ✅ View button */}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id}</td>
                    <td>{order.userId?.name || "Unknown"}</td>
                    <td>₹{order.totalPrice}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>{order.status}</span>
                    </td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ✅ Order Detail Modal */}
      {selectedOrder && (
  <div
    className="order-modal"
    onClick={() => setSelectedOrder(null)} // ✅ close on background click
  >
    <div
      className="order-modal-content"
      onClick={(e) => e.stopPropagation()} // ✅ prevent modal click from closing
    >
      <h3>Order Details</h3>
      <p><strong>Order ID:</strong> {selectedOrder._id}</p>
      <p><strong>Customer:</strong> {selectedOrder.userId?.name}</p>
      <p><strong>Email:</strong> {selectedOrder.userId?.email}</p>
      <p><strong>Phone:</strong> {selectedOrder.phone}</p>
      <p><strong>Shipping:</strong> {selectedOrder.shippingAddress}</p>
      <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</p>
      <p><strong>Status:</strong> {selectedOrder.status}</p>
      <p><strong>Placed On:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>

      <h4>Items:</h4>
      <ul className="order-items-list">
      {selectedOrder.items.map((item, i) => (
  <li key={i}>
    <p><strong>{item.name}</strong></p>
    <p>Qty: {item.quantity}</p>
    <p>Price: ₹{item.price}</p>
    <p>Total: ₹{item.price * item.quantity}</p>

    {/* ✅ Seller Info */}
    {item.productId?.sellerId ? (
      <div style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#555" }}>
        <p><strong>Seller:</strong> {item.productId.sellerId.name}</p>
        <p><strong>Email:</strong> {item.productId.sellerId.email}</p>
      </div>
    ) : (
      <p style={{ color: "gray" }}>Seller info not available</p>
    )}
  </li>
))}

      </ul>

      <h4>Total: ₹{selectedOrder.totalPrice}</h4>

      <button className="close-btn" onClick={() => setSelectedOrder(null)}>
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminOrders;
