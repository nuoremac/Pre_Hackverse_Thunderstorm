# Smart Planning Manager

## Project Overview

Our project is a **smart planning manager** that helps a user transform a simple list of tasks into a realistic and optimized schedule.

Instead of only storing tasks, the application:

- collects tasks and deadlines,
- takes into account the user's availability and constraints,
- computes task priority,
- generates a planning automatically,
- detects conflicts and overload,
- reschedules work when the situation changes.

The objective is to help students or busy users organize their time intelligently rather than manually building a timetable every day.

## Problem Solved

Many students and project members know what they have to do, but they do not know:

- what to start first,
- how to distribute work across the week,
- how to avoid conflicts with classes or meetings,
- whether their workload is realistic,
- how to recover when they miss a planned session.

This project solves that problem by acting as a **small scheduling engine**. The user defines work to do and the system generates the most suitable planning according to priorities and constraints.

## Main Functionalities

### 1. Task Management

The user can:

- create a task,
- view task details,
- edit a task,
- delete a task,
- mark a task as completed,
- track task status.

Each task can contain:

- title,
- description,
- deadline,
- estimated duration,
- priority,
- difficulty,
- category,
- status,
- preferred time of execution,
- splittable or not.

### 2. Constraint Management

The user can define planning constraints such as:

- available hours per day,
- fixed events like classes, meetings, or exams,
- unavailable periods,
- maximum work hours per day,
- preferred work periods,
- break duration,
- allowed or forbidden working days.

These constraints are used by the generator before creating the final schedule.

### 3. Automatic Planning Generation

The application automatically creates a planning by:

- analyzing tasks,
- ranking them according to urgency and importance,
- identifying free time slots,
- placing tasks in valid slots,
- splitting long tasks if necessary,
- inserting breaks,
- avoiding overlaps.

### 4. Conflict Detection

The system checks whether:

- two tasks overlap,
- a task overlaps with a fixed event,
- the day is overloaded,
- a deadline is impossible to meet,
- the generated planning violates a hard constraint.

If a conflict appears, the system warns the user and may propose a reorganization.

### 5. Rescheduling

If the user misses a task or adds a new urgent one, the system can:

- recompute task priorities,
- move flexible tasks,
- redistribute unfinished work to the next available slots,
- regenerate the planning with updated constraints.

### 6. Dashboard and Visualization

The user can visualize:

- daily or weekly planning,
- completed and pending tasks,
- workload distribution,
- urgent tasks,
- missed sessions,
- free time and occupied time.

This part improves usability and demonstrates the intelligence of the scheduling engine.

## Functional Workflow

The main workflow of the application is the following:

1. The user creates tasks with duration, deadline, and priority.
2. The user defines availability and fixed events.
3. The system extracts all free time slots.
4. The system computes a score for each task.
5. The system assigns tasks to the best valid slots.
6. The system inserts breaks and respects constraints.
7. The user receives a generated planning.
8. If something changes, the system reschedules automatically.

## Core Business Logic

The value of the project is centered on the business logic, not only on CRUD operations.

### 1. Priority Scoring Logic

Each task receives a score used to decide what should be scheduled first.

The score can be computed from:

- deadline proximity,
- manual priority,
- estimated duration,
- difficulty,
- category importance,
- risk of lateness.

Example scoring idea:

```text
task_score =
  urgency_score
  + importance_score
  + duration_risk_score
  + difficulty_score
  + lateness_penalty
```

Interpretation:

- a task due tomorrow gets a higher urgency score than a task due next week,
- a very long task gets a higher risk score because it needs earlier placement,
- an overdue or nearly impossible task gets an additional penalty boost.

This logic makes the planner intelligent and defendable during presentation.

### 2. Hard Constraints and Soft Constraints

The scheduler distinguishes between two kinds of constraints.

Hard constraints:

- the task must end before its deadline,
- the task cannot overlap with class or meeting time,
- the user cannot work outside defined availability,
- the system cannot exceed the daily maximum workload.

Soft constraints:

- the user prefers morning sessions,
- the user prefers short sessions in the evening,
- similar tasks should be grouped together,
- difficult tasks should be scheduled during high-focus periods.

Hard constraints are never violated. Soft constraints guide optimization when several valid choices exist.

### 3. Free Slot Extraction

Before scheduling, the system builds a list of usable time slots.

It does this by:

- starting from the user's calendar availability,
- subtracting fixed events,
- subtracting unavailable periods,
- keeping only valid free intervals.

Example:

- available time: 08:00 to 18:00,
- fixed event: 10:00 to 12:00,
- unavailable period: 15:00 to 16:00,

then the free slots become:

- 08:00 to 10:00,
- 12:00 to 15:00,
- 16:00 to 18:00.

These slots are then used by the planning algorithm.

### 4. Feasibility Check

Before generating the planning, the application checks whether the workload is realistic.

The logic compares:

- total remaining task duration before each deadline,
- total available free time before each deadline.

If the required work is greater than the available time, the system flags the planning as impossible or risky.

This allows the app to say things like:

- "Your current tasks cannot all be completed before Friday."
- "You need at least 3 more free hours to meet all deadlines."

This feature is important because it shows reasoning, not only scheduling.

### 5. Automatic Scheduling Algorithm

The planning can be generated using a greedy algorithm, which is realistic for a hackathon MVP.

High-level strategy:

1. sort tasks by descending score,
2. inspect available slots,
3. assign each task to the best slot that satisfies hard constraints,
4. if a task is too long, split it into smaller blocks,
5. continue until all possible tasks are scheduled.

The best slot can be chosen using a slot score.

Example:

```text
slot_score =
  +40 if the slot is before deadline
  +20 if the slot matches preferred period
  +15 if the duration fits well
  -20 if it creates excessive fragmentation
  -30 if it is too late in the day for a difficult task
```

The system picks the valid slot with the highest score.

### 6. Task Splitting Logic

Some tasks are too long to fit in one session.

If the task is marked as splittable, the app can divide it into chunks such as:

- 30 minutes,
- 1 hour,
- 90 minutes.

Example:

- Task: Prepare exam revision, 4 hours
- Planned as:
  - Monday 18:00 to 20:00
  - Tuesday 08:00 to 10:00

This makes the schedule more realistic and avoids impossible blocks.

### 7. Break Insertion Logic

The system can insert rest periods automatically.

Examples:

- after 90 minutes of work, insert a 15-minute break,
- after two difficult sessions, insert a recovery break,
- avoid scheduling more than a maximum continuous work duration.

This improves realism and user comfort.

### 8. Workload Balancing Logic

The app should avoid concentrating all tasks on a single day if multiple days are available.

The balancing logic:

- spreads tasks over the week,
- avoids overloaded days,
- preserves some free buffer time,
- improves consistency of workload.

Example:

Instead of planning 7 hours Monday and 0 hours Tuesday, the system can produce:

- Monday: 3.5 hours
- Tuesday: 3.5 hours

### 9. Dynamic Rescheduling Logic

Planning is not static. If the user misses a session or adds a new urgent task:

- unfinished work is returned to the backlog,
- the priority score is updated,
- free slots are recalculated,
- the planning is regenerated.

This keeps the planner useful even when real life changes the schedule.

## Example Scenario

Suppose the user defines:

- Task A: 3 hours, due tomorrow,
- Task B: 2 hours, due in 4 days,
- Task C: 1 hour, high importance,
- available time today: 18:00 to 22:00,
- available time tomorrow: 08:00 to 12:00,
- fixed class tomorrow: 09:00 to 11:00.

The system will:

1. calculate scores for A, B, and C,
2. detect that Task A is the most urgent,
3. split Task A if needed,
4. place part of Task A today,
5. avoid tomorrow 09:00 to 11:00 because of class,
6. insert Task C or B into the remaining valid slots,
7. warn the user if the total workload becomes impossible.

This example clearly illustrates the scheduling logic.

## Proposed Data Model

The project can be built around the following entities:

### User

- id
- name
- email

### Task

- id
- title
- description
- duration
- deadline
- priority
- difficulty
- category
- status
- preferred_period
- splittable

### Constraint

- id
- type
- value
- is_hard

### FixedEvent

- id
- title
- start_time
- end_time
- recurrence_rule

### ScheduleEntry

- id
- task_id
- start_time
- end_time
- status

## MVP Scope

The following features are enough:

- task CRUD,
- constraint CRUD,
- fixed event management,
- automatic priority scoring,
- free slot extraction,
- automatic schedule generation,
- task splitting,
- conflict detection,
- overload warning,
- rescheduling after change.

This scope is implementable and already demonstrates strong business logic.

## Bonus Features

If time allows, the following features can increase the value of the project:

- energy-based scheduling,
- recurring events,
- dependency management between tasks,
- category grouping,
- statistics and productivity charts,
- multi-user or shared planning,
- explanation panel showing why each task was placed in a given slot.

The explanation panel is especially valuable because it makes the algorithm transparent to judges and users.

## What Makes the Project Intelligent

The project is considered intelligent because it does more than store data. It:

- interprets user constraints,
- ranks tasks using computed scores,
- reasons about time feasibility,
- chooses the best available slots,
- adapts when the schedule changes.

This is the main difference between a simple task manager and a smart planning generator.

## Conclusion

Our application is a **smart planning manager** that combines task management, scheduling constraints, automatic planning, and dynamic rescheduling.

Its strength lies in the scheduling logic:

- prioritization,
- conflict avoidance,
- feasibility analysis,
- optimization of available time,
- adaptive planning.

This makes the project technically solid, useful in real life, and relevant to the hackathon evaluation criteria, especially for:

- functionalities,
- business logic,
- intelligence,
- user experience.
