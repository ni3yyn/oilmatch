// AddProductModal.js
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AddProductModal = ({ onClose }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const openCloudinary = () => {
    window.cloudinary.openUploadWidget(
      {
        cloudName: 'your_cloud_name',
        uploadPreset: 'your_upload_preset',
        multiple: false,
        sources: ['local', 'camera', 'url'],
        folder: 'store-products',
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          setImageUrl(result.info.secure_url);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!name || !price || !imageUrl) return;

    await addDoc(collection(db, 'products'), {
      name,
      price: parseFloat(price),
      imageUrl,
      createdAt: new Date()
    });

    onClose();
  };

  return (
    <div className="modal">
      <h3>Add New Product</h3>
      <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} />
      <input placeholder="Price" value={price} type="number" onChange={(e) => setPrice(e.target.value)} />
      <button onClick={openCloudinary}>Upload Image</button>
      {imageUrl && <img src={imageUrl} alt="Preview" width="100" />}
      <button onClick={handleSubmit}>Submit</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default AddProductModal;
