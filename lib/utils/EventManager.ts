/**
 * EventManager - Type-safe custom event system for ESSL Server
 * Provides event registration and emission without extending EventEmitter
 */

import type {
  ESSLEventMap,
  ESSLEventName,
  ESSLEventCallback,
} from "../../types/index.js";

type EventCallback<K extends ESSLEventName> = ESSLEventCallback<K>;

export class EventManager {
  private callbacks: Map<ESSLEventName, EventCallback<any>[]>;
  private debugMode: boolean;

  constructor() {
    this.callbacks = new Map();
    this.debugMode = false;
  }

  /**
   * Enable or disable debug logging
   */
  setDebugMode(enabled: boolean): this {
    this.debugMode = enabled;
    return this;
  }

  /**
   * Register a callback for an event (type-safe)
   */
  on<K extends ESSLEventName>(event: K, callback: EventCallback<K>): this {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }

    this.callbacks.get(event)!.push(callback);

    // if (this.debugMode) {
    //   console.log(`📋 Registered callback for event: ${event}`);
    // }

    return this;
  }

  /**
   * Remove a callback for an event (type-safe)
   */
  off<K extends ESSLEventName>(event: K, callback: EventCallback<K>): this {
    if (!this.callbacks.has(event)) {
      return this;
    }

    const callbacks = this.callbacks.get(event)!;
    const index = callbacks.indexOf(callback);

    if (index > -1) {
      callbacks.splice(index, 1);

      if (this.debugMode) {
        console.log(`🗑️ Removed callback for event: ${event}`);
      }

      // Clean up empty arrays
      if (callbacks.length === 0) {
        this.callbacks.delete(event);
      }
    }

    return this;
  }

  /**
   * Register a one-time callback for an event (type-safe)
   */
  once<K extends ESSLEventName>(event: K, callback: EventCallback<K>): this {
    const onceWrapper = (data: ESSLEventMap[K]) => {
      try {
        callback(data);
      } finally {
        this.off(event, onceWrapper as EventCallback<K>);
      }
    };

    this.on(event, onceWrapper as EventCallback<K>);
    return this;
  }

  /**
   * Emit an event to all registered callbacks (type-safe)
   */
  emit<K extends ESSLEventName>(event: K, data: ESSLEventMap[K]): boolean {
    if (!this.callbacks.has(event)) {
      if (this.debugMode) {
        console.log(`⚠️ No callbacks registered for event: ${event}`);
      }
      return false;
    }

    const callbacks = this.callbacks.get(event)!;

    // if (this.debugMode) {
    //   console.log(
    //     `🚀 Emitting event: ${event} to ${callbacks.length} callback(s)`
    //   );
    // }

    callbacks.forEach((callback, index) => {
      try {
        callback(data);
      } catch (error: any) {
        console.error(
          `❌ Error in callback ${index + 1} for event '${event}':`,
          error.message
        );
        if (this.debugMode) {
          console.error(error.stack);
        }
      }
    });

    return true;
  }

  /**
   * Get all registered events
   */
  getEvents(): ESSLEventName[] {
    return Array.from(this.callbacks.keys());
  }

  /**
   * Get callback count for an event
   */
  getCallbackCount(event: ESSLEventName): number {
    return this.callbacks.has(event) ? this.callbacks.get(event)!.length : 0;
  }

  /**
   * Remove all callbacks for an event or all events
   */
  removeAllListeners(event?: ESSLEventName): this {
    if (event) {
      this.callbacks.delete(event);
      if (this.debugMode) {
        console.log(`🧹 Removed all callbacks for event: ${event}`);
      }
    } else {
      this.callbacks.clear();
      if (this.debugMode) {
        console.log(`🧹 Removed all callbacks for all events`);
      }
    }
    return this;
  }

  /**
   * Get debug information about the event manager
   */
  getDebugInfo(): { totalEvents: number; events: Record<string, number> } {
    const info = {
      totalEvents: this.callbacks.size,
      events: {} as Record<string, number>,
    };

    for (const [event, callbacks] of this.callbacks) {
      info.events[event] = callbacks.length;
    }

    return info;
  }
}
