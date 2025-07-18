import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';


function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    });
    return unsub;
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };  

  const handleCheckboxChange = async (orderId, field, value) => {
    const orderRef = doc(db, 'orders', orderId);
    try {
      await updateDoc(orderRef, { [field]: value });
    } catch (error) {
      console.error(`Failed to update ${field} for order ${orderId}:`, error);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'not_confirmed') return !order.confirmed;
    if (filter === 'confirmed') return order.confirmed && !order.delivered;
    if (filter === 'delivered') return order.delivered;
    return true;
  });

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div className="admin-dashboard">
      <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
      <h2>الطلبات</h2>
  
      <div className="filter-buttons">
        <button className="filter-buttons" onClick={() => setFilter('all')}>الكل</button>
        <button className="filter-buttons" onClick={() => setFilter('not_confirmed')}>غير مؤكدة</button>
        <button className="filter-buttons" onClick={() => setFilter('confirmed')}>مؤكدة</button>
        <button className="filter-buttons" onClick={() => setFilter('delivered')}>تم التوصيل</button>
      </div>
  
      <div className="table-container">
        <table className="order-table">
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>العنوان</th>
              <th>التركيبة</th>
              <th>الوقت</th>
              <th>✓ تم التأكيد</th>
              <th>✓ تم التوصيل</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                <td>{order.name}</td>
                <td>{order.phone}</td>
                <td>{order.address}</td>
                <td>{order.blend}</td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={order.confirmed || false}
                    onChange={(e) =>
                      handleCheckboxChange(order.id, 'confirmed', e.target.checked)
                    }
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    checked={order.delivered || false}
                    onChange={(e) =>
                      handleCheckboxChange(order.id, 'delivered', e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
                  }  

export default AdminDashboard;
