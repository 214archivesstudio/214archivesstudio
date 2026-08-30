"use client";

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import type { PostMediaRow } from "@/types/database";
import { MediaCard } from "./MediaCard";

interface MediaGridProps {
  readonly media: ReadonlyArray<PostMediaRow>;
  readonly onReorder: (orderedIds: ReadonlyArray<string>) => Promise<void>;
  readonly onAltChange: (mediaId: string, alt: string) => Promise<void>;
  readonly onDeleteClick: (media: PostMediaRow) => void;
}

export function MediaGrid({
  media,
  onReorder,
  onAltChange,
  onDeleteClick,
}: MediaGridProps) {
  // Touch 는 지연 활성화 — 짧은 터치/스크롤은 드래그로 가로채지 않는다 (H5-9).
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = media.findIndex((m) => m.id === active.id);
    const newIndex = media.findIndex((m) => m.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...media];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    void onReorder(reordered.map((m) => m.id));
  }

  const ids = media.map((m) => m.id);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {media.map((m, i) => (
            <MediaCard
              key={m.id}
              media={m}
              index={i}
              onAltChange={onAltChange}
              onDeleteClick={onDeleteClick}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
