import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import organizationRoutes from "./modules/organization/organization.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import workflowTemplateRoutes from "./modules/workflow/workflow-template.routes.js";
import workflowRoutes from "./modules/workflow/workflow.routes.js";
import { errorMiddleware } from "./core/middleware/error-middleware.js";
import aiRoutes from "./modules/ai/ai.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use("/organizations", organizationRoutes);
app.use("/users", userRoutes);
app.use("/workflow-templates", workflowTemplateRoutes);
app.use("/workflows", workflowRoutes);
app.use("/ai", aiRoutes);
app.use("/auth", authRoutes);

app.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "FlowPilot API is running",
  });
});

app.use(errorMiddleware);

export default app;