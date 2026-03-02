import { jsPDF } from 'jspdf';
import { BookingData, BookingSummary, HOTEL_LOGO, FULL_BRAND_SVG, RoomType, EXTRA_PERSON_COST, TerraceEventData } from '../types';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Converts a base64 SVG string to a base64 PNG string using a Canvas.
 * Optimized for MAXIMUM resolution (High DPI print quality).
 */
const svgToPng = (svgDataUri: string, width: number, height: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = width; 
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error("Canvas context failed"));
            }
        };
        img.onerror = (e) => reject(new Error("Logo load failed"));
        // Handle raw SVG string vs Data URI
        if (svgDataUri.startsWith('<svg')) {
            img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgDataUri)));
        } else {
            img.src = svgDataUri;
        }
    });
};

// Helper to safely set char spacing if available
const safeCharSpace = (doc: jsPDF, space: number) => {
    if (typeof doc.setCharSpace === 'function') {
        doc.setCharSpace(space);
    }
};

const savePDF = async (doc: jsPDF, fileName: string) => {
    if (Capacitor.isNativePlatform()) {
        try {
            const base64Data = doc.output('datauristring').split(',')[1];
            await Filesystem.writeFile({
                path: fileName,
                data: base64Data,
                directory: Directory.Documents,
            });
            alert(`PDF guardado en Documentos: ${fileName}`);
        } catch (e) {
            console.error('Error al guardar el PDF:', e);
            alert('Error al guardar el PDF. Verifica los permisos de almacenamiento.');
        }
    } else {
        doc.save(fileName);
    }
};

export const generateMenuPDF = async (returnBlob: boolean = false): Promise<Blob | void> => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cx = pageWidth / 2;
    const margin = 15;

    // Load High Res Logo
    let logoPng = '';
    try {
        logoPng = await svgToPng(FULL_BRAND_SVG, 2000, 1333);
    } catch(e) {}

    // Menu Data Structure (Based on provided images)
    const sections = [
        {
            title: "DESAYUNO",
            items: [
                { name: "AMERICANO", price: 120, desc: "Un desayuno completo para empezar el día con energía: jugo o fruta fresca, café o té y huevos al gusto: con jamón, tocino o en salsa." },
                { name: "EUROPEO", price: 120, desc: "Disfruta de un desayuno al estilo europeo: jugo o fruta fresca, café o té y tu elección entre pan francés, hot cakes o waffles recién hechos." },
                { name: "MEXICANO", price: 120, desc: "Sabores tradicionales de México para tu desayuno: jugo o fruta fresca, café o té y enchiladas o chilaquiles al gusto." },
                { name: "Motuleños", price: 120, desc: "Huevos estrellados sobre tortilla de maíz con jamón, queso y plátano frito, bañados en salsa roja." },
                { name: "Rancheros", price: 105, desc: "Huevos fritos sobre tortilla de maíz con salsa roja y frijoles refritos." },
            ]
        },
        {
            title: "HUEVOS AL GUSTO",
            items: [
                { name: "Estrellados", price: 85 },
                { name: "En Salsa", price: 90 },
                { name: "Con Chorizo", price: 95 },
                { name: "Con Chistorra", price: 95 },
                { name: "Con Jamón", price: 90 },
                { name: "Con Nopal", price: 90 },
                { name: "A la Mexicana", price: 100 },
                { name: "Divorciados", price: 110 }
            ]
        },
        {
            title: "OMELETTES",
            items: [
                { name: "Jamón con Queso", price: 105 },
                { name: "Champiñones con Queso", price: 105 },
                { name: "A la Mexicana", price: 105 },
                { name: "Salmón con Queso Philadelphia", price: 120 },
                { name: "De Cochinita Pibil", price: 135 }
            ]
        },
        {
            title: "LO MEXICANO",
            items: [
                { name: "Chilaquiles Tradicionales", price: 90 },
                { name: "Chilaquiles con Huevo", price: 105 },
                { name: "Chilaquiles Rellenos de Queso", price: 110 },
                { name: "Chilaquiles con Cochinita Pibil", price: 125 },
                { name: "Enchiladas Tradicionales", price: 95 },
                { name: "Enchiladas Suizas", price: 120 },
                { name: "Panuchos de Cochinita", price: 120 },
                { name: "Picadas", price: 70 },
                { name: "Quesadillas", price: 80 },
                { name: "Sincronizadas", price: 95 },
                { name: "Enfrijoladas", price: 95 },
                { name: "Tampiqueña", price: 165 },
                { name: "Enmoladas", price: 110 }
            ]
        },
        {
            title: "SNACKS Y ENTRADAS",
            items: [
                { name: "Papas Saratoga", price: 80 },
                { name: "Patatas Bravas", price: 90 },
                { name: "Papas a la Francesa", price: 70 },
                { name: "Papas Gajo", price: 70 },
                { name: "Papas Texanas", price: 115 },
                { name: "Nachos Tradicionales", price: 90 },
                { name: "Barritas de pescado", price: 130 },
                { name: "Rollos de Pollo", price: 145 },
                { name: "Tapas de Jamón Serrano", price: 185 },
                { name: "Mini Banderillas", price: 75 },
                { name: "Hot Dog Chili", price: 140 },
                { name: "ALITAS (BBQ, Talavera, Búfalo, Mango)", price: 80 },
                { name: "BONELESS (BBQ, Búfalo, Talavera)", price: 95 }
            ]
        },
        {
            title: "BEBIDAS",
            items: [
                { name: "Café Americano", price: 40 },
                { name: "Cappuccino", price: 65 },
                { name: "Chocolate", price: 55 },
                { name: "Malteada", price: 65 },
                { name: "Frappes", price: 75 },
                { name: "Bubble Tea", price: 70 },
                { name: "Chocomilk", price: 55 },
                { name: "Limonada/Naranjada", price: 45 },
                { name: "Jugo Verde", price: 55 }
            ]
        }
    ];

    let y = 20;

    const addHeader = () => {
        if(logoPng) {
            doc.addImage(logoPng, 'PNG', cx - 25, 10, 50, 33, undefined, 'FAST');
        } else {
             doc.setFont("times", "bold");
             doc.setFontSize(16);
             doc.setTextColor(26, 35, 126); 
             doc.text("HOTEL TALAVERA", cx, 25, {align: 'center'});
        }
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(26, 35, 126);
        doc.line(margin, 45, pageWidth - margin, 45);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(0, 0, 0);
        doc.text("MENÚ", cx, 55, { align: 'center' });
        return 65;
    };

    y = addHeader();

    sections.forEach((sec, idx) => {
        if (y > pageHeight - 40) {
            doc.addPage();
            y = addHeader();
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(26, 35, 126);
        doc.text(sec.title, margin, y);
        y += 8;

        sec.items.forEach(item => {
             if (y > pageHeight - 20) {
                doc.addPage();
                y = addHeader();
            }

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(item.name, margin, y);
            doc.text(`$ ${item.price}`, pageWidth - margin, y, { align: 'right' });
            y += 5;

            if (item.desc) {
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.setTextColor(80, 80, 80);
                const splitDesc = doc.splitTextToSize(item.desc, pageWidth - (margin * 2));
                doc.text(splitDesc, margin, y);
                y += (splitDesc.length * 4) + 4;
            } else {
                y += 2;
            }
        });
        y += 6;
    });

    // Footer Last Page
    y = pageHeight - 15;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("Av. Miguel Hidalgo No. 1302, Col. Centro, Teziutlán, Puebla | 2311456385 | hoteltalaveratez@gmail.com", cx, y + 5, { align: 'center' });

    if (returnBlob) return doc.output('blob');
    await savePDF(doc, 'Menu_Hotel_Talavera.pdf');
};

export const generateTerraceEventPDF = async (data: TerraceEventData, returnBlob: boolean = false): Promise<Blob | void> => {
    // Custom dimensions: 15cm x 21.5cm
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [150, 215], 
        floatPrecision: 16
    });

    const pageWidth = 150;
    const pageHeight = 215;
    const margin = 12;
    const cx = pageWidth / 2;
    
    let y = 12;

    // --- IMAGES GENERATION (MAX RESOLUTION) ---
    let fullBrandPng = '';
    let watermarkPng = '';

    try {
        // 1. Full Brand Header (Logo + Text + Line) - 3:2 Aspect Ratio
        fullBrandPng = await svgToPng(FULL_BRAND_SVG, 3000, 2000);
        // 2. Icon Only for Watermark - 1:1 Aspect Ratio
        watermarkPng = await svgToPng(HOTEL_LOGO, 2048, 2048);
    } catch (e) {
        console.error("Error generating high-res assets", e);
    }

    // --- WATERMARK ---
    if (data.showWatermark && watermarkPng) {
        const wmSize = 80;
        const wmY = (pageHeight / 2) - (wmSize / 2);
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.05 })); 
        doc.addImage(watermarkPng, 'PNG', cx - (wmSize / 2), wmY, wmSize, wmSize, undefined, 'FAST');
        doc.restoreGraphicsState();
    }

    // --- HEADER (EXACT REPLICA USING SVG) ---
    if (fullBrandPng) {
        const logoWidth = 45; 
        const logoHeight = logoWidth * (2/3); 
        doc.addImage(fullBrandPng, 'PNG', cx - (logoWidth / 2), y, logoWidth, logoHeight, undefined, 'FAST');
        y += logoHeight + 6;
    } else {
        doc.setTextColor(26, 35, 126); 
        doc.setFont("times", "bold");
        doc.setFontSize(18);
        doc.text("HOTEL TALAVERA", cx, y + 10, { align: "center" });
        y += 20;
    }

    // --- DOCUMENT TITLE ---
    doc.setFillColor(26, 35, 126); 
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 9, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    safeCharSpace(doc, 1);
    doc.text("EVENTOS TERRAZA", cx, y + 6, { align: "center" });
    safeCharSpace(doc, 0);
    y += 14;

    // --- DATA GRID ---
    const boxWidth = (pageWidth - (margin * 2) - 4) / 2;
    const leftX = margin;
    const rightX = margin + boxWidth + 4;
    const rowHeight = 11;
    const gap = 3;

    const drawDataCard = (title: string, value: string, x: number, py: number, w: number, h: number) => {
        doc.setFillColor(248, 248, 248);
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.1);
        doc.roundedRect(x, py, w, h, 1.5, 1.5, 'FD');

        doc.setFont("helvetica", "bold");
        doc.setFontSize(5);
        doc.setTextColor(198, 134, 82);
        doc.text(title.toUpperCase(), x + 3, py + 3.5);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(40, 40, 40);
        
        const cleanValue = value || "---";
        if (doc.getTextWidth(cleanValue) > w - 6) {
             doc.setFontSize(7);
        }
        doc.text(cleanValue.toUpperCase(), x + 3, py + 8);
    };

    drawDataCard("Cliente", data.clientName, leftX, y, boxWidth, rowHeight);
    const dateFormatted = data.eventDate ? data.eventDate.split('-').reverse().join('/') : '';
    drawDataCard("Fecha", dateFormatted, rightX, y, boxWidth, rowHeight);
    y += rowHeight + gap;

    drawDataCard("Teléfono", data.phone, leftX, y, boxWidth, rowHeight);
    drawDataCard("Horario", data.eventTime, rightX, y, boxWidth, rowHeight);
    y += rowHeight + gap;

    drawDataCard("Tipo de Evento", data.eventType, margin, y, pageWidth - (margin * 2), rowHeight);
    y += rowHeight + 8;

    // --- DETAILS SECTION (UPDATED FOR FREE TEXT) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(26, 35, 126);
    doc.text("DETALLES INCLUIDOS", margin, y);
    doc.setDrawColor(26, 35, 126);
    doc.setLineWidth(0.5);
    doc.line(margin, y + 1, margin + 30, y + 1);
    y += 4;

    const detailsHeight = 35; // Reduced slightly to fit Menu Cost
    doc.setDrawColor(230, 230, 230);
    doc.setFillColor(252, 252, 252);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), detailsHeight, 2, 2, 'FD');

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);

    const detailText = data.details ? data.details.toUpperCase() : "(NINGÚN DETALLE ADICIONAL ESPECIFICADO)";
    const splitDetails = doc.splitTextToSize(detailText, pageWidth - (margin * 2) - 10);
    doc.text(splitDetails, margin + 5, y + 6);
    
    y += detailsHeight + 6;

    // --- FINANCIALS ---
    const finHeight = 22; // Increased for breakdown
    doc.setFillColor(248, 250, 252); 
    doc.setDrawColor(220, 220, 220);
    doc.rect(margin, y, pageWidth - (margin * 2), finHeight, 'FD');

    const formatMoney = (amount: number) => `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Line 1: Event Cost
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text("COSTO EVENTO:", margin + 4, y + 5);
    doc.text(formatMoney(data.totalCost || 0), pageWidth - margin - 4, y + 5, { align: 'right' });

    // Line 2: Menu Cost
    doc.text("COSTO MENÚ:", margin + 4, y + 9);
    doc.text(formatMoney(data.menuCost || 0), pageWidth - margin - 4, y + 9, { align: 'right' });

    // Line 3: Grand Total
    const grandTotal = (data.totalCost || 0) + (data.menuCost || 0);
    doc.setFontSize(10);
    doc.setTextColor(26, 35, 126);
    doc.text("TOTAL A PAGAR:", margin + 4, y + 15);
    
    doc.setFontSize(12);
    doc.text(formatMoney(grandTotal), pageWidth - margin - 4, y + 15, { align: 'right' });

    // Use totalCostText for the Event Cost specifically or maybe a generic total text?
    // User requirement: "esa que sea igual al formato que ya esta ahí" implies separate line items.
    
    // --- ABSOLUTE BOTTOM POSITIONING ---
    const bottomMargin = 12;
    const footerLineY = pageHeight - bottomMargin - 5;
    
    // Payment Pill (Updated Logic)
    const pillH = 12;
    const pillW = 85; 
    const pillY = footerLineY - pillH - 8; 

    let statusColor = [220, 38, 38]; // Red (Default/Unpaid)
    let statusText = "PENDIENTE DE PAGO";
    
    if (data.paymentStatus === 'paid') {
        statusColor = [22, 163, 74]; // Green
        statusText = "PAGADO";
    } else if (data.paymentStatus === 'pending_arrival') {
        statusColor = [250, 204, 21]; // Yellow
        statusText = "PENDIENTE PAGO AL LLEGAR";
    }

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.roundedRect(cx - (pillW/2), pillY, pillW, pillH, 6, 6, 'F');
    
    // Text color adjustment for yellow background
    if (data.paymentStatus === 'pending_arrival') {
        doc.setTextColor(0, 0, 0);
    } else {
        doc.setTextColor(255, 255, 255);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    safeCharSpace(doc, 0.5);
    doc.text(statusText, cx, pillY + 7.5, { align: "center" });
    safeCharSpace(doc, 0);

    // Footer Text
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerLineY, pageWidth - margin, footerLineY);
    
    doc.setTextColor(100, 100, 100);
    doc.setFont("times", "italic");
    doc.setFontSize(9);
    doc.text("Gracias por su preferencia", cx, footerLineY + 5, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text("Hotel Talavera", cx, footerLineY + 9, { align: "center" });

    // Output
    if (returnBlob) {
        return doc.output('blob');
    } else {
        const safeName = (data.clientName || 'Cliente').replace(/[^a-z0-9]/gi, '_');
        const fileName = `Evento_${safeName}_${data.eventDate || 'Fecha'}.pdf`;
        await savePDF(doc, fileName);
    }
};

export const generateConfirmationPDF = async (data: BookingData, summary: BookingSummary, returnBlob: boolean = false): Promise<Blob | void> => {
  // Initialize jsPDF with high precision settings
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    floatPrecision: 16 
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  
  const formatMoney = (amount: number) => `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  let y = 20; 
  const cx = pageWidth / 2; 

  // --- PREPARE HIGH RES ASSETS ---
  let fullBrandPng = '';
  try {
      fullBrandPng = await svgToPng(FULL_BRAND_SVG, 3000, 2000);
  } catch (e) {
      console.warn("Could not render logo", e);
  }

  // --- PAGE 1: CONFIRMATION DETAILS ---
  if (fullBrandPng) {
      const logoWidth = 60; 
      const logoHeight = logoWidth * (2/3); 
      doc.addImage(fullBrandPng, 'PNG', cx - (logoWidth / 2), y, logoWidth, logoHeight, undefined, 'FAST');
      y += logoHeight + 10;
  } else {
      y += 10;
      doc.setTextColor(26, 35, 126); 
      doc.setFontSize(24);
      doc.setFont("times", "bold");
      doc.text("HOTEL TALAVERA", cx, y, { align: "center" });
      y += 15;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const introText = "ESTIMADO HUÉSPED, PARA HOTEL TALAVERA ES UN PLACER CONFIRMAR SU RESERVACIÓN CON LOS SIGUIENTES DATOS:";
  const splitIntro = doc.splitTextToSize(introText, pageWidth - (margin * 2));
  doc.text(splitIntro, margin, y, { align: "justify", maxWidth: pageWidth - (margin * 2) });
  y += (splitIntro.length * 5) + 5;

  const lineHeight = 6;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`NÚMERO DE RESERVACIÓN: ${summary.folio}`, margin, y);
  y += lineHeight;

  doc.text("HUÉSPED:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.firstName} ${data.lastName}`.toUpperCase(), margin + 25, y);
  y += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("FECHA DE LLEGADA:", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatDate(data.checkIn)}`, margin + 45, y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28); 
  doc.text("CHECK IN:", margin + 75, y);
  doc.text("15:00 HRS", margin + 100, y);
  doc.setTextColor(0, 0, 0);
  y += lineHeight;

  doc.setFont("helvetica", "bold");
  doc.text("FECHA DE SALIDA:", margin + 5, y);
  doc.setFont("helvetica", "normal");
  doc.text(`${formatDate(data.checkOut)}`, margin + 45, y);
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(185, 28, 28); 
  doc.text("CHECK OUT:", margin + 75, y);
  doc.text("13:00 HRS", margin + 100, y);
  doc.setTextColor(0, 0, 0);
  y += lineHeight + 2;

  const details = [
    { label: "TIPO DE HABITACIÓN:", value: data.roomType.toUpperCase() },
    { label: "COSTO POR NOCHE:", value: formatMoney(summary.pricePerNight) }
  ];

  const hasExtra = data.roomType === RoomType.SUITE && (data.extraPersons || 0) > 0;
  if (hasExtra) {
    const extraTotal = (data.extraPersons || 0) * EXTRA_PERSON_COST * summary.nights;
    details.push({
      label: `PERSONAS EXTRAS (${data.extraPersons}):`,
      value: `${formatMoney(extraTotal)} ($${EXTRA_PERSON_COST} c/u)`
    });
  }

  const totalLabel = `TOTAL, DE ${data.numberOfRooms} HABITACIÓN POR ${summary.nights} NOCHE:`;
  details.push({ label: totalLabel, value: formatMoney(summary.totalCost) });

  details.forEach(detail => {
    doc.setFont("helvetica", "bold");
    doc.text("• " + detail.label, margin, y);
    const labelWidth = doc.getTextWidth("• " + detail.label);
    doc.setFont("helvetica", "normal");
    doc.text(detail.value, margin + labelWidth + 2, y);
    y += lineHeight;
  });

  doc.setFont("helvetica", "bold");
  doc.text("• DESAYUNO CONTINENTAL INCLUIDO:", margin, y);
  doc.setTextColor(185, 28, 28);
  doc.text("(CAFÉ, PAN Y FRUTA)", margin + 75, y);
  doc.setTextColor(0, 0, 0);
  y += lineHeight * 2;

  // --- POLICIES UPDATE START ---
  doc.setFont("helvetica", "bold");
  doc.text("POLITICAS DE RESERVACIÓN", margin, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Alternative simpler approach for the PDF structure requested:
  const fullPolicy = `Le proporcionamos el número de cuenta bancaria para realizar el depósito correspondiente a la primera noche de su hospedaje 5 días previos a su llegada, en caso de TRANSFERENCIA favor de capturar como referencia su NÚMERO DE RESERVA y enviar el comprobante a hoteltalaveratez@gmail.com o vía WhatsApp al número 231-145-6385 favor de considerar la fecha límite que se le indique para realizar su pago a fin de garantizar su reservación.`;
  
  const splitFull = doc.splitTextToSize(fullPolicy, pageWidth - (margin * 2));
  doc.text(splitFull, margin, y, { align: 'justify', maxWidth: pageWidth - (margin * 2) });
  y += (splitFull.length * 5) + 5;

  doc.setFont("helvetica", "bold");
  doc.text("BANORTE", cx, y, { align: "center" });
  y += 4;
  doc.text("HOTEL TALAVERA S.A DE C.V", cx, y, { align: "center" });
  y += 4;
  
  doc.text("CUENTA: ", cx - 35, y, { align: "right" });
  doc.setTextColor(185, 28, 28);
  doc.text("11 70 36 32 43", cx - 35, y, { align: "left" });
  doc.setTextColor(0, 0, 0);
  doc.text(" (SOLO DE BANORTE A BANORTE)", cx + 5, y, { align: "left" });
  y += 4;

  doc.text("CLABE: ", cx - 35, y, { align: "right" });
  doc.setTextColor(185, 28, 28);
  doc.text("07 26 72 01 17 03 63 24 34", cx - 35, y, { align: "left" });
  doc.setTextColor(0, 0, 0);
  doc.text(" (DE OTROS BANCOS A BANORTE)", cx + 25, y, { align: "left" });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.text("POLÍTICAS DE CANCELACIÓN.", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(" Para cancelar una reservación favor de considerar ", margin + 50, y);
  doc.setTextColor(185, 28, 28);
  doc.setFont("helvetica", "bold");
  doc.text("72", margin + 128, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text(" horas previas a la fecha de", margin + 134, y);
  y += 5;
  doc.text("llegada, de lo contrario no hay reembolso.", cx, y, { align: "center" });
  y += 10;
  // --- POLICIES UPDATE END ---

  doc.setFont("helvetica", "bold");
  doc.text("¿Requiere FACTURA?", margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  const invoiceText = "De ser así por favor envíe vía WhatsApp al número 231-145-6385 su CONSTANCIA DE SITUACIÓN FISCAL. Hotel Talavera agradece su preferencia, ¡Esperamos que disfrute su estancia!";
  const splitInvoice = doc.splitTextToSize(invoiceText, pageWidth - (margin * 2));
  doc.text(splitInvoice, margin, y);
  y += 15;

  const footerY = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  doc.setFontSize(6);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const privacyText = "Aviso de Privacidad: De acuerdo con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares, en los artículos 3, Fracciones II y VII, y 33, así como la denominación del capítulo II, del Título Segundo, de la Ley Federal de Transparencia y Acceso a la Información Pública Gubernamental, le informamos que toda su información personal en nuestras bases de datos no está a la venta ni disponible para su comercialización con terceros.";
  const splitPrivacy = doc.splitTextToSize(privacyText, pageWidth - (margin * 2));
  doc.text(splitPrivacy, margin, footerY + 3, { align: "justify", maxWidth: pageWidth - (margin * 2) });
  
  // --- PAGE 2: COSTOS ---
  
  doc.addPage();
  let py = 20;
  
  if (fullBrandPng) {
      const logoWidth = 60; 
      const logoHeight = logoWidth * (2/3);
      doc.addImage(fullBrandPng, 'PNG', cx - (logoWidth / 2), py, logoWidth, logoHeight, undefined, 'FAST');
      py += logoHeight + 15;
  } else {
      py += 50;
  }

  const tableX = 15;
  const col1W = 50; 
  const col2W = 65; 
  const col3W = 65; 
  const headerH = 25; 
  const rowH = 15;   
  const footerH = 20;
  const tableWidth = col1W + col2W + col3W; 

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); 
  doc.setLineWidth(0.6); 
  doc.setDrawColor(0, 0, 0); 

  doc.setFillColor(146, 208, 80); 
  doc.rect(tableX, py, col1W, headerH, 'FD'); 
  doc.setTextColor(0, 0, 0);
  doc.text("HABITACIÓN", tableX + (col1W / 2), py + (headerH / 2) + 2, { align: 'center' });

  doc.setFillColor(244, 176, 132);
  doc.rect(tableX + col1W, py, col2W, headerH, 'FD');
  const textH2 = "COSTO PARA INGRESAR ANTES DE LAS 3:00 PM (INGRESO ANTICIPADO)";
  const splitH2 = doc.splitTextToSize(textH2, col2W - 4);
  doc.setTextColor(0, 0, 0);
  doc.text(splitH2, tableX + col1W + (col2W / 2), py + 8, { align: 'center' });

  doc.setFillColor(155, 194, 230);
  doc.rect(tableX + col1W + col2W, py, col3W, headerH, 'FD');
  const textH3 = "COSTO DE SALIDA DESPUÉS DE 1:15 PM (SALIDA TARDÍA)";
  const splitH3 = doc.splitTextToSize(textH3, col3W - 4);
  doc.setTextColor(0, 0, 0);
  doc.text(splitH3, tableX + col1W + col2W + (col3W / 2), py + 8, { align: 'center' });

  py += headerH;

  let bgR = 255, bgG = 255, bgB = 255;
  let label = "";
  let p1 = "", p2 = "";

  const typeStr = (data.roomType || "").toUpperCase();

  if (typeStr.includes("ESTANDAR") || typeStr.includes("STANDARD")) {
      bgR = 255; bgG = 153; bgB = 204;
      label = "ESTANDAR";
      p1 = "$200.00";
      p2 = "$200.00";
  } else if (typeStr.includes("DOBLE") || typeStr.includes("DOUBLE") || typeStr.includes("QUEEN")) {
      bgR = 0; bgG = 176; bgB = 240;
      label = "DOBLE";
      p1 = "$250.00";
      p2 = "$250.00";
  } else if (typeStr.includes("SUITE")) {
      bgR = 191; bgG = 191; bgB = 191; 
      label = "SUITE DOBLE Y SUITE KING";
      p1 = "$300.00";
      p2 = "$300.00";
  } else {
      bgR = 255; bgG = 255; bgB = 255; 
      label = typeStr;
      p1 = "$200.00";
      p2 = "$200.00";
  }

  const textY = py + 9.5; 
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);

  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(tableX, py, col1W, rowH, 'FD');
  
  const labelWidth = doc.getTextWidth(label);
  if (labelWidth > col1W - 4) {
      doc.setFontSize(8);
  } else {
      doc.setFontSize(10);
  }
  doc.setTextColor(0, 0, 0);
  doc.text(label, tableX + (col1W / 2), textY, { align: 'center' });
  doc.setFontSize(10); 

  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(tableX + col1W, py, col2W, rowH, 'FD');
  doc.setTextColor(0, 0, 0); 
  doc.text(p1, tableX + col1W + (col2W / 2), textY, { align: 'center' });

  doc.setFillColor(bgR, bgG, bgB);
  doc.rect(tableX + col1W + col2W, py, col3W, rowH, 'FD');
  doc.setTextColor(0, 0, 0);
  doc.text(p2, tableX + col1W + col2W + (col3W / 2), textY, { align: 'center' });

  py += rowH;

  doc.setFillColor(255, 255, 0); 
  doc.rect(tableX, py, tableWidth, footerH, 'FD'); 

  const footerText = "NOTA: EL PRECIO POR SALIDA TARDÍA ES POR HORA O FRACCIÓN.\nEL PRECIO DE SALIDA SE DUPLICA POR HORA";
  doc.setTextColor(0, 0, 0); 
  doc.text(footerText, tableX + (tableWidth / 2), py + 8, { align: 'center' });

  if (returnBlob) {
      return doc.output('blob');
  } else {
      await savePDF(doc, `Reservacion_${summary.folio}.pdf`);
  }
};