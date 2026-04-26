import { NextResponse } from "next/server";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export function successResponse<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

export function errorResponse(message = "Something went wrong", status = 500) {
  return NextResponse.json<ApiResponse<null>>(
    {
      success: false,
      message,
      data: null,
    },
    { status },
  );
}
