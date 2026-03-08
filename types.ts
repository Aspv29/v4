export enum RoomType {
  STANDARD = "ESTANDAR KING SIZE",
  DOUBLE = "DOBLE QUEEN SIZE",
  SUITE = "SUITE"
}

export interface RoomSelection {
  roomType: RoomType;
  quantity: number;
}

export interface BookingData {
  firstName: string;
  lastName: string;
  checkIn: string;
  checkOut: string;
  roomType: RoomType;
  numberOfRooms: number;
  extraPersons: number;
  // New multi-room support
  rooms?: RoomSelection[];
}

export interface RoomCostBreakdown {
  roomType: RoomType;
  quantity: number;
  pricePerNight: number;
  subtotal: number;
}

export interface BookingSummary {
  folio: string;
  nights: number;
  pricePerNight: number;
  totalCost: number;
  // New multi-room breakdown
  roomBreakdown?: RoomCostBreakdown[];
}

export interface ArchivedBooking {
  id: string;
  timestamp: number;
  data: BookingData;
  summary: BookingSummary;
}

// --- TERRACE EVENTS TYPES ---
export type PaymentStatus = 'unpaid' | 'paid' | 'pending_arrival';

export interface TerraceEventData {
  eventDate: string;
  eventType: string;
  clientName: string;
  phone: string;
  eventTime: string;
  
  // Costs
  totalCost: number; // Base Event Cost
  totalCostText: string;
  
  menuCost: number; // New Menu Cost
  menuCostText: string;

  details: string;
  paymentStatus: PaymentStatus;
  showWatermark: boolean;
}

// Pricing logic
export const getRoomPrice = (type: RoomType, dateStr?: string): number => {
  switch (type) {
    case RoomType.STANDARD: return 1136.00;
    case RoomType.DOUBLE: return 1318.00;
    case RoomType.SUITE: return 1497.00; 
    default: return 0;
  }
};

// Inventory logic
export const getMaxRooms = (type: RoomType): number => {
  switch (type) {
    case RoomType.STANDARD: return 4;
    case RoomType.SUITE: return 4;
    case RoomType.DOUBLE: return 6;
    default: return 14;
  }
};

export const EXTRA_PERSON_COST = 150.00;
export const MAX_EXTRA_PERSONS = 3;

// Updated Talavera Logo: 8 Petals, 8 Dots, Solid Center (More accurate to brand image)
export const HOTEL_LOGO = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj4KICA8ZyBmaWxsPSIjMWEyMzdlIj4KICAgIDwhLS0gQ2VudGVyIC0tPgogICAgPGNpcmNsZSBjeD0iMjU2IiBjeT0iMjU2IiByPSIzNSIvPgogICAgCiAgICA8IS0tIDggUGV0YWxzIC0tPgogICAgPHBhdGggZD0iTTI1NiAyMjUgUTI5NSAxNTAgMjU2IDYwIFEyMTcgMTUwIDI1NiAyMjUiLz4KICAgIDxwYXRoIGQ9Ik0yNTYgMjI1IFEyOTUgMTUwIDI1NiA2MCBRMjE3IDE1MCAyNTYgMjI1IiB0cmFuc2Zvcm09InJvdGF0ZSg0NSAyNTYgMjU2KSIvPgogICAgPHBhdGggZD0iTTI1NiAyMjUgUTI5NSAxNTAgMjU2IDYwIFEyMTcgMTUwIDI1NiAyMjUiIHRyYW5zZm9ybT0icm90YXRlKDkwIDI1NiAyNTYpIi8+CiAgICA8cGF0aCBkPSJNMjU2IDIyNSBRMjk1IDE1MCAyNTYgNjAgUTIxNyAxNTAgMjU2IDIyNSIgdHJhbnNmb3JtPSJyb3RhdGUoMTM1IDI1NiAyNTYpIi8+CiAgICA8cGF0aCBkPSJNMjU2IDIyNSBRMjk1IDE1MCAyNTYgNjAgUTIxNyAxNTAgMjU2IDIyNSIgdHJhbnNmb3JtPSJyb3RhdGUoMTgwIDI1NiAyNTYpIi8+CiAgICA8cGF0aCBkPSJNMjU2IDIyNSBRMjk1IDE1MCAyNTYgNjAgUTIxNyAxNTAgMjU2IDIyNSIgdHJhbnNmb3JtPSJyb3RhdGUoMjI1IDI1NiAyNTYpIi8+CiAgICA8cGF0aCBkPSJNMjU2IDIyNSBRMjk1IDE1MCAyNTYgNjAgUTIxNyAxNTAgMjU2IDIyNSIgdHJhbnNmb3JtPSJyb3RhdGUoMjcwIDI1NiAyNTYpIi8+CiAgICA8cGF0aCBkPSJNMjU2IDIyNSBRMjk1IDE1MCAyNTYgNjAgUTIxNyAxNTAgMjU2IDIyNSIgdHJhbnNmb3JtPSJyb3RhdGUoMzE1IDI1NiAyNTYpIi8+CgogICAgPCEtLSA4IERvdHMgLS0+CiAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIxMDAiIHI9IjEyIiB0cmFuc2Zvcm09InJvdGF0ZSgyMi41IDI1NiAyNTYpIi8+CiAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIxMDAiIHI9IjEyIiB0cmFuc2Zvcm09InJvdGF0ZSg2Ny41IDI1NiAyNTYpIi8+CiAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIxMDAiIHI9IjEyIiB0cmFuc2Zvcm09InJvdGF0ZSgxMTIuNSAyNTYgMjU2KSIvPgogICAgPGNpcmNsZSBjeD0iMjU2IiBjeT0iMTAwIiByPSIxMiIgdHJhbnNmb3JtPSJyb3RhdGUoMTU3LjUgMjU2IDI1NikiLz4KICAgIDxjaXJjbGUgY3g9IjI1NiIgY3k9IjEwMCIgcj0iMTIiIHRyYW5zZm9ybT0icm90YXRlKDIwMi41IDI1NiAyNTYpIi8+CiAgICA8Y2lyY2xlIGN4PSIyNTYiIGN5PSIxMDAiIHI9IjEyIiB0cmFuc2Zvcm09InJvdGF0ZSgyNDcuNSAyNTYgMjU2KSIvPgogICAgPGNpcmNsZSBjeD0iMjU2IiBjeT0iMTAwIiByPSIxMiIgdHJhbnNmb3JtPSJyb3RhdGUoMjkyLjUgMjU2IDI1NikiLz4KICAgIDxjaXJjbGUgY3g9IjI1NiIgY3k9IjEwMCIgcj0iMTIiIHRyYW5zZm9ybT0icm90YXRlKDMzNy41IDI1NiAyNTYpIi8+CiAgPC9nPgo8L3N2Zz4=`;

export const LOCK_SCREEN_LOGO = HOTEL_LOGO;

// Full SVG Source Code for Export (Logo + Typography + Refined Ornaments)
export const FULL_BRAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
  <defs>
    <style>
      .blue { fill: #1a237e; }
      .text { font-family: 'Times New Roman', Times, serif; text-anchor: middle; }
      .subtitle { font-size: 22px; font-weight: bold; letter-spacing: 0.8em; }
      .title { font-size: 84px; font-weight: bold; letter-spacing: 0.25em; }
    </style>
  </defs>
  <g class="blue">
    <g transform="translate(400, 160)">
      <circle cx="0" cy="0" r="16"/>
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(45)" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(90)" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(135)" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(180)" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(225)" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(270)" />
      <path d="M 0 -32 Q 38 -80 0 -135 Q -38 -80 0 -32" transform="rotate(315)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(22.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(67.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(112.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(157.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(202.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(247.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(292.5)" />
      <circle cx="0" cy="-115" r="11" transform="rotate(337.5)" />
    </g>
    <g transform="translate(400, 340)">
      <text x="0" y="0" class="text subtitle">HOTEL</text>
      <text x="0" y="75" class="text title">TALAVERA</text>
      <g transform="translate(0, 115)">
        <rect x="-320" y="-2" width="640" height="4" />
        <circle cx="-320" cy="0" r="6" />
        <circle cx="320" cy="0" r="6" />
        <g transform="translate(-275, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(-220, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(-165, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(-110, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(-55, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(0, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(55, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(110, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(165, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(220, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
        <g transform="translate(275, 12)"><path d="M -8 0 Q 0 6 8 0 Q 0 2 -8 0 Z" /><circle cx="0" cy="9" r="3.5" /></g>
      </g>
    </g>
  </g>
</svg>`;
