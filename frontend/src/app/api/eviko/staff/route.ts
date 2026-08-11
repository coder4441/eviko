import { NextRequest, NextResponse } from "next/server";
import { GET as staffGET, POST as staffPOST } from "@/app/api/staff/route";

export async function GET(request: NextRequest) {
    return staffGET(request);
}

export async function POST(request: NextRequest) {
    return staffPOST(request);
}
