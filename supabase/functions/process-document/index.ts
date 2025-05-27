
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { RequestHandler } from './request-handler.ts';

serve(async (req) => {
  const handler = new RequestHandler();
  return await handler.handleRequest(req);
});
