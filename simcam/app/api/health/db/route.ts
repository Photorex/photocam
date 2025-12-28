import { NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectMongoDB();
    
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    if (dbState !== 1) {
      return NextResponse.json({ 
        status: "error", 
        mongodb: "disconnected",
        state: dbState,
        stateText: getStateText(dbState)
      }, { status: 500 });
    }
    
    // Get connection pool info if available
    let poolInfo = {};
    try {
      const client = mongoose.connection.getClient();
      if (client && client.topology) {
        poolInfo = {
          poolSize: client.topology.s?.pool?.totalConnectionCount || 0,
          availableConnections: client.topology.s?.pool?.availableConnectionCount || 0
        };
      }
    } catch (poolError) {
      console.error('Error getting pool info:', poolError);
    }
    
    return NextResponse.json({ 
      status: "ok", 
      mongodb: "connected",
      state: dbState,
      stateText: "connected",
      ...poolInfo,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    console.error("Database health check error:", error);
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

