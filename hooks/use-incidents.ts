"use client";

import { useCallback, useEffect, useState } from "react";
import { demoIncidents } from "@/lib/demo-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { Incident } from "@/types/incident";

type ConnectionState = "connecting" | "live" | "demo" | "error";

export function useIncidents() {
  const [incidents, setIncidents] = useState<Incident[]>(
    hasSupabaseConfig ? [] : demoIncidents,
  );
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    hasSupabaseConfig ? "connecting" : "demo",
  );
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    if (!supabase) return;

    const { data, error: queryError } = await supabase
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (queryError) {
      setError(queryError.message);
      setConnectionState("error");
      return;
    }

    setIncidents((data as Incident[]) ?? []);
    setError(null);
  }, []);

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    void loadIncidents();

    // Use a unique channel name to avoid collisions when React remounts
    const channelName = `veil-incidents-${Math.random().toString(36).slice(2, 11)}`;
    const channel = client
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        (payload) => {
          setIncidents((current) => {
            if (payload.eventType === "DELETE") {
              return current.filter(
                (incident) => String(incident.id) !== String(payload.old.id),
              );
            }

            const incoming = payload.new as Incident;
            const withoutExisting = current.filter(
              (incident) => String(incident.id) !== String(incoming.id),
            );

            return [incoming, ...withoutExisting]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime(),
              )
              .slice(0, 100);
          });
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setConnectionState("live");
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setConnectionState("error");
          setError("Realtime connection could not be established.");
        }
      });

    return () => {
      void client.removeChannel(channel);
    };
  }, [loadIncidents]);

  return {
    incidents,
    connectionState,
    error,
    refresh: loadIncidents,
  };
}
