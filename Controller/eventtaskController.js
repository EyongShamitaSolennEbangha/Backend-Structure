import EventTask from "../Models/EventTask.js";

const createTask = async (TaskData) => {
  const newTask = new TaskData({
    use_id: TaskData.use_id,
    event_id: TaskData.event_id,
    task_name: TaskData.task_name,
    task_description: TaskData.task_description,
    task_status: TaskData.task_status,
  });

  const savedTask = await newTask.save();
  return savedTask;
};





export async function createnewTask(req , res) {
    try{
        const TaskData = req.body
        const newTask = await createTask(TaskData)
        res.status(201).json({
            message: "Task created successfully"
            , data: newTask
        })
    }

    catch(error){
        console.error("Error creating Task:", error)
        res.status(500).json({
            message: "Internal server error while creating Task",
            error: error.message
        })
    }
    
}




export async function allTask(req, res) {
    try{
        const Tasks = await User.find()
        res.status(200).json({
            message: "All Tasks fetched successfully",
            data: Tasks
        })
    }
    catch(error){
        console.error("Error fetching Tasks:", error);
        res.status(500).json({
            message: "Internal server error while fetching Tasks",
            error: error.message
        }) 
    }
}



export async function oneTask(req, res){
    try{
        const id  = req.params.id;
        const Task = await User.findById(id);
        if(!Event){
            res.status(404).json({
                message: "Task is found"
            })
        }
        res.status(200).json({
            message: "Task fetched successfully",
            data: Task
        })
    }

    catch(error){
        console.error("Error fetching Task:", error);
        res.status(500).json({
            message: "Internal server error while fetching Task",
            error:error.message
        })
    }
}




export async function updateTask(req,rea) {
    try{
        const id = req.params.id;
        const updateData = req.body;
        const updateTask = await User.findByIdAndUpdate(id, updateData, { new: true})
        if(!updateTask){
            res.status(404).json({
                message: "Task not Updated"
            })
        }
        res.status(200).json({
            message: "Task Updated",
            data: updateTask
        })
    }
    catch(error){
        console.error("Error updating  Task:", error)
        res.status(500).json({
            message: "Internal server error while updating Task"
        })
    }
    
}





export async function deleteTask(params) {
    try{
        const id = req.params.id;
        const deleteTask = await User.findByIdAndDelete(id)
        if(!deleteTask){
            res.status(400).json({
                message: "Task not found"

            })
        }
        res.json({
            message: "Task Deleted"
        })
    }

    catch(error){
        console.error("Error deleting Task:", error)
        res.status(500).json({
            message: "Internal server error while deleting  Task",
            error: error.message
        })
    }
    
}
