/**
 * EventManager - Type-safe custom event system for ESSL Server
 * Provides event registration and emission without extending EventEmitter
 */
import type { ESSLEventMap, ESSLEventName, ESSLEventCallback } from "../../types/index.js";
type EventCallback<K extends ESSLEventName> = ESSLEventCallback<K>;
export declare class EventManager {
    private callbacks;
    private debugMode;
    constructor();
    /**
     * Enable or disable debug logging
     */
    setDebugMode(enabled: boolean): this;
    /**
     * Register a callback for an event (type-safe)
     */
    on<K extends ESSLEventName>(event: K, callback: EventCallback<K>): this;
    /**
     * Remove a callback for an event (type-safe)
     */
    off<K extends ESSLEventName>(event: K, callback: EventCallback<K>): this;
    /**
     * Register a one-time callback for an event (type-safe)
     */
    once<K extends ESSLEventName>(event: K, callback: EventCallback<K>): this;
    /**
     * Emit an event to all registered callbacks (type-safe)
     */
    emit<K extends ESSLEventName>(event: K, data: ESSLEventMap[K]): boolean;
    /**
     * Get all registered events
     */
    getEvents(): ESSLEventName[];
    /**
     * Get callback count for an event
     */
    getCallbackCount(event: ESSLEventName): number;
    /**
     * Remove all callbacks for an event or all events
     */
    removeAllListeners(event?: ESSLEventName): this;
    /**
     * Get debug information about the event manager
     */
    getDebugInfo(): {
        totalEvents: number;
        events: Record<string, number>;
    };
}
export {};
//# sourceMappingURL=EventManager.d.ts.map