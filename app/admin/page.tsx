"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { socket } from "@/socket"; // path to socket.ts
import { SiteHeader } from "@/components/site-header";

export default function AdminDashboardPage() {

  useEffect(() => {
    console.log("Socket connected?", socket.connected);

    socket.on("connect", () => {
      console.log("Socket CONNECTED:", socket.id);
    });

    return () => {
      socket.off("connect");
    };
  }, []);


  useEffect(() => {
    const onNotify = (data: any) => {
      console.log("Admin notification received:", data);
      toast.info(`${data.title}: ${data.message}`);
    };

    socket.on("admin:notify", onNotify);

    return () => {
      socket.off("admin:notify", onNotify);
    };
  }, []);


  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        {/* Section: User Approvals */}
      </div>
    </>
  );
}
