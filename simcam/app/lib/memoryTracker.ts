// Memory tracking utility for debugging leaks
export class MemoryTracker {
  private static snapshots: Map<string, { time: number; memory: NodeJS.MemoryUsage }> = new Map();
  
  static track(label: string) {
    if (typeof window === 'undefined') {
      // Server-side
      const mem = process.memoryUsage();
      this.snapshots.set(label, { time: Date.now(), memory: mem });
      
      console.log(`[MEMORY TRACK] ${label}`, {
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(mem.external / 1024 / 1024)}MB`,
        rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Client-side (browser)
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        console.log(`[MEMORY TRACK] ${label}`, {
          usedJSHeapSize: `${Math.round(mem.usedJSHeapSize / 1024 / 1024)}MB`,
          totalJSHeapSize: `${Math.round(mem.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)}MB`,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
  
  static compare(label1: string, label2: string) {
    const snap1 = this.snapshots.get(label1);
    const snap2 = this.snapshots.get(label2);
    
    if (snap1 && snap2) {
      const heapDiff = snap2.memory.heapUsed - snap1.memory.heapUsed;
      const rssDiff = snap2.memory.rss - snap1.memory.rss;
      
      console.log(`[MEMORY DIFF] ${label1} → ${label2}`, {
        heapDiff: `${heapDiff > 0 ? '+' : ''}${Math.round(heapDiff / 1024 / 1024)}MB`,
        rssDiff: `${rssDiff > 0 ? '+' : ''}${Math.round(rssDiff / 1024 / 1024)}MB`,
        duration: `${snap2.time - snap1.time}ms`,
      });
    }
  }
  
  static clear() {
    this.snapshots.clear();
  }
}
