import { ImageResponse } from "next/og";

export const alt = "OneByte Steel Cabinets — steel cabinets in Dasmariñas, Cavite";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#f4eddd",
          color: "#1f3a5f",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#3a5e8c",
          }}
        >
          OneByte Steel Cabinets
        </div>
        <div style={{ marginTop: 24, fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>
          Steel Cabinets Built to Last.
        </div>
        <div style={{ marginTop: 30, fontSize: 34, color: "#3a5e8c" }}>
          Dasmariñas, Cavite · Full glass · Half glass · Metal · Wardrobes
        </div>
        <div style={{ marginTop: 44, fontSize: 36, fontWeight: 700 }}>
          Message us: +63 918 381 1094
        </div>
      </div>
    ),
    { ...size }
  );
}
