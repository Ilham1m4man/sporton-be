import { Router } from "express";
import { initiateAdmin, signin } from "../controllers/auth.controller";

const router = Router()

router.post("/signin", signin)
router.post("/initiate-admin-user", initiateAdmin)

export default router