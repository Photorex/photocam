// EXAMPLE: Enhanced health check with detailed logging
// Replace route.ts with this for maximum visibility

import { NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import mongoose from 'mongoose';
import { logger } from '@/app/lib/logger';

export async function GET() {
  const startTime = Date.now();
  
  try {
    logger.info('HEALTH_CHECK', 'Database health check started');
    
    // Log memory before DB check
    logger.logMemoryUsage('HEALTH_CHECK');
    
    await connectMongoDB();
    
    const dbState = mongoose.connection.readyState;
    const duration = Date.now() - startTime;
    
    if (dbState !== 1) {
      logger.error('HEALTH_CHECK', 'Database not connected', {
        state: dbState,
        stateText: getStateText(dbState),
        duration: `${duration}ms`,
      });
      
      return NextResponse.json({ 
        status: "error", 
        mongodb: "disconnected",
        state: dbState,
        stateText: getStateText(dbState)
      }, { status: 500 });
    }
    
    // Get connection pool info
    let poolInfo: { poolSize?: number; availableConnections?: number } = {};
    try {
      const client = mongoose.connection.getClient();
      const topology = (client as any).topology;
      if (topology && topology.s && topology.s.pool) {
        poolInfo = {
          poolSize: topology.s.pool.totalConnectionCount || 0,
          availableConnections: topology.s.pool.availableConnectionCount || 0
        };
        
        // Warn if pool is nearly exhausted
        if (poolInfo.availableConnections !== undefined && poolInfo.availableConnections < 10) {
          logger.warn('HEALTH_CHECK', 'Connection pool running low', poolInfo);
        }
      }
    } catch (poolError) {
      logger.error('HEALTH_CHECK', 'Error getting pool info', {
        error: poolError instanceof Error ? poolError.message : 'Unknown'
      });
    }
    
    logger.info('HEALTH_CHECK', 'Database health check passed', {
      duration: `${duration}ms`,
      ...poolInfo,
    });
    
    return NextResponse.json({ 
      status: "ok", 
      mongodb: "connected",
      state: dbState,
      stateText: "connected",
      ...poolInfo,
      timestamp: new Date().toISOString()
    }, { status: 200 });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.critical('HEALTH_CHECK', 'Database health check failed', {
      duration: `${duration}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined);
    
    // Log memory on critical error
    logger.logMemoryUsage('HEALTH_CHECK_ERROR');
    
    return NextResponse.json({ 
      status: "error", 
      mongodb: "error",
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function getStateText(state: number): string {
  switch (state) {
    case 0: return 'disconnected';
    case 1: return 'connected';
    case 2: return 'connecting';
    case 3: return 'disconnecting';
    default: return 'unknown';
  }
}

