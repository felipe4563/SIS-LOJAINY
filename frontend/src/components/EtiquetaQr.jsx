import React from "react";

const EtiquetaQR = ({ producto }) => {
  if (!producto || !producto.codigo_qr) {
    return (
      <div style={{
        width: "40mm",
        height: "40mm",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white"
      }}>
        <span style={{ fontSize: "8px" }}>Sin datos</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "40mm",
        height: "40mm",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2mm",
        background: "white",
        boxSizing: "border-box",
        margin: "0 auto"
      }}
    >
      {/* QR */}
      <img
        src={`${import.meta.env.VITE_APP_DOMAIN}/uploads/qr/${producto.codigo_qr}`}
        alt="QR"
        style={{
          width: "32mm",
          height: "32mm",
          objectFit: "contain",
          display: "block"
        }}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' font-size='10'%3EQR no disponible%3C/text%3E%3C/svg%3E";
        }}
      />
      
      {/* Precio */}
      <div
        style={{
          fontSize: "5mm",
          fontWeight: "bold",
          marginTop: "1mm",
          textAlign: "center",
          width: "100%",
          fontFamily: "Arial, sans-serif"
        }}
      >
        Bs {parseFloat(producto.precio).toFixed(2)}
      </div>
    </div>
  );
};

export default EtiquetaQR;