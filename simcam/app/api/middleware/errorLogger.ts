/**
 * Error Logging Middleware for API Routes
 * Use this to wrap API route handlers and log all errors
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/lib/logger';

export type ApiHandler = (
  req: NextRequest,
  context?: any
) => Promise<NextResponse> | NextResponse;

export function withErrorLogging(
  handler: ApiHandler,
  routeName: string
): ApiHandler {
  return async (req: NextRequest, context?: any) => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    try {
      logger.info('API', `${method} ${routeName} - Request started`, {
        url,
        method,
      });

      const response = await handler(req, context);
      const duration = Date.now() - startTime;

      // Log slow requests
      if (duration > 5000) {
        logger.warn('API', `${method} ${routeName} - Slow response`, {
          duration: `${duration}ms`,
          url,
        });
      } else {
        logger.info('API', `${method} ${routeName} - Request completed`, {
          duration: `${duration}ms`,
          status: response.status,
        });
      }

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error(
        'API',
        `${method} ${routeName} - Request failed`,
        {
          duration: `${duration}ms`,
          url,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        error instanceof Error ? error : undefined
      );

      // Log memory on error
      logger.logMemoryUsage('API_ERROR');

      // Return 500 error
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  };
}

