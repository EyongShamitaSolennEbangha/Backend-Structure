import Eventvenue from '../Models/Eventvenue.js'



const createnewEventvenue = async(venueData)=>{

    const newVenue = new Venue({
        venue_name: venueData.venue_name,
        venue_address: venueData.venue_address,
        venue_capcity: venueData.venue_capcity
    })

    const savedVenue = await Venue.save()
    return savedVenue
}

export default { createnewEventvenue }