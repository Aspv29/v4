import React from 'react';
import { RoomType, RoomSelection, getRoomPrice, getMaxRooms } from '../types';
import { Plus, Minus, Hotel } from 'lucide-react';

interface MultiRoomSelectorProps {
  rooms: RoomSelection[];
  onChange: (rooms: RoomSelection[]) => void;
  checkInDate: string;
}

const MultiRoomSelector: React.FC<MultiRoomSelectorProps> = ({ rooms, onChange, checkInDate }) => {
  const initializeRooms = () => {
    if (rooms.length === 0) {
      return [
        { roomType: RoomType.STANDARD, quantity: 0 },
        { roomType: RoomType.DOUBLE, quantity: 0 },
        { roomType: RoomType.SUITE, quantity: 0 }
      ];
    }
    return rooms;
  };

  const currentRooms = initializeRooms();

  const handleQuantityChange = (roomType: RoomType, delta: number) => {
    const newRooms = currentRooms.map(room => {
      if (room.roomType === roomType) {
        const newQuantity = Math.max(0, Math.min(getMaxRooms(roomType), room.quantity + delta));
        return { ...room, quantity: newQuantity };
      }
      return room;
    });
    onChange(newRooms);
  };

  const getTotalRooms = () => {
    return currentRooms.reduce((sum, room) => sum + room.quantity, 0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm text-[#1a237e] dark:text-blue-400 flex items-center gap-2">
          <Hotel size={18} />
          SELECCIÓN DE HABITACIONES
        </h3>
        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-[#1a237e] dark:text-blue-300 px-3 py-1 rounded-full font-bold">
          Total: {getTotalRooms()} habitación{getTotalRooms() !== 1 ? 'es' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {Object.values(RoomType).map((roomType) => {
          const room = currentRooms.find(r => r.roomType === roomType) || { roomType, quantity: 0 };
          const price = getRoomPrice(roomType, checkInDate);
          const maxRooms = getMaxRooms(roomType);

          return (
            <div
              key={roomType}
              className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className="font-bold text-sm text-gray-900 dark:text-white uppercase">
                    {roomType}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${price.toFixed(2)} MXN por noche
                  </div>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                    Disponibles: {maxRooms}
                  </div>
                </div>

                <div className="flex items-center border border-[#1a237e] dark:border-blue-500 rounded-lg overflow-hidden h-10">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(roomType, -1)}
                    disabled={room.quantity <= 0}
                    className="w-10 h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border-r border-[#1a237e] dark:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-[#1a237e] dark:text-blue-400 transition-colors"
                  >
                    <Minus size={14} />
                  </button>

                  <div className="w-12 h-full flex items-center justify-center font-bold text-[#1a237e] dark:text-blue-400 bg-white dark:bg-slate-900 text-base">
                    {room.quantity}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(roomType, 1)}
                    disabled={room.quantity >= maxRooms}
                    className="w-10 h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 border-l border-[#1a237e] dark:border-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-[#1a237e] dark:text-blue-400 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {room.quantity > 0 && (
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>{room.quantity} habitación{room.quantity > 1 ? 'es' : ''}</span>
                    <span className="font-bold text-[#1a237e] dark:text-blue-400">
                      ${price.toFixed(2)} x {room.quantity}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {getTotalRooms() === 0 && (
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
          Selecciona al menos una habitación
        </div>
      )}
    </div>
  );
};

export default MultiRoomSelector;
