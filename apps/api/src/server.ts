import "dotenv/config";
import app from "./app.js";
import { autoEscalationService } from "./modules/ai/auto-escalation.service.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 FlowPilot API running on port ${PORT}`);
  autoEscalationService.start();
});