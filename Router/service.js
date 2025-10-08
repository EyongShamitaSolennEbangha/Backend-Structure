import express from 'express';
import Service from '../Models/Services.js';
import { authMiddleware, authorizeRoles } from '../Controller/authMiddleware.js';

const router = express.Router();

// CREATE SERVICE - Only providers can create services
router.post('/', authMiddleware, authorizeRoles('provider'), async (req, res) => {
  try {
    console.log('🛠️ Creating service for provider:', req.user.email);
    console.log('📦 Request body:', req.body);
    
    const {
      yourName,
      companyName,
      serviceTitle,
      category,
      startingPrice,
      location,
      experience,
      eventsCompleted,
      email,
      phone,
      profileImageUrl,
      serviceDescription,
      specialties
    } = req.body;

    // Validate required fields
    const requiredFields = ['yourName', 'companyName', 'serviceTitle', 'category', 'startingPrice', 'location', 'email', 'phone', 'serviceDescription'];
    const missingFields = requiredFields.filter(field => !req.body[field] || req.body[field].toString().trim() === '');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create new service
    const newService = new Service({
      providerId: req.user._id,
      yourName: yourName.trim(),
      companyName: companyName.trim(),
      serviceTitle: serviceTitle.trim(),
      category: category.trim(),
      startingPrice: Number(startingPrice),
      location: location.trim(),
      experience: experience ? experience.trim() : '',
      eventsCompleted: Number(eventsCompleted) || 0,
      email: email.trim(),
      phone: phone.trim(),
      profileImageUrl: profileImageUrl ? profileImageUrl.trim() : '',
      serviceDescription: serviceDescription.trim(),
      specialties: specialties ? specialties.filter(spec => spec.trim() !== '') : []
    });

    console.log('📝 Service data being saved:', newService);

    const savedService = await newService.save();
    
    console.log('✅ Service created successfully:', savedService._id);

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: savedService
    });

  } catch (error) {
    console.error('❌ Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service: ' + error.message
    });
  }
});

// GET ALL SERVICES (Public - no auth required for browsing)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { serviceTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { serviceDescription: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(filter)
      .populate('providerId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services: ' + error.message
    });
  }
});

// GET PROVIDER'S OWN SERVICES (Protected - only providers)
router.get('/my-services', authMiddleware, authorizeRoles('provider'), async (req, res) => {
  try {
    console.log('📋 Fetching services for provider:', req.user.email);
    
    const services = await Service.find({ providerId: req.user._id })
      .sort({ createdAt: -1 });

    console.log('✅ Found services:', services.length);
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('❌ Error fetching provider services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your services: ' + error.message
    });
  }
});

export default router;