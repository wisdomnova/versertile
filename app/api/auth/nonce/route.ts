import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from '@/lib/auth/siwe';
import { sanitizeEthAddress } from '@/lib/auth/sanitize';
import type { ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/api';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');

  if (!address) {
    return NextResponse.json<ApiErrorResponse>(
      { success: false, error: 'Address parameter is required', code: 'MISSING_ADDRESS' },
      { status: 400 }
    );
  }

  try {
    const cleanAddress = sanitizeEthAddress(address);
    const nonce = generateNonce(cleanAddress);

    return NextResponse.json<ApiSuccessResponse>(
      { success: true, data: { nonce, chainId: 1 } },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Invalid address',
        code: 'INVALID_ADDRESS',
      },
      { status: 400 }
    );
  }
}
