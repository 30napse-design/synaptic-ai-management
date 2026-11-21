import { identity } from "../../../lib/staff-server";
import { handleWorkRequest } from "../../../lib/work-request";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return handleWorkRequest(request, await identity());
}
