"use client";

import { useSyncExternalStore } from "react";
import { demoIncidents } from "@/lib/demo-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { Incident } from "@/types/incident";

import type { RealtimeChannel } from "@supabase/supabase-js";

type ConnectionState = "connecting" | "live" | "demo" | "error";

// --- Global Singleton Store for Realtime Incidents ---
// Prevents multiple WebSocket connections when useIncidents is used in multiple components.

class IncidentStore {
  private incidents: Incident[] = hasSupabaseConfig ? [] : demoIncidents;
  private connectionState: ConnectionState = hasSupabaseConfig ? "connecting" : "demo";
  private error: string | null = null;
  private listeners: Set<() => void> = new Set();
  private isSubscribed = false;
  private channel: RealtimeChannel | null = null;

  private currentSnapshot = {
    incidents: this.incidents,
    connectionState: this.connectionState,
    error: this.error,
  };

  constructor() {
    if (hasSupabaseConfig) {
      this.init();
    }
  }

  private emit() {
    this.currentSnapshot = {
      incidents: this.incidents,
      connectionState: this.connectionState,
      error: this.error,
    };
    this.listeners.forEach((listener) => listener());
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.currentSnapshot;
  };

  async init() {
    if (this.isSubscribed || !supabase) return;
    this.isSubscribed = true;

    // Initial Fetch
    const { data, error: queryError } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (queryError) {
      this.error = queryError.message;
      this.connectionState = "error";
      this.emit();
      return;
    }

    this.incidents = (data as Incident[]) ?? [];
    this.emit();

    // Setup Realtime WebSocket
    const channelName = `veil-global-feed`;
    this.channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            this.incidents = this.incidents.filter(
              (incident) => String(incident.id) !== String(payload.old.id),
            );
          } else if (payload.eventType === "INSERT") {
            const incoming = payload.new as Incident;
            this.incidents = [incoming, ...this.incidents].slice(0, 100);
          }
          this.emit();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") this.connectionState = "live";
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          this.connectionState = "error";
          this.error = "Realtime connection severed.";
        }
        this.emit();
      });
  }

  async refresh() {
    this.isSubscribed = false;
    if (this.channel) await supabase?.removeChannel(this.channel);
    await this.init();
  }
}

const store = new IncidentStore();

export function useIncidents() {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  
  return {
    ...state,
    refresh: () => store.refresh(),
  };
}
