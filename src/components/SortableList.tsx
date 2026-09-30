import { FC, useState } from 'react';
import { ChevronUp, ChevronDown, GripVertical } from 'lucide-react';

interface SortableListProps {
  items: string[];
  onChange: (reorderedItems: string[]) => void;
}

export const SortableList: FC<SortableListProps> = ({ items, onChange }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    onChange(newItems);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = sourceIndexStr ? parseInt(sourceIndexStr, 10) : draggedIndex;

    if (sourceIndex !== null && !isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      const newItems = [...items];
      const [draggedItem] = newItems.splice(sourceIndex, 1);
      newItems.splice(targetIndex, 0, draggedItem);
      onChange(newItems);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (items.length === 0) {
    return (
      <div className="py-5 px-4 bg-[#0a1324] border border-dashed border-neutral-700 rounded-xl text-center">
        <p className="text-sm sm:text-base text-neutral-400">
          (โปรดเลือกความคาดหวังในข้อ 1 ด้านบนก่อน รายการจะปรากฏให้จัดอันดับที่นี่)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs sm:text-sm text-[#d4af37] px-1 font-medium">
        <span>ลากสลับตำแหน่ง หรือแตะปุ่มลูกศรเพื่อเลื่อนอันดับ</span>
        <span className="font-mono text-neutral-300 tabular-nums">
          {items.length} รายการ
        </span>
      </div>

      <div className="space-y-2">
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          const isBeingDragged = draggedIndex === index;
          const isDragTarget = dragOverIndex === index && draggedIndex !== index;

          return (
            <div
              key={item}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl border transition-all select-none cursor-grab active:cursor-grabbing ${
                isBeingDragged
                  ? 'opacity-40 border-dashed border-[#d4af37] bg-[#142340]'
                  : isDragTarget
                  ? 'border-[#d4af37] bg-[#14294d] ring-1 ring-[#d4af37]'
                  : isFirst
                  ? 'border-[#d4af37] bg-[#11203b]'
                  : 'border-neutral-800 bg-[#070e1c] hover:border-neutral-700'
              }`}
            >
              {/* Drag Handle icon */}
              <div
                className="text-neutral-500 hover:text-neutral-200 p-1 shrink-0"
                title="ลากเพื่อสลับอันดับ"
              >
                <GripVertical className="w-5 h-5" />
              </div>

              {/* Rank Badge */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-sm sm:text-base font-mono font-bold shrink-0 ${
                  isFirst
                    ? 'bg-[#d4af37] text-neutral-950 font-black'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                {index + 1}
              </div>

              {/* Text content */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-base sm:text-lg leading-snug ${
                      isFirst ? 'text-white font-semibold' : 'text-neutral-200 font-normal'
                    }`}
                  >
                    {item}
                  </span>
                  {isFirst && (
                    <span className="text-xs font-bold text-[#d4af37] bg-[#044337] border border-[#10b981]/40 px-2 py-0.5 rounded-md">
                      อันดับ 1
                    </span>
                  )}
                </div>
              </div>

              {/* Touch & Click Friendly Move Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, 'up');
                  }}
                  disabled={isFirst}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-20 transition-colors cursor-pointer"
                  title="เลื่อนขึ้น"
                  aria-label="เลื่อนขึ้น"
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveItem(index, 'down');
                  }}
                  disabled={isLast}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 disabled:opacity-20 transition-colors cursor-pointer"
                  title="เลื่อนลง"
                  aria-label="เลื่อนลง"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
