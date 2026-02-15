/**
 * Task Status Constants
 * Valores numéricos para el estado de las tareas en el tablero Kanban
 */

export const TaskStatus = {
    TODO: 1,      // Por hacer
    PROGRESS: 2,  // En progreso
    TEST: 3,      // En pruebas
    COMPLETE: 4,  // Completado
} as const;

export type TaskStatusValue = typeof TaskStatus[keyof typeof TaskStatus];

/**
 * Nombres legibles para cada estado
 */
export const TaskStatusNames: Record<TaskStatusValue, string> = {
    [TaskStatus.TODO]: "Por hacer",
    [TaskStatus.PROGRESS]: "En progreso",
    [TaskStatus.TEST]: "En pruebas",
    [TaskStatus.COMPLETE]: "Completado",
};

/**
 * Validar si un número es un estado válido
 */
export function isValidTaskStatus(status: number): status is TaskStatusValue {
    return Object.values(TaskStatus).includes(status as TaskStatusValue);
}

/**
 * Obtener el nombre de un estado
 */
export function getTaskStatusName(status: TaskStatusValue): string {
    return TaskStatusNames[status] || "Desconocido";
}
