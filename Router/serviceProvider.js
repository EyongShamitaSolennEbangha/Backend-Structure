import e, { Router } from "express";
import { createServiceProvider, allServiceProvider, oneServiceProvider,updateServiceProvider,deleteServiceProvider } from "../Controller/serviceproviderController.js";

const servicerRouter = Router();

servicerRouter.post('/serviceprovider', createServiceProvider)
servicerRouter.get('/', allServiceProvider)
servicerRouter.get('/:id',oneServiceProvider)
servicerRouter.put('/:id',updateServiceProvider)
servicerRouter.delete('/:id',deleteServiceProvider )




export default servicerRouter