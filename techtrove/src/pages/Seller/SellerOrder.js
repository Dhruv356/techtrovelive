import React, { useEffect, useState } from "react";
import axios from "axios";
import "./sellerorder.css";

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null); // Track selected order for details modal
  const sellerId = sessionStorage.getItem("userId");

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  const toggleAddress = (orderId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const fetchSellerOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("https://techtrovelive.onrender.com/api/orders/seller-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sellerOrders = response.data.orders
        .map((order) => {
          const sellerItems = order.items.filter(item => item.sellerId === sellerId);
          if (sellerItems.length > 0) {
            return {
              ...order,
              items: sellerItems,
            };
          }
          return null;
        })
        .filter(order => order !== null);

      setOrders(sellerOrders);
    } catch (error) {
      console.error("Error fetching seller orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, productId, newStatus) => {
    try {
      const token = sessionStorage.getItem("token");

      // Ensure productId is a string
      const validProductId = typeof productId === "object" ? productId._id : productId;

      // Update order status on the backend
      await axios.put(
        `https://techtrovelive.onrender.com/api/orders/update-status/${orderId}/${validProductId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Optimistically update the local state for the specific order
      setOrders((prevOrders) => 
        prevOrders.map(order => 
          order._id === orderId
            ? {
                ...order,
                items: order.items.map(item =>
                  item.productId === validProductId
                    ? { ...item, status: newStatus }  // Update the status for this product
                    : item
                ),
              }
            : order
        )
      );

      alert("✅ Order status updated!");
    } catch (error) {
      alert("❌ Failed to update order status.");
      console.error("Order status update error:", error.response?.data || error.message);
    }
  };

  // Filter only seller-specific orders
  const filteredOrders = orders.filter(order =>
    order.items.some(item => item.sellerId && item.sellerId.toString() === sellerId)
  );

  return (
    <div className="seller-orders-container">
      <h2>📦 Manage Orders</h2>
      {loading ? (
        <p>Loading orders...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.userId?.name || "Unknown"}</td>
                <td>{order.phone}</td>
                <td>
                  <button
                    className="ord-details-btn"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>🛍️ Order Details</h3>
            <p><strong>Order ID:</strong> {selectedOrder._id}</p>
            <p><strong>Customer:</strong> {selectedOrder.userId?.name || "Unknown"}</p>
            <p><strong>Shipping Address:</strong> {selectedOrder.shippingAddress}</p>
            <p><strong>Phone:</strong> {selectedOrder.phone}</p>

            <h4>🛒 Ordered Products</h4>
            <table className="product-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item) => (
                  <tr key={item.productId}>
                    <td>
                      <img src={item.image} alt={item.name} className="product-img" />
                    </td>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <span className={`status ${item.status ? item.status.toLowerCase() : "pending"}`}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      {item.status !== "Delivered" && (
                        <select
                          value={item.status}
                          onChange={(e) =>
                            updateOrderStatus(
                              selectedOrder._id,
                              item.productId,
                              e.target.value
                            )
                          }
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button className="close-btn" onClick={() => setSelectedOrder(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
