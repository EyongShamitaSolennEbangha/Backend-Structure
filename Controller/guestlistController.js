import event from '../Models/Event.js'
import Guestlist from '../Models/Guestlist.js'



const createnewList= async(listData)=>{

    const newList = new List({
        
        event_id:listData.event_id,
        guest_name:listData.guest_name,
        guest_email: listData.guest_email,
        rsvp_status: listData.rsvp_status

    })

    const savedList = await List.save()
    return savedList
}

export default { createnewList }