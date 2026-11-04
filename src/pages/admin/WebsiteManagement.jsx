import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { HiOutlineCheck, HiOutlineX, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/config';
import FormBuilderTab from './components/FormBuilderTab';

const WebsiteManagement = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', caption: '', category: 'Other', image: null });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const res = await API.get('/website/applications');
        setApplications(res.data.applications);
      } else if (activeTab === 'reviews') {
        const res = await API.get('/website/reviews');
        setReviews(res.data.reviews);
      } else if (activeTab === 'gallery') {
        const res = await API.get('/website/gallery');
        setGalleryImages(res.data.images);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, type) => {
    try {
      if (type === 'application') {
        await API.put(`/website/applications/${id}/status`, { status: action });
        setApplications(applications.map(app => app._id === id ? { ...app, status: action } : app));
        toast.success(`Application ${action}`);
      } else {
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        await API.put(`/website/reviews/${id}/status`, { status: newStatus });
        setReviews(reviews.map(rev => rev._id === id ? { ...rev, status: newStatus } : rev));
        toast.success(`Review ${action}d`);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      await API.delete(`/website/reviews/${id}`);
      setReviews(reviews.filter(rev => rev._id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  const handleUploadGallery = async (e) => {
    e.preventDefault();
    if (!uploadForm.image) return toast.error('Please select an image');
    
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('caption', uploadForm.caption);
    formData.append('category', uploadForm.category);
    formData.append('image', uploadForm.image);

    try {
      const res = await API.post('/website/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGalleryImages([res.data.image, ...galleryImages]);
      setUploadModalOpen(false);
      setUploadForm({ title: '', caption: '', category: 'Other', image: null });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Upload failed');
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await API.delete(`/website/gallery/${id}`);
      setGalleryImages(galleryImages.filter(img => img._id !== id));
      toast.success('Image deleted');
    } catch (err) {
      toast.error('Failed to delete image');
    }
  };

  const handleToggleGalleryStatus = async (id) => {
    try {
      const res = await API.put(`/website/gallery/${id}/toggle`);
      setGalleryImages(galleryImages.map(img => img._id === id ? res.data : img));
      toast.success('Status updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Website Management</h2>
          <p>Manage volunteer applications and reviews from the website</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('applications')}
        >
          Volunteer Applications
        </button>
        <button 
          className={`btn ${activeTab === 'pageConfig' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('pageConfig')}
        >
          Volunteer Page Config
        </button>
        <button 
          className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reviews')}
        >
          Website Reviews
        </button>
        <button 
          className={`btn ${activeTab === 'gallery' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery Images
        </button>
        <Link 
          to="/admin/magazines"
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
        >
          Magazines & Publications &rarr;
        </Link>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="page-loader"><div className="loading-spinner"></div></div>
        ) : activeTab === 'applications' ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class/School</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? applications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <p style={{ fontWeight: 600 }}>{app.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.location}</p>
                    </td>
                    <td>
                      <p>{app.school}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.className}</p>
                    </td>
                    <td>{app.department}</td>
                    <td>{app.contact}</td>
                    <td>
                      <span className={`status-badge ${app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-btn" onClick={() => { setSelectedApp(app); setViewModalOpen(true); }} title="View Details" style={{ color: 'var(--primary)' }}>
                          <HiOutlineEye />
                        </button>
                        <button className="icon-btn edit" onClick={() => handleAction(app._id, 'Approved', 'application')} title="Approve">
                          <HiOutlineCheck />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleAction(app._id, 'Rejected', 'application')} title="Reject">
                          <HiOutlineX />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" className="text-center">No applications found</td></tr>}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'reviews' ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Review</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? reviews.map(rev => (
                  <tr key={rev._id}>
                    <td style={{ fontWeight: 600 }}>{rev.name}</td>
                    <td>{rev.review}</td>
                    <td>{rev.rating} / 5</td>
                    <td>
                      <span className={`status-badge ${rev.status === 'Approved' ? 'success' : rev.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {rev.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {rev.status === 'Pending' && (
                          <button className="icon-btn edit" onClick={() => handleAction(rev._id, 'approve', 'review')} title="Approve Review">
                            <HiOutlineCheck />
                          </button>
                        )}
                        {rev.status !== 'Rejected' && (
                          <button className="icon-btn delete" onClick={() => handleAction(rev._id, 'reject', 'review')} title="Reject Review">
                            <HiOutlineX />
                          </button>
                        )}
                        <button className="icon-btn delete" onClick={() => handleDeleteReview(rev._id)} title="Delete Review Permanently" style={{ color: 'red' }}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="text-center">No reviews found</td></tr>}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'gallery' ? (
          <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
              <button className="btn btn-primary" onClick={() => setUploadModalOpen(true)}>+ Add Image</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
              {galleryImages.length > 0 ? galleryImages.map(img => (
                <div key={img._id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', overflow: 'hidden', background: '#fff' }}>
                  <img src={`${BASE_URL}${img.imageUrl}`} alt={img.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '1rem' }}>
                    <h4 style={{ margin: '0 0 0.5rem' }}>{img.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{img.category}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`status-badge ${img.isActive ? 'success' : 'danger'}`}>
                        {img.isActive ? 'Active' : 'Hidden'}
                      </span>
                      <div>
                        <button className="icon-btn edit" onClick={() => handleToggleGalleryStatus(img._id)} title="Toggle Visibility">
                          <HiOutlineEye />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDeleteGallery(img._id)} title="Delete Image" style={{ color: 'red' }}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : <p>No images found in gallery.</p>}
            </div>
          </div>
        ) : activeTab === 'pageConfig' ? (
          <FormBuilderTab />
        ) : null}
      </div>

      {/* View Application Modal */}
      {viewModalOpen && selectedApp && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="close-btn" onClick={() => { setViewModalOpen(false); setSelectedApp(null); }}>&times;</button>
            </div>
            <div className="modal-body" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {Object.entries(selectedApp).map(([key, value]) => {
                  if (['_id', 'createdAt', 'updatedAt', '__v', 'status'].includes(key) || !value) return null;
                  
                  const isLongText = key === 'reason' || typeof value === 'string' && value.length > 50;
                  const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                  
                  return (
                    <div key={key} style={{ gridColumn: isLongText ? '1 / -1' : 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ display: 'block', textTransform: 'capitalize', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.4rem' }}>{formattedKey}</strong> 
                      {typeof value === 'string' && value.startsWith('http') ? (
                        <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'none' }}>Open Link &rarr;</a>
                      ) : (
                        <div style={{ color: '#0f172a', fontSize: '0.95rem', lineHeight: '1.5', wordBreak: 'break-word' }}>{value}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Gallery Modal */}
      {uploadModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Gallery Image</h3>
              <button className="close-btn" onClick={() => setUploadModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleUploadGallery} className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input type="text" className="form-control" required value={uploadForm.title} onChange={e => setUploadForm({...uploadForm, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select className="form-control" value={uploadForm.category} onChange={e => setUploadForm({...uploadForm, category: e.target.value})}>
                  <option value="Education">Education</option>
                  <option value="Creative Learning">Creative Learning</option>
                  <option value="Community">Community</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Caption</label>
                <textarea className="form-control" value={uploadForm.caption} onChange={e => setUploadForm({...uploadForm, caption: e.target.value})}></textarea>
              </div>
              <div className="form-group">
                <label>Image File *</label>
                <input type="file" className="form-control" accept="image/*" required onChange={e => setUploadForm({...uploadForm, image: e.target.files[0]})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setUploadModalOpen(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteManagement;
