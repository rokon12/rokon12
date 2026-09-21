---
layout: post
title: 'Java Virtual Threads Under Load: Three Limits to Make Explicit'
original_url: 'https://bazlur.ca/2026/09/21/java-virtual-threads-under-load/'
date_published: '2026-09-21T04:56:21Z'
date_scraped: '2026-09-21T21:42:57.913078377'
featured_image: '/images/gemini-generated-image-f6qsoyf6qsoyf6qs-1-scaled.jpeg'
tags: [concurrency, java, jdk 25, openjdk, project loom, structured concurrency, thread programming, virtual threads 2]
---

Java Virtual Threads Under Load: Three Limits to Make Explicit
==============================================================

![](/images/gemini-generated-image-f6qsoyf6qsoyf6qs-1-scaled.jpeg)  
Virtual threads let us keep ordinary blocking code while many more requests wait concurrently. Under load, however, that brings three critical questions into focus:

* **How much work do we admit?** Cheap threads can still build an expensive queue.
* **What belongs inside a lock?** A sleeping lock holder still makes everyone else wait.
* **Who stops abandoned work?** A caller's timeout does not cancel its task.

The examples below isolate these questions with separate before-and-after programs. Each program is complete: save its code block under the filename shown and run the accompanying command, without arguments. All you need is JDK 25. They use its compact source-file syntax, so no class declaration, build tool, external library, or preview flag is required.

First: More Overlapping Waits
-----------------------------

Imagine 1,000 tasks that each wait for 100 ms, with no dependency limiting their concurrency:

|                  Execution model                   | Simultaneous waits | Ideal elapsed time |
|----------------------------------------------------|--------------------|--------------------|
| Pool of 50 platform threads                        | 50                 | 2,000 ms           |
| One virtual thread per task, all waits overlapping | 1,000              | 100 ms             |
| Virtual threads limited to 50 concurrent waits     | 50                 | 2,000 ms           |

These are arithmetic estimates, ignoring startup and scheduling overhead. With 50 workers, the waits take twenty batches. Allow all 1,000 waits to overlap and they take one batch. Cap virtual-thread concurrency at 50 and the twenty-batch result returns.

**Virtual threads let more independent waits overlap.** They do not execute CPU instructions faster.

A virtual thread runs on a platform thread called a *carrier*. Many blocking JDK operations, including socket I/O and sleep, let it unmount while waiting. Its stack and referenced objects remain on the heap, and the carrier can run something else.

![](/images/screenshot-2026-09-20-at-2.01.09-am.png)

*(The M:N scheduling model: Many virtual threads map to a smaller pool of OS carrier threads)*

The scheduler's default target parallelism is the number of processors available to the JVM. Some blocking operations still occupy a carrier; native and foreign-function calls can pin virtual threads even on JDK 25. Waiting uses fewer OS threads, but it still costs memory and resources.

1. Bound Admission: Eight Slots Cannot Serve Everybody at Once
--------------------------------------------------------------

Imagine a dependency with eight connections. Each call takes 80 ms. Its ideal capacity is 8 / 0.08 = 100 calls per second. Virtual threads can wait cheaply for a connection, but they cannot create another one.

Send a burst of 100 requests. First, accept everything. Then, repeat with an admission limit of 32: up to eight using the dependency and another 24 waiting for it.

First, accept every request. Save as **UnboundedAdmission.java**:

```
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.concurrent.*;

void main() throws Exception {
    var connections = new Semaphore(8);
    var results = new ArrayList<Future<?>>();
    Instant now = Instant.now();

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        for (int i = 0; i < 100; i++) {
            results.add(executor.submit(() -> {
                connections.acquire();
                try {
                    Thread.sleep(Duration.ofMillis(80));     // the dependency call
                } finally {
                    connections.release();
                }
                return null;
            }));
        }
    }   // wait for all work to finish

    for (var result : results) result.get();
    IO.println("completed=%d rejected=0 elapsed_ms=%d".formatted(
            results.size(), Duration.between(now, Instant.now()).toMillis()));
}
```

Run it:

```
java UnboundedAdmission.java
```

Every request waits until a connection becomes available. Now add an admission semaphore so excess requests are rejected immediately. Save as **BoundedAdmission.java**:

```
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.concurrent.*;

void main() throws Exception {
    var connections = new Semaphore(8);
    var admission = new Semaphore(32);
    var results = new ArrayList<Future<Boolean>>();
    Instant now = Instant.now();

    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        for (int i = 0; i < 100; i++) {
            results.add(executor.submit(() -> {
                if (!admission.tryAcquire()) return false;
                try {
                    connections.acquire();
                    try {
                        Thread.sleep(Duration.ofMillis(80));     // the dependency call
                    } finally {
                        connections.release();
                    }
                    return true;
                } finally {
                    admission.release();
                }
            }));
        }
    }   // wait for accepted work to finish

    int completed = 0;
    for (var result : results) if (result.get()) completed++;
    IO.println("completed=%d rejected=%d elapsed_ms=%d".formatted(
            completed, 100 - completed, Duration.between(now, Instant.now()).toMillis()));
}
```

Run it:

```
java BoundedAdmission.java
```

One run on Oracle GraalVM 25.0.2 produced:

|  Admission  | Completed | Rejected | Elapsed time |
|-------------|-----------|----------|--------------|
| Unlimited   | 100       | 0        | 1,062 ms     |
| Limit of 32 | 32        | 68       | 330 ms       |

There are two different limits here. connections.acquire() waits for one of eight service slots. admission.tryAcquire() admits the request immediately or returns false, recording a rejection. Its permit stays held while the request waits for a connection and makes the call.

Without admission control, all 100 requests complete in thirteen batches, taking roughly a second. With the gate, a quick burst typically admits 32 and rejects 68; four batches take roughly 320 ms. The bounded run finishes sooner because it rejects excess work, preventing memory exhaustion. A 10 KB per-thread cache across 100,000 virtual threads is still 1 GB of heap space.

**The takeaway:** Reject before adding work to the queue you need to bound.

2. Shorten the Lock: Protect the Update
---------------------------------------

Now use forty tasks. Each waits 80 ms and increments a shared completion counter. There is no connection limit here: the waits are independent, so the lock is the only bottleneck.

First, put both the wait and the counter update inside the lock. Save as **WideLock.java**:

```
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.concurrent.*;

final Object lock = new Object();
int completed;

void main() throws Exception {
    Instant now = Instant.now();
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var tasks = new ArrayList<Future<?>>();
        for (int i = 0; i < 40; i++) {
            tasks.add(executor.submit(() -> {
                synchronized (lock) {
                    Thread.sleep(Duration.ofMillis(80));
                    completed++;
                }
                return null;
            }));
        }
        for (var task : tasks) task.get();
    }
    if (completed != 40) throw new AssertionError("Lost an update");
    IO.println("completed=%d elapsed_ms=%d".formatted(
            completed, Duration.between(now, Instant.now()).toMillis()));
}
```

Run it:

```
java WideLock.java
```

Now move the wait outside the lock, keeping the counter update protected. Save as **NarrowLock.java**:

```
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.concurrent.*;

final Object lock = new Object();
int completed;

void main() throws Exception {
    Instant now = Instant.now();
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var tasks = new ArrayList<Future<?>>();
        for (int i = 0; i < 40; i++) {
            tasks.add(executor.submit(() -> {
                Thread.sleep(Duration.ofMillis(80));
                synchronized (lock) {
                    completed++;
                }
                return null;
            }));
        }
        for (var task : tasks) task.get();
    }
    if (completed != 40) throw new AssertionError("Lost an update");
    IO.println("completed=%d elapsed_ms=%d".formatted(
            completed, Duration.between(now, Instant.now()).toMillis()));
}
```

Run it:

```
java NarrowLock.java
```

On the same JDK, the two runs produced:

|       Lock scope       | Completed | Elapsed time |
|------------------------|-----------|--------------|
| Wait and update inside | 40        | 3,255 ms     |
| Only the update inside | 40        | 87 ms        |

With the wait inside the lock, forty waits of 80 ms take at least 3,200 ms. Making the other thirty-nine threads cheap to park does not let them pass the lock holder. With the wait outside, those waits overlap.

On JDK 25, synchronized is perfectly suitable for this demonstration, as JDK 24 removed monitor-related virtual-thread pinning. The issue here isn't platform pinning; it's basic thread serialization. The rule is to identify the state transition that needs protection, then keep independent slow work outside of it.

3. Cancel the Work: A Timeout Only Ends the Wait
------------------------------------------------

Use one task that takes 1,800 ms. Its caller is willing to wait only 200 ms. First, let the caller time out without cancelling the task. Save as **TimeoutOnly.java**:

```
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.*;

void main() throws Exception {
    Instant now = Instant.now();
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var task = executor.submit(() -> {
            try {
                Thread.sleep(Duration.ofMillis(1_800));
                IO.println("Work completed");
                return "done";
            } finally {
                IO.println("Cleanup ran");
            }
        });
        try {
            task.get(200, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            IO.println("Caller timed out");
        }
    }   // close() still waits for the task to exit
    IO.println("scope_exited_ms=%d".formatted(
            Duration.between(now, Instant.now()).toMillis()));
}
```

Run it:

```
java TimeoutOnly.java
```

Now add task.cancel(true) to the timeout handler. Save as **TimeoutWithCancellation.java**:

```
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.*;

void main() throws Exception {
    Instant now = Instant.now();
    try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
        var task = executor.submit(() -> {
            try {
                Thread.sleep(Duration.ofMillis(1_800));
                IO.println("Work completed");
                return "done";
            } finally {
                IO.println("Cleanup ran");
            }
        });
        try {
            task.get(200, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            IO.println("Caller timed out");
            task.cancel(true); // <--- Explicit cancellation
        }
    }   // close() waits for the task to exit, even after cancellation
    IO.println("scope_exited_ms=%d".formatted(
            Duration.between(now, Instant.now()).toMillis()));
}
```

Run it:

```
java TimeoutWithCancellation.java
```

The observed outcomes were:

|          Example          | Printed Work completed? | Printed Cleanup ran? | Scope exited after |
|---------------------------|-------------------------|----------------------|--------------------|
| Timeout alone             | Yes                     | Yes                  | 1,805 ms           |
| Timeout plus cancellation | No                      | Yes                  | 207 ms             |

Without cancellation, get() throws after 200 ms, but the task *keeps sleeping*. It eventually completes its work 1.6 seconds later. If this abandoned work was holding a database connection or an admission permit, that resource would be leaked for the duration of the sleep.

Cancellation is cooperative. Detect the timeout, request cancellation, and wait for the cleanup. All three parts matter.

A Teaser: The Structured Concurrency Solution
---------------------------------------------

In the final example above, you'll notice the parent thread is forced to micromanage the task's lifecycle. It waits, catches the TimeoutException, explicitly calls cancel(true), and crosses its fingers that the cleanup runs.

But what if we could invert this control?

With JDK's preview StructuredTaskScope API, we can tie the lifetime of the threads to the lexical scope itself, making cancellation an automatic architectural guarantee rather than manual boilerplate:

```
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Subtask<String> task = scope.fork(() -> {
        Thread.sleep(Duration.ofMillis(1_800));
        return "done";
    });

    // The deadline is declarative. If it passes, the scope automatically 
    // interrupts all running subtasks before throwing a TimeoutException.
    scope.joinUntil(Instant.now().plusMillis(200));
    scope.throwIfFailed();
}
```

I will be exploring how StructuredTaskScope eliminates resource leaks and abandoned work entirely in my next article. Stay tuned!

Summary
-------

Take these three questions back to your services when migrating to virtual threads:

1. **Where does waiting accumulate?** Bound admission before that queue grows.
2. **What serializes the work?** Keep independent waits outside state-protecting locks.
3. **Who owns unfinished work?** Connect deadlines to cooperative cancellation and cleanup.

The programs here use sleeps so each effect is visible, but the exact same questions apply when your wait is for a database, a socket, or a partner API.
