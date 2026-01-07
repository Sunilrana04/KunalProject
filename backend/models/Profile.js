import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  age: { 
    type: Number, 
    required: [true, 'Age is required'],
    min: [18, 'Age must be at least 18'],
    max: [100, 'Age cannot exceed 100']
  },
  height: { 
    type: String, 
    required: [true, 'Height is required'] 
  },
  complexion: {
    type: String,
    enum: ['Fair', 'Medium', 'Wheatish', 'Olive', 'Dark'],
    required: [true, 'Complexion is required']
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'] 
  },
  imageUrl: { 
    type: String, 
    required: [true, 'Main image is required'] 
  },
  galleryImages: {
    type: [String],
    validate: {
      validator: function(images) {
        return images.length <= 5;
      },
      message: 'Cannot upload more than 5 gallery images'
    }
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  contactInfo: { 
    type: String, 
    required: [true, 'Contact information is required'] 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  contactClicks: { 
    type: Number, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Profile', profileSchema);