import { Router, type IRouter } from "express";
import healthRouter from "./health";
import studentsRouter from "./students";
import authRouter from "./auth";
import staffRouter from "./staff";
import attendanceRouter from "./attendance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(studentsRouter);
router.use(authRouter);
router.use(staffRouter);
router.use(attendanceRouter);

export default router;

