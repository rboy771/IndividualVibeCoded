import React, { useState } from 'react';
import TaskCard from './TaskCard';

/**
 * Board Component
 * 4-column responsive grid layout rendering STAGES ('To Do', 'In Progress', 'Review', 'Done').
 * Columns feature accessible landmark regions, semantic headers, task count announcements,
 * and high-contrast styling with native HTML5 Drag-and-Drop support.
 */
export default function Board({
  stages,
  tasks,
  onStatusChange,
  onAssigneeChange,
  onTaskClick,
  onEditTask,
  onCopyPrompt,
}) {
  const [dragOverStage, setDragOverStage] = useState(null);

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageId) {
      setDragOverStage(stageId);
    }
  };

  const handleDragLeave = (e, stageId) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      if (dragOverStage === stageId) {
        setDragOverStage(null);
      }
    }
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    setDragOverStage(null);
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && onStatusChange) {
      onStatusChange(taskId, stageId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage) => {
        const stageTasks = tasks.filter((task) => task.status === stage.id);
        const columnHeaderId = `column-header-${stage.id}`;
        const isDraggingOver = dragOverStage === stage.id;

        return (
          <section
            key={stage.id}
            role="region"
            aria-labelledby={columnHeaderId}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={(e) => handleDragLeave(e, stage.id)}
            onDrop={(e) => handleDrop(e, stage.id)}
            className={`flex flex-col rounded-xl border p-3.5 transition-all duration-200 ${
              isDraggingOver
                ? 'border-indigo-500 bg-indigo-950/40 shadow-[0_0_25px_rgba(99,102,241,0.25)] ring-2 ring-indigo-400/50 scale-[1.01]'
                : 'border-slate-800/80 bg-slate-900/60'
            }`}
          >
            {/* Column Header */}
            <div className="mb-3.5 flex items-center justify-between border-b border-slate-800 pb-2.5 px-1">
              <div className="flex items-center gap-2">
                <h2
                  id={columnHeaderId}
                  className="text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  {stage.label}
                </h2>
                <span
                  aria-label={`${stageTasks.length} tasks in ${stage.label}`}
                  className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs font-mono font-medium text-slate-400 border border-slate-700/60"
                >
                  {stageTasks.length}
                </span>
              </div>
            </div>

            {/* Task list container */}
            <div
              role="list"
              aria-label={`${stage.label} tasks`}
              className="flex flex-1 flex-col gap-3 min-h-[200px]"
            >
              {stageTasks.length > 0 ? (
                stageTasks.map((task) => (
                  <div role="listitem" key={task.id}>
                    <TaskCard
                      task={task}
                      tasks={tasks}
                      onStatusChange={onStatusChange}
                      onAssigneeChange={onAssigneeChange}
                      onCardClick={onTaskClick}
                      onEdit={onEditTask}
                      onCopyPrompt={onCopyPrompt}
                    />
                  </div>
                ))
              ) : (
                <div
                  role="status"
                  className={`flex flex-1 items-center justify-center rounded-lg border border-dashed p-6 text-center text-xs transition-colors ${
                    isDraggingOver
                      ? 'border-indigo-400 bg-indigo-900/20 text-indigo-300'
                      : 'border-slate-800 text-slate-400'
                  }`}
                >
                  {isDraggingOver ? 'Drop card here' : 'Nothing here yet — drag tasks here or stay in flow.'}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
