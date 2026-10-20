import React from 'react';
import TaskCard from './TaskCard';

/**
 * Board Component
 * 4-column responsive grid layout rendering STAGES ('To Do', 'In Progress', 'Review', 'Done').
 * Columns feature clean header with task counts, container styling, and TaskCard items.
 */
export default function Board({
  stages,
  tasks,
  onStatusChange,
  onAssigneeChange,
  onTaskClick,
  onEditTask,
}) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => {
        const stageTasks = tasks.filter((task) => task.status === stage.id);

        return (
          <div
            key={stage.id}
            className="flex flex-col rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5"
          >
            {/* Column Header */}
            <div className="mb-3.5 flex items-center justify-between border-b border-slate-800 pb-2.5 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {stage.label}
                </span>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs font-mono font-medium text-text-muted">
                  {stageTasks.length}
                </span>
              </div>
            </div>

            {/* Task list container */}
            <div className="flex flex-1 flex-col gap-3 min-h-[200px]">
              {stageTasks.length > 0 ? (
                stageTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStatusChange={onStatusChange}
                    onAssigneeChange={onAssigneeChange}
                    onCardClick={onTaskClick}
                    onEdit={onEditTask}
                  />
                ))
              ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-slate-800 p-6 text-center text-xs text-slate-500">
                  Nothing here yet — stay in flow.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
