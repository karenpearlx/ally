'use client';

/**
 * Board view for the tracker.
 *
 * Six columns, one per status, cards dragged between them. A drop is the only
 * thing that writes: it calls back with the new status and the page's existing
 * optimistic patch handles the account round-trip and the rollback.
 *
 * On ordering — the applications table has no position column, so within-column
 * order is kept in localStorage on this device rather than pretending to sync.
 * Anything the device has never seen (a row added on another machine) sorts to
 * the top of its column using the same rule the list view uses: things needing
 * a follow-up first, then newest.
 *
 * Accessibility: the card body is a button that opens the detail sheet, and a
 * separate grip button is the keyboard drag handle, so Enter never has to mean
 * two things. Anyone who would rather not drag at all can change the status
 * from a real <select> inside the detail sheet.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type App, type Status, STATUSES, daysSince } from '@/lib/followups';
import { NUDGE, STATUS_STYLE } from '@/lib/tracker-status';

type Columns = Record<Status, string[]>;

const ORDER_KEY = 'ally-tracker-board-order';
const COL_PREFIX = 'col:';

function emptyColumns(): Columns {
  return Object.fromEntries(STATUSES.map((s) => [s, [] as string[]])) as Columns;
}

function readOrder(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(ORDER_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function writeOrder(ids: string[]) {
  try {
    localStorage.setItem(ORDER_KEY, JSON.stringify(ids));
  } catch {
    /* private mode: ordering is a nicety, not worth throwing over */
  }
}

/** Deal every app into its column, honouring saved order where we have it. */
function group(apps: App[], overdue: (a: App) => boolean, order: string[]): Columns {
  const rank = new Map(order.map((id, i) => [id, i]));
  const out = emptyColumns();
  const sorted = [...apps].sort((a, b) => {
    const ra = rank.get(a.id);
    const rb = rank.get(b.id);
    if (ra !== undefined && rb !== undefined) return ra - rb;
    // Never-seen rows sort above placed ones so a new application can't hide
    // at the bottom of a long column.
    if (ra === undefined && rb !== undefined) return -1;
    if (ra !== undefined && rb === undefined) return 1;
    const fa = overdue(a) ? 0 : 1;
    const fb = overdue(b) ? 0 : 1;
    if (fa !== fb) return fa - fb;
    return b.appliedAt.localeCompare(a.appliedAt);
  });
  for (const a of sorted) out[a.status]?.push(a.id);
  return out;
}

function flatten(columns: Columns): string[] {
  return STATUSES.flatMap((s) => columns[s]);
}

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

/** What this card is waiting on. The one line worth reading at a glance. */
function nextAction(a: App, isOverdue: boolean): { text: string; urgent: boolean } {
  if (isOverdue) {
    return { text: `Follow up · quiet ${daysSince(a.appliedAt)}d`, urgent: true };
  }
  switch (a.status) {
    case 'Saved':
      return { text: 'Send the application', urgent: false };
    case 'Applied':
      return { text: 'Waiting on a reply', urgent: false };
    case 'Interviewing':
      return { text: 'Prep · confirm the call', urgent: false };
    case 'Offer':
      return { text: 'Read the offer, then answer', urgent: false };
    case 'Rejected':
      return { text: 'Closed — ask for feedback', urgent: false };
    default:
      return { text: 'Silent — one last nudge?', urgent: false };
  }
}

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ card */

function Card({
  app,
  overdue,
  onOpen,
  grip,
}: {
  app: App;
  overdue: boolean;
  onOpen?: (id: string) => void;
  /** The drag handle, supplied by the sortable wrapper. Absent in the overlay. */
  grip?: React.ReactNode;
}) {
  const action = nextAction(app, overdue);
  const host = hostOf(app.url);
  const rail = STATUS_STYLE[app.status].rule;

  return (
    <div
      className="group/card relative overflow-hidden rounded-[16px] bg-[var(--color-surface)] p-3.5 pl-4"
      style={{ boxShadow: 'var(--shadow-tile)' }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-[3px]"
        style={{ background: rail }}
      />
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => onOpen?.(app.id)}
          className="min-w-0 flex-1 text-left"
          aria-label={`Open ${app.role} at ${app.company}`}
        >
          <p
            className="wrap-anywhere text-[0.6875rem] font-bold uppercase tracking-[0.11em]"
            style={{ color: 'var(--color-muted)' }}
          >
            {app.company}
          </p>
          <p className="wrap-anywhere font-display mt-1 text-[0.9375rem] font-extrabold leading-snug tracking-tight">
            {app.role}
          </p>
        </button>
        {grip}
      </div>

      <p
        className="mt-2.5 text-[0.75rem] leading-snug"
        style={{ color: action.urgent ? NUDGE.fg : 'var(--color-muted)' }}
      >
        {action.urgent && <span aria-hidden>🔔 </span>}
        {action.text}
      </p>

      <div
        className="mt-3 flex items-center justify-between gap-2 border-t pt-2.5 text-[0.6875rem]"
        style={{ borderColor: 'var(--color-line)', color: 'var(--color-faint)' }}
      >
        <span className="tabular-nums">{shortDate(app.appliedAt)}</span>
        {host && <span className="truncate">{host}</span>}
      </div>
    </div>
  );
}

function GripDots() {
  return (
    <span
      aria-hidden
      className="opacity-40 transition-opacity group-hover/card:opacity-75"
      style={{ color: 'var(--color-muted)' }}
    >
      <svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor">
        <circle cx="3" cy="3" r="1.4" />
        <circle cx="9" cy="3" r="1.4" />
        <circle cx="3" cy="8" r="1.4" />
        <circle cx="9" cy="8" r="1.4" />
        <circle cx="3" cy="13" r="1.4" />
        <circle cx="9" cy="13" r="1.4" />
      </svg>
    </span>
  );
}

function SortableCard({
  app,
  overdue,
  onOpen,
}: {
  app: App;
  overdue: boolean;
  onOpen: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: app.id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.32 : 1,
      }}
      className="touch-manipulation"
      {...listeners}
    >
      <Card
        app={app}
        overdue={overdue}
        onOpen={onOpen}
        grip={
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="-mr-1 -mt-1 grid h-8 w-7 flex-none cursor-grab place-items-center rounded-lg active:cursor-grabbing"
            aria-label={`Move ${app.role} to another column. Press space, then the arrow keys.`}
            {...attributes}
          >
            <GripDots />
          </button>
        }
      />
    </li>
  );
}

/* ---------------------------------------------------------------- column */

function Column({
  status,
  ids,
  byId,
  isOverdue,
  onOpen,
}: {
  status: Status;
  ids: string[];
  byId: Map<string, App>;
  isOverdue: (a: App) => boolean;
  onOpen: (id: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${COL_PREFIX}${status}` });
  const style = STATUS_STYLE[status];

  return (
    <section
      className="flex w-[16.5rem] flex-none snap-start flex-col rounded-[20px] transition-colors"
      style={{
        background: isOver ? style.bg : 'var(--color-paper-2)',
        outline: isOver ? `2px solid ${style.rule}` : '2px solid transparent',
        outlineOffset: '-2px',
      }}
      aria-label={`${status}, ${ids.length} ${ids.length === 1 ? 'application' : 'applications'}`}
    >
      <header className="flex items-center gap-2 px-4 pb-3 pt-4">
        <span aria-hidden className="h-2 w-2 flex-none rounded-full" style={{ background: style.rule }} />
        <h3 className="font-display text-[0.9375rem] font-extrabold tracking-tight">{status}</h3>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[0.6875rem] font-bold tabular-nums"
          style={{ background: style.bg, color: style.fg }}
        >
          {ids.length}
        </span>
      </header>
      <p className="px-4 pb-3 text-[0.6875rem]" style={{ color: 'var(--color-faint)' }}>
        {style.blurb}
      </p>

      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="flex min-h-[7rem] flex-1 flex-col gap-2.5 px-3 pb-3">
          {ids.map((id) => {
            const app = byId.get(id);
            return app ? (
              <SortableCard key={id} app={app} overdue={isOverdue(app)} onOpen={onOpen} />
            ) : null;
          })}
          {ids.length === 0 && (
            <li
              className="grid flex-1 place-items-center rounded-[14px] border border-dashed px-3 py-6 text-center text-[0.75rem]"
              style={{ borderColor: 'var(--color-line-2)', color: 'var(--color-faint)' }}
            >
              {isOver ? 'Drop it here' : 'Nothing here'}
            </li>
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

/* ----------------------------------------------------------------- board */

export default function KanbanBoard({
  apps,
  followUpDays,
  isOverdue,
  onMove,
  onOpen,
}: {
  apps: App[];
  /** Only used to re-sort when the threshold changes; the rule itself is `isOverdue`. */
  followUpDays: number;
  isOverdue: (a: App) => boolean;
  onMove: (id: string, status: Status) => void;
  onOpen: (id: string) => void;
}) {
  // Saved order is read once, lazily, and then lives in a ref: it changes on
  // drop, not on render, and nothing reads it while rendering.
  const [initialOrder] = useState(readOrder);
  const orderRef = useRef<string[]>(initialOrder);
  // Kept in a ref so the resync effect can use the freshest rule without
  // listing an inline callback prop as a dependency and refiring constantly.
  const overdueRef = useRef(isOverdue);
  useEffect(() => {
    overdueRef.current = isOverdue;
  });
  const [columns, setColumns] = useState<Columns>(() =>
    group(apps, isOverdue, initialOrder),
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const byId = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);

  // Resync when the underlying list changes for any reason other than the drag
  // in progress — a new application, a status edited in the detail sheet, a
  // rolled-back write. The signature keeps this from firing on every render.
  const signature = apps.map((a) => `${a.id}:${a.status}`).join('|');
  useEffect(() => {
    if (activeId) return;
    setColumns(group(apps, overdueRef.current, orderRef.current));
    // `apps` is covered by `signature`; depending on it directly would refire on
    // every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, followUpDays, activeId]);

  const sensors = useSensors(
    // A few pixels of slop, otherwise every tap on the card body reads as a drag
    // and the detail sheet never opens.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const containerOf = useCallback(
    (id: UniqueIdentifier, cols: Columns): Status | null => {
      const raw = String(id);
      if (raw.startsWith(COL_PREFIX)) {
        const s = raw.slice(COL_PREFIX.length) as Status;
        return STATUSES.includes(s) ? s : null;
      }
      return STATUSES.find((s) => cols[s].includes(raw)) ?? null;
    },
    [],
  );

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id);

  const onDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;
    setColumns((cols) => {
      const from = containerOf(active.id, cols);
      const to = containerOf(over.id, cols);
      if (!from || !to || from === to) return cols;

      const moving = String(active.id);
      const target = cols[to];
      const overIndex = target.indexOf(String(over.id));
      // Dropping on the column itself (or its empty space) appends.
      const insertAt = overIndex === -1 ? target.length : overIndex;

      return {
        ...cols,
        [from]: cols[from].filter((id) => id !== moving),
        [to]: [...target.slice(0, insertAt), moving, ...target.slice(insertAt)],
      };
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) {
      setColumns(group(apps, overdueRef.current, orderRef.current));
      return;
    }

    // onDragOver already committed any cross-column move, so `columns` is
    // current by the time this runs. Only a same-column reorder is left.
    const from = containerOf(active.id, columns);
    const to = containerOf(over.id, columns);
    let settled = columns;
    if (from && to && from === to) {
      const list = columns[to];
      const oldIndex = list.indexOf(String(active.id));
      const newIndex = list.indexOf(String(over.id));
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        settled = { ...columns, [to]: arrayMove(list, oldIndex, newIndex) };
        setColumns(settled);
      }
    }

    orderRef.current = flatten(settled);
    writeOrder(orderRef.current);

    const dropped = containerOf(active.id, settled);
    const app = byId.get(String(active.id));
    if (dropped && app && app.status !== dropped) onMove(app.id, dropped);
  };

  const onDragCancel = () => {
    setActiveId(null);
    setColumns(group(apps, overdueRef.current, orderRef.current));
  };

  const activeApp = activeId ? byId.get(String(activeId)) : undefined;

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const a = byId.get(String(active.id));
      return a ? `Picked up ${a.role} at ${a.company}, currently in ${a.status}.` : undefined;
    },
    onDragOver: ({ active, over }) => {
      const a = byId.get(String(active.id));
      const to = over ? containerOf(over.id, columns) : null;
      return a && to ? `${a.role} is over the ${to} column.` : undefined;
    },
    onDragEnd: ({ active, over }) => {
      const a = byId.get(String(active.id));
      const to = over ? containerOf(over.id, columns) : null;
      return a && to ? `${a.role} moved to ${to}.` : 'Move cancelled.';
    },
    onDragCancel: ({ active }) => {
      const a = byId.get(String(active.id));
      return a ? `Move cancelled. ${a.role} stayed in ${a.status}.` : 'Move cancelled.';
    },
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      accessibility={{ announcements }}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="no-bar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 md:-mx-8 md:px-8">
        {STATUSES.map((s) => (
          <Column
            key={s}
            status={s}
            ids={columns[s]}
            byId={byId}
            isOverdue={isOverdue}
            onOpen={onOpen}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(.22,1,.36,1)' }}>
        {activeApp ? (
          <div
            className="w-[15.5rem] rotate-2 cursor-grabbing"
            style={{ filter: 'drop-shadow(0 24px 40px rgba(28,26,23,.22))' }}
          >
            <Card app={activeApp} overdue={isOverdue(activeApp)} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
