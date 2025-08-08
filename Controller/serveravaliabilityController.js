import ServiceProAvaliabilty from '../Models/ServiceProAvaliabity.js'


const createavailability = async(availabilityData)=>{
    const newData = new Availabile({
        service_provider_id: availabilityData.service_provider_id,
        availability_date: availabilityData.availability_date,
        availability_time: availabilityData.availability_time
    })

    const savedavailability = await savedavailability.save()
    return savedavailability
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










