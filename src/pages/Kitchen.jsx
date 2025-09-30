import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    load();
    const ch = supabase
      .channel("realtime:orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => setOrders((o) => [payload.new, ...o])
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  async function load() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    setOrders(data || []);
  }

  async function updateStatus(o, status) {
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", o.id)
      .select()
      .maybeSingle();

    if (error) {
      alert(error.message);
      return;
    }

    setOrders((os) => os.map((x) => (x.id === o.id ? data : x)));

    if (status === "완료" && o.player_id) {
      await fetch("/api/send-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: o.player_id,
          title: "주문 준비 완료",
          message: `테이블 ${o.table_no} 주문이 준비됐습니다. 수령대로 와주세요!`,
        }),
      });
    }
  }
  return (
    <div style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h2>주방 주문 콘솔</h2>
      <button onClick={load}>새로고침</button>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {orders.map((o) => (
          <div
            key={o.id}
            style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <b>
                #{o.id.slice(0, 8)} · 테이블 {o.table_no}
              </b>
              <span>{new Date(o.created_at).toLocaleTimeString()}</span>
            </div>
            <ul>
              {o.items.map((it, i) => (
                <li key={i}>
                  {it.name} × {it.qty}
                </li>
              ))}
            </ul>
            {o.note && <p>요청: {o.note}</p>}
            <p>
              상태: <b>{o.status}</b>
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={o.status === "접수"}
                onClick={() => updateStatus(o, "접수")}
              >
                접수
              </button>
              <button onClick={() => updateStatus(o, "조리중")}>조리중</button>
              <button onClick={() => updateStatus(o, "완료")}>완료</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
