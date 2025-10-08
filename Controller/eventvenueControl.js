import Eventvenue from "../Models/Eventvenue.js";

const createnewEventvenue = async (venueData) => {
  const newVenue = new Eventvenue({
    venuename: venueData.venuename,
    venueaddress: venueData.venueaddress,
    venuecapacity: venueData.venuecapacity,
  });

  const savedVenue = await newVenue.save();
  return savedVenue;
};

export default { createnewEventvenue };
