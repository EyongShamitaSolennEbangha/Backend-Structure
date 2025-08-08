import event from '../Models/Event.js'
import Notification  from '../Models/Notification.js'



const createNot = async(NotiData)=>{

    const newNoti = new Noti({
        user_id:NotiData.user_id,
        Notification_type:NotiData.Notification_type,
        Notification_message:NotiData.Notification_message
   

    })
    
    const savedNotification = await Notification.save()
    return savedNotification
}                       

export default { createNot }