import { createServerResponseAdapter } from "@/lib/server-response-adapter";
import { mcpHandler } from "../mcp";

export const maxDuration = 60;

const handler = (req: Request) => {
  return createServerResponseAdapter(req.signal, (res) => {
    mcpHandler(req, res);
  });
};

export { handler as GET };
export { handler as POST };
export { handler as DELETE };
