import { NextRequest } from "next/server";
import { GET as qoldiqlarGET } from "@/app/api/smart/ombor/qoldiqlar/route";

export async function GET(request: NextRequest) {
    return qoldiqlarGET(request);
}
