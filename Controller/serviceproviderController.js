import User from "../Models/ServiceProvider.js";
import { hash } from "bcrypt";

const craeteServiceProvider = async (serviceData) => {
  const hashedPassword = await hash(serviceData.password, 10);
  const newServiceProvider = new User({
    user_id: serviceData.user_id,
    serviceType: serviceData.serviceType,
    description: serviceData.description,
    provile_pic: serviceData.provile_pic,
    rating: serviceData.rating,
  });

  const savedServiceProvider = await newServiceProvider.save();
  return savedServiceProvider;
};

export async function createServiceProvider(req, res) {
    try{
        const serviceData = req.body;
        const newServiceProvider = await createServiceProvider(serviceData)
        res.status(201).json({
            message: "Service Provider created successfullu",
            data: newServiceProvider
        })
    }
    catch(error){
        console.error("Error creating service provider:", error);
        res.status(500).json({
            message: "Internal server error while creating service provider",
            error: error.message

        })
    }
    
}


export async function allServiceProvider(req, res) {
    try{
        const ServiceProvider = await User.find()
        res.status(200).json({
            message: "All Service Providers fetched successfully",
            data: ServiceProvider
        })
    }
    catch(error){
        console.error("Error fetching service providers:", error);
        res.status(500).json({
            message: "Internal server error whiile fetching service providers",
            error: error.message
        })
    }
}


export async function oneServiceProvider(req, res){
    try{
        const id  = req.params.id;
        const ServiceProvider = await User.findById(id);
        if(!ServiceProvider){
            res.status(404).json({
                message: "Service provider not found"
            })
        }
    }

    catch(error){
        console.error("Error fetching service provider:", error);
        res.status(500).json({
            message: "Internal server error while fetching service  provider",
            error:error.message
        })
    }
}


export async function updateServiceProvider(req,rea) {
    try{
        const id = req.params.id;
        const updateData = req.body;
        const updateServiceProvider = await User.findByIdAndUpdate(id, updateData, { new: true})
        if(!updateServiceProvider){
            res.status(404).json({
                message: "Service provider not found"
            })
        }
        res.status(200).json({
            message: "Service provider updated successfully"
        })
    }
    catch(error){
        console.error("Error updating service provider:", error)
        res.status(500).json({
            message: "Internal server error while updating service provider",
            error: error.message
        })
    }
    
}

export async function deleteServiceProvider(params) {
    try{
        const id = req.params.id;
        const deleteServiceProvider = await User.findByIdAndDelete(id)
        if(!deleteServiceProvider){
            res.status(400).json({
                message: "Service provider not found"

            })
        }
        res.status(200).json({
            message: "Service provider deleted successfully",
            data: deleteServiceProvider
        })
    }

    catch(error){
        console.error("Error deleting sercive provider:", error)
        res.status(500).json({
            message: "Internal server erroe while deleting service provider",
            error: error.message
        })
    }
    
}

export default { craeteServiceProvider }


