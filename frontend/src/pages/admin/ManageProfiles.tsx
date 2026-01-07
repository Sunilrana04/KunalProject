import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, Edit3, Trash2, X, Star, Upload, Save, CheckCircle, 
  Image as ImageIcon, Camera, AlertCircle, Loader2 
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import type { Profile } from '../../types';
import { LOCATIONS, COMPLEXIONS } from '../../constants';

const ManageProfiles: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<Partial<Profile> | null>(null);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [mainPreview, setMainPreview] = useState<string>('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const mainInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfiles();
    if (searchParams.get('new') === 'true') {
      handleAddNew();
      setSearchParams({});
    }
  }, [searchParams]);

  const loadProfiles = async () => {
    try {
      const data = await apiService.getProfiles();
      setProfiles(data);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    }
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter(p => 
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    );
  }, [profiles, searchTerm]);

  const handleAddNew = () => {
    setCurrentProfile({
      name: '',
      age: 18,
      height: "5'4\"",
      complexion: 'Medium',
      location: LOCATIONS[0],
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
      galleryImages: [],
      description: '',
      contactInfo: '',
      isFeatured: false,
      contactClicks: 0,
      createdAt: new Date().toISOString()
    });
    setMainPreview('');
    setGalleryPreviews([]);
    setMainImageFile(null);
    setGalleryFiles([]);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleEdit = (profile: Profile) => {
    setCurrentProfile({ ...profile });
    setMainPreview(profile.imageUrl);
    setGalleryPreviews(profile.galleryImages || []);
    setMainImageFile(null);
    setGalleryFiles([]);
    setErrorMessage(null);
    setIsEditing(true);
  };

  const proceedDelete = async (id: string) => {
    try {
      await apiService.deleteProfile(id);
      await loadProfiles();
      setDeletingId(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
      setErrorMessage("Could not delete profile. Please try again.");
    }
  };

  const handleMainPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainPreview(reader.result as string);
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + galleryPreviews.length > 6) {
      setErrorMessage('Maximum 6 gallery images allowed');
      return;
    }

    setIsProcessingImage(true);
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setGalleryFiles(prev => [...prev, ...files]);
          setGalleryPreviews(prev => [...prev, ...newPreviews]);
          setIsProcessingImage(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProfile) return;

    const formData = new FormData();
    formData.append('name', currentProfile.name || '');
    formData.append('age', (currentProfile.age || 18).toString());
    formData.append('height', currentProfile.height || '');
    formData.append('complexion', currentProfile.complexion || 'Medium');
    formData.append('location', currentProfile.location || LOCATIONS[0]);
    formData.append('description', currentProfile.description || '');
    formData.append('contactInfo', currentProfile.contactInfo || '');
    formData.append('isFeatured', String(currentProfile.isFeatured || false));

    if (mainImageFile) {
      formData.append('mainImage', mainImageFile);
    }

    galleryFiles.forEach(file => {
      formData.append('galleryImages', file);
    });

    setErrorMessage(null);
    setIsSaving(true);
    try {
      if (currentProfile._id) {
        await apiService.updateProfile(currentProfile._id, formData);
      } else {
        await apiService.createProfile(formData);
      }
      await loadProfiles();
      setIsEditing(false);
      setCurrentProfile(null);
      setMainImageFile(null);
      setGalleryFiles([]);
      setMainPreview('');
      setGalleryPreviews([]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to save profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 sm:pt-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 md:mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Manage Profiles</h1>
          <p className="text-sm md:text-base text-gray-500">Edit, add or remove profile listings.</p>
        </div>
        <button
          type="button"
          onClick={handleAddNew}
          className="bg-rose-500 text-white px-6 md:px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-600 shadow-lg shadow-rose-100 w-full lg:w-auto justify-center transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Profile
        </button>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-rose-500 outline-none text-sm md:text-base transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-xs md:text-sm font-medium text-gray-500">
            Total listings: <span className="font-bold text-gray-900">{filteredProfiles.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProfiles.map(profile => (
                <tr key={profile._id} className={`transition-all duration-300 ${deletingId === profile._id ? 'bg-red-50/80 scale-[0.99]' : 'hover:bg-rose-50/10'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={profile.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0" alt={profile.name} />
                      <div>
                        <p className="font-bold text-sm md:text-base text-gray-900">{profile.name}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">{profile.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-xs md:text-sm font-medium text-gray-600">{profile.age} yrs • {profile.height}</p>
                      <p className="text-[10px] md:text-xs text-gray-400">{profile.complexion} Complexion</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      {profile.isFeatured ? (
                        <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm">
                          <Star className="w-3 h-3 fill-current" />
                          FEATURED
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-[10px] font-bold">
                          STANDARD
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right min-w-[160px]">
                    <div className="flex justify-end gap-2">
                      {deletingId === profile._id ? (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-3">
                          <button
                            type="button"
                            onClick={() => proceedDelete(profile._id)}
                            className="px-3 py-2 bg-red-600 text-white text-[10px] font-black rounded-lg hover:bg-red-700 shadow-lg flex items-center gap-1 active:scale-90"
                          >
                            <Trash2 className="w-3 h-3" />
                            CONFIRM
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(null)}
                            className="px-3 py-2 bg-white border border-gray-200 text-gray-600 text-[10px] font-black rounded-lg hover:bg-gray-50 active:scale-90"
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(profile)}
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingId(profile._id)}
                            className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-90"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for adding/editing */}
      {isEditing && currentProfile && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col animate-in zoom-in duration-300">
            <div className="p-6 md:p-8 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-serif font-bold text-gray-900">
                {currentProfile.name ? 'Edit Profile' : 'New Listing'}
              </h2>
              <button type="button" onClick={() => setIsEditing(false)} className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all">
                <X className="w-7 h-7" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 md:p-10">
              {errorMessage && (
                <div className="mb-8 p-5 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <p className="text-sm font-bold">{errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-4 space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Main Identity Image</label>
                    <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-gray-100">
                      <img
                        src={mainPreview || currentProfile.imageUrl}
                        className={`w-full h-full object-cover transition-opacity ${isProcessingImage ? 'opacity-50' : 'opacity-100'}`}
                        alt="Main"
                      />
                      <button
                        type="button"
                        onClick={() => mainInputRef.current?.click()}
                        className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/20 hover:bg-black/40 transition-all opacity-100 sm:opacity-0 sm:hover:opacity-100"
                      >
                        {isProcessingImage ? (
                          <Loader2 className="w-10 h-10 animate-spin" />
                        ) : (
                          <>
                            <Camera className="w-10 h-10 mb-2" />
                            <span className="font-bold text-xs uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                    <input type="file" ref={mainInputRef} className="hidden" accept="image/*" onChange={handleMainPhotoUpload} />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                      Gallery Photos ({galleryPreviews.length}/6)
                    </label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {galleryPreviews.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border-2 border-gray-100">
                          <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx + 1}`} />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {galleryPreviews.length < 6 && (
                        <button
                          type="button"
                          disabled={isSaving || isProcessingImage}
                          onClick={() => galleryInputRef.current?.click()}
                          className="aspect-square rounded-xl border-2 border-dashed border-rose-200 bg-rose-50 flex flex-col items-center justify-center text-rose-500 hover:bg-rose-100 transition-all disabled:opacity-50"
                        >
                          {isProcessingImage ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        </button>
                      )}
                    </div>
                    <input type="file" ref={galleryInputRef} className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                  </div>

                  <div className={`flex items-center gap-3 p-5 rounded-3xl border ${currentProfile.isFeatured ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-100'}`}>
                    <input
                      type="checkbox"
                      id="isFeatured"
                      className="w-6 h-6 rounded-lg accent-amber-500 cursor-pointer"
                      checked={currentProfile.isFeatured || false}
                      onChange={(e) => setCurrentProfile({ ...currentProfile, isFeatured: e.target.checked })}
                    />
                    <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 cursor-pointer flex-1">
                      Feature this profile
                    </label>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Name</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500 outline-none"
                        value={currentProfile.name || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Location</label>
                      <select
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500 outline-none"
                        value={currentProfile.location || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, location: e.target.value })}
                      >
                        {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Age</label>
                      <input
                        type="number"
                        required
                        min="18"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500"
                        value={currentProfile.age || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, age: parseInt(e.target.value) || 18 })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Height</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500"
                        value={currentProfile.height || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, height: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Contact</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500"
                        value={currentProfile.contactInfo || ''}
                        onChange={(e) => setCurrentProfile({ ...currentProfile, contactInfo: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Complexion</label>
                    <div className="flex flex-wrap gap-3">
                      {COMPLEXIONS.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrentProfile({ ...currentProfile, complexion: c })}
                          className={`px-6 py-3 rounded-xl text-xs font-bold border transition-all ${
                            currentProfile.complexion === c ? 'bg-rose-500 text-white' : 'bg-white border-gray-100 text-gray-500'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bio</label>
                    <textarea
                      rows={5}
                      required
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                      value={currentProfile.description || ''}
                      onChange={(e) => setCurrentProfile({ ...currentProfile, description: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={isSaving || isProcessingImage}
                      className="flex-1 bg-gray-900 text-white py-5 rounded-3xl font-black text-lg hover:bg-rose-500 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-6 h-6" />}
                      {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-12 py-5 bg-gray-100 text-gray-500 rounded-3xl font-bold hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-[150] bg-gray-900 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <span className="font-black text-sm uppercase tracking-widest">Success</span>
        </div>
      )}
    </div>
  );
};

export default ManageProfiles;