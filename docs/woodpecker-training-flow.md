# Woodpecker Training Flow

**Version:** V1  
**Date:** 2026-06-09  
**Status:** Implemented

---

## Conceptos fundamentales

### Serie (`TrainingSeries`)

Una serie es una colección ordenada y fija de ejercicios. Representa "la cosa que entrenas".

Ejemplos:
- WM1 — Easy Exercises (222 ejercicios)
- WM1 — Intermediate Exercises I (509 ejercicios)
- WM2 completo (1034 ejercicios)

Una serie tiene:
- `sourceName` — libro de origen
- `chapter` — capítulo o null si es libro completo
- `mode` — CHAPTER | FULL_BOOK | FAILED_ONLY | CUSTOM
- `currentIndex` — apunta al próximo ejercicio a resolver en el ciclo activo
- `totalItems` — número fijo de ejercicios en la serie

Una vez creada, los ejercicios no cambian de orden.

### Ciclo (`TrainingCycle`)

Un ciclo es una pasada completa por todos los ejercicios de una serie.

- Ciclo 1: primera vez que entrenas la serie
- Ciclo 2: repites la misma serie para mejorar velocidad y precisión
- Ciclo N: cada repetición registra métricas independientes

Los ciclos son la unidad de medida del progreso: ver que el Ciclo 3 tiene mejor accuracy y menor tiempo que el Ciclo 1 es la evidencia de mejora.

### Intento (`ExerciseAttempt`)

Un intento es cada jugada individual que el usuario realiza.

Un ejercicio puede tener múltiples intentos (si falla y vuelve a intentar). Se guarda:
- Si fue correcto o incorrecto
- Tiempo en milisegundos
- Jugada realizada vs jugada esperada
- FEN en el momento del intento
- Número de intento (1 = primer intento en este ciclo)

---

## Flujo completo V1

### 1. Crear una serie

```
POST /api/training-series
{
  "sourceName": "The Woodpecker Method",
  "chapter": "Easy Exercises",
  "mode": "CHAPTER"
}
```

El servidor:
1. Busca todos los TrainingItems con esos filtros
2. Los ordena por capítulo + exerciseNumber (orden del libro)
3. Excluye Introduction y Summary Of Tactical Motifs
4. Crea `TrainingSeries` con `currentIndex = 0`
5. Crea `TrainingSeriesItem` para cada ejercicio con su `orderIndex`
6. Crea `TrainingCycle` número 1 con status ACTIVE

Responde con la serie creada. El cliente navega a `/practice/series/[id]`.

### 2. Resolver ejercicios

La página `/practice/series/[id]` carga:
- La serie
- El ciclo activo
- El ejercicio en `currentIndex`

El usuario resuelve el ejercicio con el tablero chessground.

Por cada intento (correcto o incorrecto):
```
POST /api/training-series/[id]/attempt
{
  "trainingItemId": "...",
  "movePlayed": "e2e4",
  "expectedMove": "e2e4",
  "isCorrect": true,
  "timeMs": 8500,
  "fen": "...",
  "attemptNumber": 1
}
```

El servidor:
1. Guarda el `ExerciseAttempt`
2. Si es correcto, **O** si `movePlayed === "__SOLUTION_SHOWN__"` (solución revelada), y es la primera vez en este ciclo:
   - Incrementa `TrainingSeries.currentIndex`
   - Recalcula métricas del ciclo (`solvedCount`, `correctCount`, `accuracy`, `averageTimeMs`, `bestStreak`)
3. Responde con `nextExerciseId` y `isLastExercise`

### 3. Terminar una serie

Cuando `isLastExercise = true`:
- El API auto-completa el ciclo (`status = COMPLETED`)
- Marca la serie como `status = COMPLETED`
- El cliente navega a `/practice/series/[id]/summary`

### 4. Ver resumen

`/practice/series/[id]/summary` muestra:
- Stats del ciclo completado (accuracy, tiempo, racha)
- Tabla de comparación entre todos los ciclos completados
- Botón "Start Cycle N+1"

### 5. Iniciar siguiente ciclo

```
POST /api/training-series/[id]/start-next-cycle
```

El servidor:
1. Crea un nuevo `TrainingCycle` con `cycleNumber = anterior + 1`
2. Resetea `TrainingSeries.currentIndex = 0`
3. Marca la serie como `status = ACTIVE`
4. Devuelve el nuevo ciclo y el primer ejercicio

Los `TrainingSeriesItems` no cambian — los mismos ejercicios en el mismo orden.

---

## Orden de ejercicios

### WM1

Orden del libro (no alfabético):

1. Introduction (excluido por defecto)
2. Easy Exercises
3. Intermediate Exercises I
4. Intermediate Exercises III
5. Advanced Exercises
6. Summary Of Tactical Motifs (excluido siempre)

Dentro de cada capítulo: por `exerciseNumber` ascendente.

### WM2

Capítulos por rango numérico: Chapter 1-50, Chapter 51-100, ..., Chapter Epilogue.

Dentro de cada capítulo: por `exerciseNumber` ascendente.

Implementado en `lib/training/series-order.ts`.

---

## Cálculo de métricas

Implementado en `lib/training/metrics.ts`.

### Accuracy

```
accuracy = (ejercicios resueltos en el primer intento correcto) / (total ejercicios resueltos)
```

Nota: un ejercicio puede tener múltiples intentos fallidos antes de acertar. Accuracy mide cuántos se resolvieron a la primera.

### Tiempo promedio

```
averageTimeMs = totalTimeMs / solvedCount
```

Donde `totalTimeMs` es la suma del tiempo del primer intento correcto de cada ejercicio.

### Mejor racha

Número máximo de ejercicios correctos consecutivos en el ciclo.

### Progreso WM1/WM2

Fracción de ejercicios del libro resueltos al menos una vez en cualquier ciclo.

---

## Regla V1 — Show solution

**Show solution = ejercicio completado con ayuda.**

- Se guarda como `ExerciseAttempt` con `isCorrect = false` y `movePlayed = "__SOLUTION_SHOWN__"` (constante `SOLUTION_SHOWN_MOVE` de `lib/training/attempt-types.ts`).
- El ejercicio **cuenta como completado** para avanzar el `currentIndex` de la serie.
- **NO** cuenta como correcto — no aumenta `correctCount`.
- **Baja accuracy** — el denominador (`solvedCount`) sube pero `correctCount` no.
- **Corta la racha** (`bestStreak`) — se trata como un intento `isCorrect: false`.
- **Permite continuar** — el API devuelve `nextExerciseId` igual que para un intento correcto.
- **Aparece en historial** como fallo — candidato para series FAILED_ONLY en V2.
- El sentinel `"__SOLUTION_SHOWN__"` nunca pasa por `normalizeUciMove` como movimiento UCI válido.

---

## V1 — Lo que está implementado

- Crear series de cualquier capítulo WM1 o WM2 completo
- Resolver ejercicios en orden del libro
- Guardar cada intento en PostgreSQL
- Calcular y actualizar métricas del ciclo en tiempo real
- Completar una serie
- Iniciar ciclo siguiente sobre la misma serie
- Comparar métricas entre ciclos en la página de resumen
- Perfil con métricas reales (o empty state si no hay datos)
- Practice hub con "Continue Series" para series activas

---

## V2 — Pendiente

- Validar línea completa de solution_moves (no solo primer movimiento)
- Repetir automáticamente ejercicios fallados al final del ciclo
- Spaced repetition (ejercicios fallados aparecen antes)
- Dificultad adaptativa
- Series de "ejercicios fallados" (modo FAILED_ONLY)
- Estadísticas por capítulo (capítulos débiles)
- Autenticación real de usuarios (actualmente usa devUserId)
- Heatmap de actividad en el perfil

---

## Archivos clave

| Archivo | Función |
|---|---|
| `lib/training/attempt-types.ts` | Constante `SOLUTION_SHOWN_MOVE` |
| `lib/training/series-order.ts` | Ordenamiento WM1/WM2 |
| `lib/training/metrics.ts` | Cálculo de métricas |
| `lib/training/next-exercise.ts` | Siguiente ejercicio en ciclo |
| `lib/db.ts` | Todas las queries DB para series/ciclos |
| `app/api/training-series/` | API routes |
| `components/practice/SeriesPracticeClient.tsx` | UI del entrenamiento por serie |
| `components/practice/PuzzlePlayer.tsx` | Tablero + lógica de puzzle |
| `app/(app)/practice/series/[id]/page.tsx` | Página de entrenamiento |
| `app/(app)/practice/series/[id]/summary/page.tsx` | Resumen de ciclo |

---

## Cómo probar desde cero

1. Asegúrate de tener PostgreSQL corriendo (Docker Compose)
2. `npm run db:seed` — importa los 2179 ejercicios
3. `npm run dev` — inicia la app
4. Ve a `/practice`
5. Haz click en "Start Series" en cualquier capítulo de WM1
6. Resuelve ejercicios
7. Al terminar la serie, ve al summary
8. Haz click en "Start Cycle 2"
9. Ve a `/profile` para ver las métricas reales
