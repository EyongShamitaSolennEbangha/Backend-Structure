
import Services from '../Models/Services.js';

export const createService = async (req, res) => {
  try {
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

    // Create new service
    const newService = new Service({
      providerId: req.user.id, // From authentication middleware
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
      specialties: specialties.filter(spec => spec.trim() !== ''),
      status: 'active'
    });

    await newService.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: newService
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};

export const getServices = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { status: 'active' };

    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { serviceTitle: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const services = await Service.find(filter).populate('providerId', 'name email');
    
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};