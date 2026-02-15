# 📊 Estructura de la Base de Datos - FreeKanban

## 🏗️ Jerarquía de Modelos (Optimizada)

```
Freelancer
    └── Client (Cliente)
        └── Project (Proyecto)
            └── Board (Tablero Kanban)
                └── Task (Tarea/Tarjeta)
                    ├── status: 1 | 2 | 3 | 4 (Int)
                    └── Tag (Etiqueta)
```

---

## 📋 Modelos

### **Client** (Cliente)
Representa un cliente del freelancer.

```prisma
model Client {
  id        String    @id @default(uuid())
  name      String
  projects  Project[]
  createdAt DateTime  @default(now())
}
```

**Relaciones:**
- Un cliente puede tener múltiples proyectos

---

### **Project** (Proyecto)
Representa un proyecto de un cliente.

```prisma
model Project {
  id        String   @id @default(uuid())
  name      String
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  board     Board?   // Un proyecto tiene un tablero
  createdAt DateTime @default(now())
}
```

**Relaciones:**
- Pertenece a un cliente
- Tiene un tablero kanban (opcional, se crea cuando sea necesario)

**Cascada:**
- Si se elimina el cliente, se eliminan todos sus proyectos

---

### **Board** (Tablero Kanban)
Representa el tablero kanban de un proyecto.

```prisma
model Board {
  id        String   @id @default(uuid())
  name      String   @default("Tablero Principal")
  projectId String   @unique // Un proyecto = un tablero
  project   Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tasks     Task[]
  createdAt DateTime @default(now())
}
```

**Relaciones:**
- Pertenece a un proyecto (relación 1:1)
- Tiene múltiples tareas

**Cascada:**
- Si se elimina el proyecto, se elimina el tablero

---

### **Task** (Tarea/Tarjeta)
Representa una tarea dentro del tablero.

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String?  @db.Text
  status      Int      @default(1) // 1=TODO, 2=PROGRESS, 3=TEST, 4=COMPLETE
  priority    Priority @default(MEDIUM)
  
  // Fechas y esfuerzo
  startDate   DateTime? // Fecha de inicio
  dueDate     DateTime? // Fecha límite
  effortHours Int?      // Esfuerzo estimado en horas
  
  boardId     String
  board       Board    @relation(fields: [boardId], references: [id], onDelete: Cascade)
  tags        Tag[]
  comments    Comment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Relaciones:**
- Pertenece a un tablero
- Puede tener múltiples etiquetas
- Puede tener múltiples comentarios

**Cascada:**
- Si se elimina el tablero, se eliminan todas sus tareas
- Si se elimina la tarea, se eliminan todos sus comentarios

**Estados (status - Int):**
- `1` - TODO (Por hacer)
- `2` - PROGRESS (En progreso)
- `3` - TEST (En pruebas)
- `4` - COMPLETE (Completado)

**Prioridades:**
- `LOW` - Baja
- `MEDIUM` - Media (por defecto)
- `HIGH` - Alta
- `URGENT` - Urgente

**Campos de Planificación:**
- `startDate` - Fecha de inicio de la tarea (opcional)
- `dueDate` - Fecha límite para completar la tarea (opcional)
- `effortHours` - Esfuerzo estimado en horas (opcional)

---

### **Comment** (Comentario)
Representa un comentario en una tarea.

```prisma
model Comment {
  id      String @id @default(uuid())
  content String @db.Text
  taskId  String
  task    Task   @relation(fields: [taskId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Relaciones:**
- Pertenece a una tarea

**Cascada:**
- Si se elimina la tarea, se eliminan todos sus comentarios

---

### **Tag** (Etiqueta)
Representa una etiqueta que se puede asignar a las tareas.

```prisma
model Tag {
  id    String @id @default(uuid())
  name  String @unique
  color String @default("#3B82F6")
  tasks Task[]
  createdAt DateTime @default(now())
}
```

**Relaciones:**
- Puede estar asignada a múltiples tareas (relación muchos a muchos)

**Restricciones:**
- El nombre debe ser único

---

## 🔄 Relaciones Visuales

```
┌─────────────┐
│   Client    │
│  (Cliente)  │
└──────┬──────┘
       │ 1:N
       │
┌──────▼──────┐
│   Project   │
│ (Proyecto)  │
└──────┬──────┘
       │ 1:1
       │
┌──────▼──────┐
│    Board    │
│  (Tablero)  │
└──────┬──────┘
       │ 1:N
       │
┌──────▼──────────────┐       ┌──────────┐
│       Task          │◄─────►│   Tag    │
│     (Tarea)         │  N:M  │(Etiqueta)│
│                     │       └──────────┘
│ status: 1-4         │
│ startDate           │       ┌──────────┐
│ dueDate             │       │ Comment  │
│ effortHours         │◄──────┤(Comentario)
│                     │  1:N  └──────────┘
└─────────────────────┘
```


---

## ⚡ Ventajas de Usar Enteros para Status

### 📊 **Comparación de Almacenamiento:**

| Tipo | Bytes por valor | 1M tareas |
|------|----------------|-----------|
| **String "PROGRESS"** | ~8-12 bytes | ~10 MB |
| **Int (1-4)** | 4 bytes | ~4 MB | 
| **Ahorro** | ~60% | ~6 MB |

### ✅ **Ventajas:**

1. **Menos espacio**: 60% menos almacenamiento
2. **Más rápido**: Comparaciones numéricas son más rápidas que strings
3. **Índices más pequeños**: Mejora el rendimiento de queries
4. **Type-safe**: Con constantes TypeScript mantienes seguridad de tipos

---

## 💻 Uso en el Código

### **Constantes TypeScript:**

```typescript
// src/shared/constants/task-status.ts
export const TaskStatus = {
  TODO: 1,
  PROGRESS: 2,
  TEST: 3,
  COMPLETE: 4,
} as const;

export const TaskStatusNames = {
  [TaskStatus.TODO]: "Por hacer",
  [TaskStatus.PROGRESS]: "En progreso",
  [TaskStatus.TEST]: "En pruebas",
  [TaskStatus.COMPLETE]: "Completado",
};
```

### **Ejemplo de Uso:**

```typescript
import { TaskStatus } from "@/shared/constants";

// Crear tarea
await prisma.task.create({
  data: {
    title: "Nueva tarea",
    status: TaskStatus.TODO,  // Type-safe!
    boardId: boardId
  }
});

// Mover tarea
await prisma.task.update({
  where: { id: taskId },
  data: { status: TaskStatus.PROGRESS }
});

// Obtener tareas por estado
const todoTasks = await prisma.task.findMany({
  where: { 
    boardId: boardId,
    status: TaskStatus.TODO 
  }
});

// Obtener nombre legible
const statusName = TaskStatusNames[task.status]; // "Por hacer"
```

---

## 🗑️ Comportamiento de Eliminación (Cascade)

```
Eliminar Cliente
    ↓ (CASCADE)
Elimina todos sus Proyectos
    ↓ (CASCADE)
Elimina todos los Tableros
    ↓ (CASCADE)
Elimina todas las Tareas
```

**Nota:** Las etiquetas NO se eliminan cuando se elimina una tarea, ya que pueden estar asociadas a otras tareas.

---

## 🚀 Comandos Útiles

### Crear una migración
```bash
pnpm db:migrate
```

### Generar el cliente de Prisma
```bash
pnpm db:generate
```

### Sincronizar schema sin migración (desarrollo)
```bash
pnpm db:push
```

### Abrir Prisma Studio (GUI para ver la DB)
```bash
pnpm db:studio
```

---

## 📝 Ejemplo de Datos

```
Cliente: "Acme Corp"
  └── Proyecto: "Sitio Web Corporativo"
      └── Tablero: "Tablero Principal"
          └── Tareas:
              ├── "Diseñar homepage" 
              │   ├── status: 1 (TODO)
              │   ├── priority: HIGH
              │   ├── startDate: 2026-02-15
              │   ├── dueDate: 2026-02-20
              │   ├── effortHours: 8
              │   ├── Tags: ["Diseño", "Urgente"]
              │   └── Comentarios:
              │       └── "Necesitamos incluir el nuevo logo"
              │
              ├── "Crear wireframes" 
              │   ├── status: 1 (TODO)
              │   ├── priority: MEDIUM
              │   ├── dueDate: 2026-02-18
              │   ├── effortHours: 4
              │   └── Tags: ["Diseño"]
              │
              ├── "Desarrollar navbar" 
              │   ├── status: 2 (PROGRESS)
              │   ├── priority: MEDIUM
              │   ├── startDate: 2026-02-14
              │   ├── dueDate: 2026-02-16
              │   ├── effortHours: 6
              │   ├── Tags: ["Desarrollo", "Frontend"]
              │   └── Comentarios:
              │       ├── "Ya está el diseño responsive"
              │       └── "Falta agregar el menú móvil"
              │
              ├── "Testing responsive" 
              │   ├── status: 3 (TEST)
              │   ├── priority: HIGH
              │   ├── startDate: 2026-02-13
              │   ├── effortHours: 3
              │   └── Tags: ["Testing", "QA"]
              │
              └── "Setup del proyecto" 
                  ├── status: 4 (COMPLETE)
                  ├── priority: LOW
                  ├── startDate: 2026-02-10
                  ├── effortHours: 2
                  └── Tags: ["Setup"]
```


---

## 💡 Ejemplo de Uso en el Frontend

```typescript
import { TaskStatus, TaskStatusNames } from "@/shared/constants";

// Obtener tareas agrupadas por estado
const board = await prisma.board.findUnique({
  where: { projectId },
  include: {
    tasks: {
      include: { tags: true },
      orderBy: { createdAt: 'asc' }
    }
  }
});

// Agrupar por estado
const tasksByStatus = {
  [TaskStatus.TODO]: board.tasks.filter(t => t.status === TaskStatus.TODO),
  [TaskStatus.PROGRESS]: board.tasks.filter(t => t.status === TaskStatus.PROGRESS),
  [TaskStatus.TEST]: board.tasks.filter(t => t.status === TaskStatus.TEST),
  [TaskStatus.COMPLETE]: board.tasks.filter(t => t.status === TaskStatus.COMPLETE),
};

// Renderizar columnas
<KanbanBoard>
  <Column 
    title={TaskStatusNames[TaskStatus.TODO]} 
    tasks={tasksByStatus[TaskStatus.TODO]} 
  />
  <Column 
    title={TaskStatusNames[TaskStatus.PROGRESS]} 
    tasks={tasksByStatus[TaskStatus.PROGRESS]} 
  />
  <Column 
    title={TaskStatusNames[TaskStatus.TEST]} 
    tasks={tasksByStatus[TaskStatus.TEST]} 
  />
  <Column 
    title={TaskStatusNames[TaskStatus.COMPLETE]} 
    tasks={tasksByStatus[TaskStatus.COMPLETE]} 
  />
</KanbanBoard>
```

---

## 🎯 Próximos Pasos

1. ✅ Schema optimizado con enteros
2. ✅ Constantes TypeScript creadas
3. ⏳ Crear migración: `pnpm db:migrate`
4. ⏳ Generar cliente: `pnpm db:generate`
5. ⏳ Implementar repositories
6. ⏳ Implementar services
7. ⏳ Implementar handlers
