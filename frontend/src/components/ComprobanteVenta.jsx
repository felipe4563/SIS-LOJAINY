import React, { forwardRef } from "react";
import logoImg from "/logo.png";

const ComprobanteVenta = forwardRef(({ venta }, ref) => {
  if (!venta) return null;

  const {
    id_venta,
    fecha,
    metodo_pago,
    total,
    detalles = [],
    nombre_usuario
  } = venta;

  // Datos de redes sociales
  const redesSociales = {
    tiktok: "@boutique.lojainy",
    whatsapp: "+591 64925359"
  };

  // Formatear fecha
  const formatearFecha = (fechaString) => {
    return new Date(fechaString).toLocaleString('es-BO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear moneda
  const formatearMoneda = (valor) => `Bs ${Number(valor).toFixed(2)}`;

  return (
    <div ref={ref} className="print-container">
      <style jsx>{`
        @media print {
          @page { 
            size: 80mm auto; 
            margin: 0; 
            padding: 0; 
          }
          body * { 
            visibility: hidden; 
          }
          .ticket-container, .ticket-container * { 
            visibility: visible; 
          }
          .ticket-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 80mm; 
          }
          * { 
            color: #000 !important; 
            background-color: transparent !important; 
          }
        }

        .ticket-container {
          font-family: 'Courier New', monospace;
          width: 80mm; 
          padding: 3mm; /* Reducido para aprovechar espacio */
          box-sizing: border-box; 
          color: #000; 
          background: #fff;
          font-weight: 600; /* Más grueso para mejor legibilidad */
        }

        .header { 
          text-align: center; 
          margin-bottom: 5px; 
        }
        .logo { 
          width: 110px; /* AUMENTADO DE 95px a 110px */
          height: auto;
          display: block; 
          margin: 0 auto 4px; 
          max-width: 100%;
        }
        .title { 
          font-size: 22px; /* Aumentado de 18px */
          font-weight: 900; 
          margin: 2px 0; 
          text-transform: uppercase;
          letter-spacing: 0.8px;
          line-height: 1.2;
        }
        .subtitle { 
          font-size: 16px; /* Aumentado de 14px */
          font-weight: bold; 
          margin-bottom: 8px; 
          border-bottom: 2px solid #000; /* Más grueso */
          padding-bottom: 4px; 
          display: block; /* Cambiado de inline-block */
          width: 100%;
        }
        .divider { 
          border-top: 3px solid #000; /* Más grueso */
          margin: 6px 0; 
          width: 100%; 
        }
        .light-divider { 
          border-top: 1px dashed #333; 
          margin: 4px 0; 
        }

        .info-section { 
          font-size: 14px; /* Aumentado de 13px */
          line-height: 1.3; 
          margin-bottom: 6px; 
        }
        .info-row { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 5px; 
        }
        .info-label { 
          font-weight: bold; 
          min-width: 48%; 
          font-size: 14px;
        }
        .info-value { 
          text-align: right; 
          flex: 1;
          font-weight: 700;
          font-size: 14px;
        }

        .products-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 6px 0; 
          font-size: 13px; /* Aumentado de 12px */
        }
        .products-table th { 
          text-align: left; 
          padding: 6px 0 4px 0; 
          border-bottom: 3px solid #000; /* Más grueso */
          font-weight: 900; 
          background-color: #f0f0f0;
          font-size: 14px; /* Aumentado de 13px */
        }
        .products-table td { 
          padding: 5px 0; 
          border-bottom: 1px solid #ddd; 
          vertical-align: top; 
        }
        .product-name { 
          width: 48%; 
          font-weight: 600;
          font-size: 13px; /* Aumentado de 12px */
          line-height: 1.3;
        }
        .product-info { 
          font-size: 12px; /* Aumentado de 11px */
          color: #555;
          margin-top: 2px;
          font-weight: 500;
        }
        .product-qty { 
          width: 16%; 
          text-align: center;
          font-weight: 700;
          font-size: 13px;
        }
        .product-price { 
          width: 36%; 
          text-align: right; 
          font-weight: 800;
          font-size: 13px; /* Aumentado de 12px */
        }

        .total-section { 
          margin-top: 8px; 
          padding-top: 6px; 
        }
        .total-row { 
          display: flex; 
          justify-content: space-between; 
          font-weight: 900; 
          font-size: 18px; /* Aumentado de 16px */
          border-top: 4px double #000; /* Más grueso */
          padding-top: 8px;
          letter-spacing: 0.5px;
        }

        .redes-sociales { 
          margin-top: 8px; 
          padding-top: 5px; 
          text-align: center; 
          border-top: 2px dashed #000; /* Más grueso */
        }
        .redes-title { 
          font-size: 14px; /* Aumentado de 12px */
          font-weight: bold; 
          margin-bottom: 6px; 
          text-transform: uppercase; 
        }
        .redes-item { 
          font-size: 13px; /* Aumentado de 11px */
          margin-bottom: 5px; 
          display: flex; 
          justify-content: center; 
          gap: 5px; 
          font-weight: 600;
        }
        .footer { 
          text-align: center; 
          font-size: 12px; /* Aumentado de 11px */
          margin-top: 8px; 
          padding-top: 5px; 
          border-top: 2px dashed #333; /* Más grueso */
          line-height: 1.3; 
        }
        .footer-message { 
          font-weight: bold; 
          margin-bottom: 5px; 
          font-size: 14px; /* Aumentado de 12px */
        }
        .print-info { 
          font-size: 11px; /* Aumentado de 10px */
          font-style: italic; 
          color: #555;
          margin-top: 4px;
          font-weight: 500;
        }
        .disclaimer {
          font-size: 10px; /* Aumentado de 9px */
          margin-top: 6px;
          font-style: italic;
          font-weight: 500;
        }
      `}</style>

      <div className="ticket-container">
        <div className="header">
          <img src={logoImg} alt="Logo LOJAINY" className="logo"/>
          <h1 className="title">Boutique Lojainy</h1>
          <div className="subtitle">COMPROBANTE DE VENTA</div>
        </div>

        <div className="divider"></div>

        <div className="info-section">
          <div className="info-row">
            <span className="info-label">N° VENTA:</span>
            <span className="info-value">#{id_venta.toString().padStart(6,'0')}</span>
          </div>
          <div className="info-row">
            <span className="info-label">FECHA Y HORA:</span>
            <span className="info-value">{formatearFecha(fecha)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">ATENDIDO POR:</span>
            <span className="info-value">{nombre_usuario.toUpperCase()}</span>
          </div>
          <div className="info-row">
            <span className="info-label">FORMA DE PAGO:</span>
            <span className="info-value">{metodo_pago.toUpperCase()}</span>
          </div>
              </div>
              {venta.cliente_ci && (
          <>
            <div className="info-row">
              <span className="info-label">CI:</span>
              <span className="info-value">{venta.cliente_ci}</span>
            </div>
            <div className="info-row">
              <span className="info-label">CLIENTE:</span>
              <span className="info-value">{venta.cliente_nombre} {venta.cliente_apellido}</span>
            </div>
          </>
        )}


        <div className="light-divider"></div>

        <table className="products-table">
          <thead>
            <tr>
              <th className="product-name">PRODUCTO</th>
              <th className="product-qty">CANT.</th>
              <th className="product-price">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {detalles.map((detalle, index) => (
              <tr key={`${detalle.id_producto}-${index}`}>
                <td className="product-name">
                  {detalle.nombre_producto}
                  <div className="product-info">
                    {detalle.categoria} - {detalle.color}
                  </div>
                </td>
                <td className="product-qty">{detalle.cantidad || 1}</td>
                <td className="product-price">{formatearMoneda(detalle.precio * (detalle.cantidad || 1))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="light-divider"></div>

        <div className="total-section">
          <div className="total-row">
            <span>TOTAL A PAGAR</span>
            <span>{formatearMoneda(total)}</span>
          </div>
        </div>

        <div className="divider"></div>

        <div className="redes-sociales">
          <div className="redes-title">Síguenos en nuestras redes</div>
          <div className="redes-item"> WhatsApp: {redesSociales.whatsapp}</div>
          <div className="redes-item"> TikTok: {redesSociales.tiktok}</div>
        </div>

        <div className="light-divider"></div>

        <div className="footer">
          <div className="footer-message">¡Gracias por su compra!</div>
          <div>Visítenos nuevamente</div>
          <div className="print-info">Comprobante emitido: {new Date().toLocaleString('es-BO')}</div>
          <div className="disclaimer">
            Este documento es un comprobante de venta no válido como factura
          </div>
        </div>
      </div>
    </div>
  );
});

ComprobanteVenta.displayName = "ComprobanteVenta";

export default ComprobanteVenta;