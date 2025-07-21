import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../AdminDashboard.css';

function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [filteredStatus, setFilteredStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  
    return () => unsubscribe();
  }, []);
  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleCheckboxChange = async (id, field, currentValue = false) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { [field]: !currentValue });
    } catch (err) {
      console.error(`فشل التحديث لحقل ${field}:`, err);
    }
  };
  

  const handleDeleteOrder = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا الطلب؟')) {
      try {
        await deleteDoc(doc(db, 'orders', id));
      } catch (err) {
        console.error('فشل الحذف:', err);
        alert('حدث خطأ أثناء حذف الطلب');
      }
    }
  };

  const filteredOrders = orders.filter((order) => {
  if (filteredStatus === 'all') return true;
  if (filteredStatus === 'confirmed') return order.confirmed === true;
  if (filteredStatus === 'delivered') return order.delivered === true;
  return true;
});


  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !price || !thumbnailFile) return alert('يرجى ملء جميع الحقول المطلوبة');
    setUploading(true);
    try {
      const thumbForm = new FormData();
      thumbForm.append('file', thumbnailFile);
      thumbForm.append('upload_preset', 'product');
      const thumbRes = await axios.post('https://api.cloudinary.com/v1_1/de122nwjr/image/upload', thumbForm);
      const thumbnailUrl = thumbRes.data.secure_url;

      const uploadedImages = [];
      for (const file of additionalImages) {
        const imgForm = new FormData();
        imgForm.append('file', file);
        imgForm.append('upload_preset', 'product');
        const res = await axios.post('https://api.cloudinary.com/v1_1/de122nwjr/image/upload', imgForm);
        uploadedImages.push(res.data.secure_url);
      }

      await addDoc(collection(db, 'products'), {
        name: prodName,
        price: parseFloat(price),
        description: desc,
        thumbnail: thumbnailUrl,
        images: uploadedImages,
        createdAt: new Date()
      });

      setProdName('');
      setPrice('');
      setDesc('');
      setThumbnailFile(null);
      setAdditionalImages([]);
      setShowModal(false);
    } catch (err) {
      console.error('Upload failed', err);
      alert('فشل رفع المنتج');
    }
    setUploading(false);
  };

  return (
    <div className="admin-dashboard">
      <button className="logout-btn" onClick={handleLogout}>تسجيل الخروج</button>
      <h2>الطلبات</h2>

      <div className="filter-buttons">
        <button onClick={() => setFilteredStatus('all')}>الكل</button>
        <button onClick={() => setFilteredStatus('confirmed')}>تم التأكيد</button>
        <button onClick={() => setFilteredStatus('delivered')}>تم التوصيل</button>
      </div>

      <div className="table-container">
        <table className="order-table">
        <thead>
  <tr>
    <th>الاسم</th>
    <th>العنوان</th>
    <th>الولاية</th>
    <th>نوع التوصيل</th>
    <th>المنتجات</th>
    <th>الإجمالي</th>
    <th>الهاتف</th>
    <th>ملاحظة</th>
    <th>تم التأكيد</th>
    <th>تم التوصيل</th>
    <th>حذف</th>
  </tr>
</thead>
<tbody>
  {filteredOrders.map(order => (
    <tr key={order.id}>
      <td>{order.name}</td>
      <td>{order.address}</td>
      <td>{order.wilaya || '---'}</td>
      <td>
        {order.deliveryType === 'home' && 'المنزل'}
        {order.deliveryType === 'office' && 'مكتب البريد'}
        {!order.deliveryType && '---'}
      </td>
      <td>
        {order.cart?.map((item, i) => (
          <div key={i}>{item.name} - {item.quantity}×{item.price} DA</div>
        ))}
      </td>
      <td>{order.total} DA</td>
      <td>{order.phone}</td>
      <td>{order.note || '---'}</td>
      <td>
        <input
          type="checkbox"
          checked={!!order.confirmed}
          onChange={() => handleCheckboxChange(order.id, 'confirmed', order.confirmed)}
        />
      </td>
      <td>
        <input
          type="checkbox"
          checked={!!order.delivered}
          onChange={() => handleCheckboxChange(order.id, 'delivered', order.delivered)}
        />
      </td>
      <td>
        <button className="icon-btn delete-btn" onClick={() => handleDeleteOrder(order.id)} title="حذف الطلب">🗑</button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      <button className="add-prod-btn" onClick={() => setShowModal(true)}>➕</button>

      {showModal && (
        <div className="modal-overlay">
          <form className="modal-form" onSubmit={handleAddProduct}>
            <h3>إضافة منتج جديد</h3>
            <input
              type="text"
              placeholder="اسم المنتج"
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="السعر"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
            <textarea
              placeholder="الوصف"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
            <label>الصورة الرئيسية (thumbnail):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              required
            />
            <label>صور إضافية (اختياري):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setAdditionalImages(Array.from(e.target.files))}
            />
            <button type="submit" disabled={uploading}>
              {uploading ? 'جارِ الرفع...' : 'رفع المنتج'}
            </button>
            <button type="button" onClick={() => setShowModal(false)}>إلغاء</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
