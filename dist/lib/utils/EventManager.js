/**
 * EventManager - Type-safe custom event system for ESSL Server
 * Provides event registration and emission without extending EventEmitter
 */
export class EventManager {
    constructor() {
        this.callbacks = new Map();
        this.debugMode = false;
    }
    /**
     * Enable or disable debug logging
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        return this;
    }
    /**
     * Register a callback for an event (type-safe)
     */
    on(event, callback) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function");
        }
        if (!this.callbacks.has(event)) {
            this.callbacks.set(event, []);
        }
        this.callbacks.get(event).push(callback);
        // if (this.debugMode) {
        //   console.log(`📋 Registered callback for event: ${event}`);
        // }
        return this;
    }
    /**
     * Remove a callback for an event (type-safe)
     */
    off(event, callback) {
        if (!this.callbacks.has(event)) {
            return this;
        }
        const callbacks = this.callbacks.get(event);
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
    once(event, callback) {
        const onceWrapper = (data) => {
            try {
                callback(data);
            }
            finally {
                this.off(event, onceWrapper);
            }
        };
        this.on(event, onceWrapper);
        return this;
    }
    /**
     * Emit an event to all registered callbacks (type-safe)
     */
    emit(event, data) {
        if (!this.callbacks.has(event)) {
            if (this.debugMode) {
                console.log(`⚠️ No callbacks registered for event: ${event}`);
            }
            return false;
        }
        const callbacks = this.callbacks.get(event);
        // if (this.debugMode) {
        //   console.log(
        //     `🚀 Emitting event: ${event} to ${callbacks.length} callback(s)`
        //   );
        // }
        callbacks.forEach((callback, index) => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`❌ Error in callback ${index + 1} for event '${event}':`, error.message);
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
    getEvents() {
        return Array.from(this.callbacks.keys());
    }
    /**
     * Get callback count for an event
     */
    getCallbackCount(event) {
        return this.callbacks.has(event) ? this.callbacks.get(event).length : 0;
    }
    /**
     * Remove all callbacks for an event or all events
     */
    removeAllListeners(event) {
        if (event) {
            this.callbacks.delete(event);
            if (this.debugMode) {
                console.log(`🧹 Removed all callbacks for event: ${event}`);
            }
        }
        else {
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
    getDebugInfo() {
        const info = {
            totalEvents: this.callbacks.size,
            events: {},
        };
        for (const [event, callbacks] of this.callbacks) {
            info.events[event] = callbacks.length;
        }
        return info;
    }
}
//# sourceMappingURL=EventManager.js.map