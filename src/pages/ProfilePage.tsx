/// <reference types="@types/google.maps" />
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, MapPin, ShoppingBag, Heart, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const TABS = [
  { key: 'info', label: 'Thông tin cá nhân', icon: <User size={20} /> },
  { key: 'address', label: 'Địa chỉ giao hàng', icon: <MapPin size={20} /> },
  { key: 'orders', label: 'Đơn hàng của tôi', icon: <ShoppingBag size={20} /> },
  { key: 'wishlist', label: 'Yêu thích', icon: <Heart size={20} /> },
  { key: 'password', label: 'Đổi mật khẩu', icon: <KeyRound size={20} /> },
];

type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  is_default: boolean;
};

const mapContainerStyle = { width: '100%', height: '350px' };
const centerVN = { lat: 21.028511, lng: 105.804817 };

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    email: user?.email || '',
    avatar_url: profile?.avatar_url || '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Địa chỉ giao hàng hiện đại
  const [addresses, setAddresses] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<{
    id: string;
    label: string;
    type: string;
    full_address: string;
    lat: number | null;
    lng: number | null;
    country: string;
    is_default: boolean;
  }>({
    id: '',
    label: '',
    type: '',
    full_address: '',
    lat: null,
    lng: null,
    country: 'VN',
    is_default: false,
  });
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: 'AIzaSyC_uNLXRia9KhCkdxa8UqXRzyyEcGCt2d0', // Thay bằng API key của bạn
    libraries: ['places'],
  });

  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({ debounce: 300 });

  useEffect(() => {
    if (!user) return;
    supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .then(({ data }) => setAddresses(data || []));
  }, [user, modalOpen]);

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();
    setForm(f => ({ ...f, full_address: address }));
    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setForm(f => ({ ...f, lat, lng }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Thiết bị không hỗ trợ GPS');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(f => ({ ...f, lat: latitude, lng: longitude }));
        // @ts-ignore
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            setForm(f => ({ ...f, full_address: results[0].formatted_address }));
          }
        });
      },
      () => alert('Không lấy được vị trí GPS')
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.full_address || !form.lat || !form.lng) return alert('Vui lòng chọn địa chỉ trên bản đồ!');
    if (form.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    }
    if (form.id) {
      await supabase.from('addresses').update(form).eq('id', form.id);
    } else {
      await supabase.from('addresses').insert([{ ...form, user_id: user.id }]);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xoá địa chỉ này?')) return;
    await supabase.from('addresses').delete().eq('id', id);
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
    await supabase.from('addresses').update({ is_default: true }).eq('id', id);
    setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
  };

  const handleMapClick = (e: any) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm(f => ({ ...f, lat, lng }));
    // @ts-ignore
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        setForm(f => ({ ...f, full_address: results[0].formatted_address }));
      }
    });
  };

  // Upload avatar
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `avatars/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setMessage('Lỗi upload ảnh');
      setLoading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setAvatarUrl(data.publicUrl);
    setFormData((f) => ({ ...f, avatar_url: data.publicUrl }));
    
    // Cập nhật avatar_url vào database
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: data.publicUrl })
      .eq('id', user.id);
      
    if (updateError) {
      setMessage('Lỗi cập nhật avatar');
    } else {
      setMessage('Cập nhật avatar thành công!');
    }
    setLoading(false);
  };

  // Cập nhật thông tin cá nhân
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    const updateData: any = {
      full_name: formData.full_name,
      phone: formData.phone,
      avatar_url: formData.avatar_url,
    };
    Object.keys(updateData).forEach(
      (key) => (updateData[key] === undefined || updateData[key] === null) && delete updateData[key]
    );
    const { error } = await supabase.from('users').update(updateData).eq('id', user.id);
    setLoading(false);
    if (error) {
      setMessage(error.message || 'Cập nhật thất bại');
    } else {
      setMessage('Cập nhật thành công!');
      setIsEditing(false);
      window.location.reload();
    }
  };

  // Badge thành viên
  const badge = profile?.role === 'admin' ? 'Quản trị viên' : 'Khách hàng';
  const badgeColor = profile?.role === 'admin' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className="relative min-h-screen pt-32 pb-12 px-2 md:px-0 bg-gradient-to-br from-blue-100 via-purple-100 to-white overflow-hidden">
      {/* Hiệu ứng động 3D blob */}
      <motion.div
        className="absolute -top-32 -left-32 w-[420px] h-[420px] bg-gradient-to-br from-primary-400 via-purple-400 to-blue-400 rounded-full blur-3xl opacity-60 z-0"
        initial={{ scale: 0.8, rotate: 0, x: 0, y: 0 }}
        animate={{ 
          scale: [0.8, 1.1, 0.9, 1], 
          rotate: [0, 30, -20, 0], 
          x: [0, 40, -30, 0],
          y: [0, 20, -10, 0],
          opacity: [0.7, 0.9, 0.8, 0.7] 
        }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        style={{ filter: 'blur(80px)' }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 w-[340px] h-[340px] bg-gradient-to-br from-blue-300 via-purple-200 to-white rounded-full blur-3xl opacity-50 z-0"
        initial={{ scale: 0.7, rotate: 0, x: 0, y: 0 }}
        animate={{ 
          scale: [0.7, 1.05, 0.8, 1], 
          rotate: [0, -25, 15, 0], 
          x: [0, -30, 20, 0],
          y: [0, -15, 10, 0],
          opacity: [0.5, 0.7, 0.6, 0.5] 
        }}
        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
        style={{ filter: 'blur(60px)' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-[180px] h-[180px] bg-gradient-to-br from-purple-200 via-white to-blue-200 rounded-full blur-2xl opacity-40 z-0"
        initial={{ scale: 0.6, rotate: 0, x: 0, y: 0 }}
        animate={{ 
          scale: [0.6, 1.2, 0.8, 1], 
          rotate: [0, 15, -10, 0], 
          x: [0, 20, -10, 0],
          y: [0, 10, -5, 0],
          opacity: [0.4, 0.6, 0.5, 0.4] 
        }}
        transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut' }}
        style={{ filter: 'blur(40px)' }}
      />
      <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 mb-4 md:mb-0">
          <div className="bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="relative"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-primary-200 shadow-xl" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200 shadow-xl">
                  <User size={40} className="text-primary-400" />
                </div>
              )}
              <label className="absolute bottom-2 right-2 bg-primary-600 text-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-primary-700 transition">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm7.5-4.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0ZM12 2v2m0 16v2m10-10h-2M4 12H2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </label>
            </motion.div>
            <div className="text-center">
              <div className="text-lg font-bold text-primary-700 drop-shadow-lg">{profile?.full_name || 'Chưa cập nhật'}</div>
              <div className="text-gray-500 text-sm">{user?.email}</div>
              <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold text-white rounded-full shadow ${badgeColor}`}>{badge}</span>
            </div>
            <nav className="w-full mt-6 flex flex-col gap-2">
              {TABS.map(tab => (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm w-full text-left ${activeTab === tab.key ? 'bg-primary-600 text-white scale-105 shadow-lg' : 'bg-gray-100 text-primary-700 hover:bg-primary-50'}`}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.04 }}
                >
                  {tab.icon}
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </aside>
        {/* Main content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="bg-white rounded-2xl shadow-2xl p-8 min-h-[320px]"
            >
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-primary-700">Thông tin cá nhân</h2>
                  {message && <div className="mb-3 text-green-600 font-semibold text-center bg-green-50 rounded-lg py-2 shadow">{message}</div>}
                  <AnimatePresence>
                    {isEditing ? (
                      <motion.form
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                        onSubmit={handleSubmit}
                        className="space-y-4 max-w-lg mx-auto"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                          <input
                            type="text"
                            value={formData.full_name}
                            onChange={e => setFormData(f => ({ ...f, full_name: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 shadow-sm cursor-not-allowed"
                          />
                        </div>
                        <div className="flex gap-4 mt-6">
                          <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-semibold">
                            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                          </button>
                          <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">
                            Hủy
                          </button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                        className="space-y-4"
                      >
                        <div>
                          <span className="font-semibold text-gray-700">Họ và tên:</span> {profile?.full_name?.trim() ? profile.full_name : 'Chưa cập nhật'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Số điện thoại:</span> {profile?.phone || 'Chưa cập nhật'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Email:</span> {user?.email}
                        </div>
                        <button onClick={() => setIsEditing(true)} className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-semibold mt-4">
                          Chỉnh sửa thông tin
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {activeTab === 'address' && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                >
                  {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <MapPin size={64} className="text-primary-400 mb-4" />
                      <div className="text-lg font-semibold text-primary-600 mb-2">Bạn chưa có địa chỉ giao hàng nào</div>
                      <div className="text-gray-500 mb-4">Hãy thêm địa chỉ để thuận tiện cho việc đặt hàng!</div>
                      <button
                        onClick={() => { setModalOpen(true); setForm({ id: '', label: '', type: '', full_address: '', lat: null, lng: null, country: 'VN', is_default: false }); }}
                        className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-3 rounded-xl shadow-lg font-bold hover:scale-105 transition-all"
                      >
                        + Thêm địa chỉ mới
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-end mb-4">
                        <button onClick={() => { setModalOpen(true); setForm({ id: '', label: '', type: '', full_address: '', lat: null, lng: null, country: 'VN', is_default: false }); }} className="bg-primary-600 text-white px-4 py-2 rounded-lg shadow hover:bg-primary-700 font-semibold transition-all">
                          + Thêm địa chỉ mới
                        </button>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2">
                        {addresses.map(address => (
                          <motion.div
                            key={address.id}
                            className={`rounded-2xl shadow-xl p-6 bg-gradient-to-br from-blue-50 via-purple-50 to-white border-2 ${address.is_default ? 'border-primary-500' : 'border-gray-200'} transition-all hover:scale-105`}
                            whileHover={{ scale: 1.03, boxShadow: '0 8px 32px 0 rgba(80, 36, 255, 0.15)' }}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">
                                {address.type === 'home' ? '🏠' : address.type === 'office' ? '🏢' : address.type === 'gym' ? '🏋️' : '📍'}
                              </span>
                              <span className="font-bold text-lg text-primary-700">{address.label || address.type || 'Địa chỉ'}</span>
                              {address.is_default && (
                                <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-full">Mặc định</span>
                              )}
                            </div>
                            <div className="font-semibold text-gray-800 mb-1">{address.full_address}</div>
                            <div className="text-gray-400 text-xs mb-2">Lat: {address.lat}, Lng: {address.lng}</div>
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => { setModalOpen(true); setForm(address); }} className="px-3 py-1 rounded bg-primary-100 text-primary-700 font-semibold hover:bg-primary-200 transition">Sửa</button>
                              <button onClick={() => handleDelete(address.id)} className="px-3 py-1 rounded bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition">Xóa</button>
                              {!address.is_default && (
                                <button onClick={() => handleSetDefault(address.id)} className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition">Đặt làm mặc định</button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  <AnimatePresence>
                    {modalOpen && (
                      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.form
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.8, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                          onSubmit={handleSave}
                          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative"
                        >
                          <h3 className="text-xl font-bold mb-4 text-primary-700">{form.id ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700">Tìm kiếm địa chỉ</label>
                            <input
                              value={value}
                              onChange={e => setValue(e.target.value)}
                              disabled={!ready}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              placeholder="Nhập địa chỉ, tên đường, tòa nhà..."
                            />
                            {status === 'OK' && (
                              <div className="bg-white border rounded shadow mt-1 max-h-40 overflow-auto z-50">
                                {data.map(({ place_id, description }: any) => (
                                  <div key={place_id} className="px-3 py-2 hover:bg-primary-100 cursor-pointer" onClick={() => handleSelect(description)}>
                                    {description}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="mb-3">
                            <button type="button" onClick={handleGetCurrentLocation} className="bg-blue-100 text-blue-700 px-3 py-1 rounded shadow hover:bg-blue-200 transition-all">
                              Lấy vị trí hiện tại (GPS)
                            </button>
                          </div>
                          <div className="mb-3">
                            {isLoaded && (
                              <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={form.lat && form.lng ? { lat: form.lat, lng: form.lng } : centerVN}
                                zoom={form.lat && form.lng ? 16 : 6}
                                onClick={handleMapClick}
                              >
                                {form.lat && form.lng && (
                                  <Marker position={{ lat: form.lat, lng: form.lng }} draggable onDragEnd={handleMapClick} />
                                )}
                              </GoogleMap>
                            )}
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700">Nhãn địa chỉ (ví dụ: Nhà, Công ty...)</label>
                            <input
                              value={form.label}
                              onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                              placeholder="Nhà, Công ty, Gym..."
                            />
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700">Loại địa điểm</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                              <option value="">Chọn loại</option>
                              <option value="home">Nhà riêng</option>
                              <option value="office">Công ty</option>
                              <option value="gym">Gym</option>
                              <option value="other">Khác</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={form.is_default}
                              onChange={e => setForm(f => ({ ...f, is_default: e.target.checked }))}
                              id="is_default"
                            />
                            <label htmlFor="is_default" className="text-sm">Đặt làm mặc định</label>
                          </div>
                          <div className="flex gap-4 mt-6 justify-end">
                            <button type="button" onClick={() => setModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 font-semibold">Hủy</button>
                            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 font-semibold">
                              Lưu
                            </button>
                          </div>
                        </motion.form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-primary-700">Đơn hàng của tôi</h2>
                  <div className="text-gray-500">Tính năng này sẽ được bổ sung...</div>
                </motion.div>
              )}
              {activeTab === 'wishlist' && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-primary-700">Sản phẩm yêu thích</h2>
                  <div className="text-gray-500">Tính năng này sẽ được bổ sung...</div>
                </motion.div>
              )}
              {activeTab === 'password' && (
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                >
                  <h2 className="text-2xl font-bold mb-4 text-primary-700">Đổi mật khẩu</h2>
                  <div className="text-gray-500">Tính năng này sẽ được bổ sung...</div>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
} 