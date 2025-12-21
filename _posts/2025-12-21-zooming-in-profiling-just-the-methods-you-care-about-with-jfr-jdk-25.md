---
layout: post
title: 'Zooming In: Profiling Just the Methods You Care About with JFR (JDK 25)'
original_url: 'https://bazlur.ca/2025/12/21/zooming-in-profiling-just-the-methods-you-care-about-with-jfr-jdk-25/'
date_published: '2025-12-21T00:00:00+00:00'
date_scraped: '2025-12-21T10:42:46.048859059'
featured_image: '/images/chatgpt-image-dec-21-2025-05-33-08-am.png'
---

![](/images/chatgpt-image-dec-21-2025-05-33-08-am.png)

Zooming In: Profiling Just the Methods You Care About with JFR (JDK 25)
=======================================================================

Sometimes you don't want a full JVM profile. You just want to understand a narrow slice of code: which methods are called, how long each call takes, and how time is distributed across a call chain.

With JDK 25, JFR's **Method Trace** and **Method Timing** events (introduced by JEP 520) make this possible. You can scope profiling to specific classes or methods, capture per-invocation durations with stack traces, and also collect aggregated min, avg, and max timings. No logging. No agents. No bytecode tricks.

This article walks through a minimal, reproducible setup using **programmatic control**, so the recording covers only the code you care about.

*** ** * ** ***

1) The code we want to profile
------------------------------

The `Sample` class is intentionally simple and deterministic. It gives us a clear call chain and predictable timings.

```
package ca.bazlur;

public class Sample {
  void main() throws Exception {
    Sample s = new Sample();
    s.work();
    Thread.sleep(200); 
  }

  void work() {
    stepA();
    stepB();
  }

  void stepA() {
    busy(50);
  }

  void stepB() {
    busy(120);
  }

  void busy(long millis) {
    long end = System.currentTimeMillis() + millis;
    while (System.currentTimeMillis() < end) {
      // spin
    }
  }
}

```

Key properties of this example:

* A single flow: `main → work → stepA/stepB → busy`
* Two clearly different execution times
* No I/O or external dependencies

*** ** * ** ***

2) Programmatic JFR control with Method Trace and Method Timing
---------------------------------------------------------------

Instead of enabling JFR globally, we start and stop it around the exact workload we want to measure.

```
package ca.bazlur;

import jdk.jfr.Configuration;
import jdk.jfr.Recording;

import java.nio.file.Path;
import java.util.Map;

public class SampleRunner {
  void main() throws Exception {
    try (Recording r = new Recording(Configuration.getConfiguration("profile"))) {
      r.setSettings(Map.of(
          // Aggregated timings
          "jdk.MethodTiming#enabled", "true",
          "jdk.MethodTiming#filter", "ca.bazlur.Sample",
          "jdk.MethodTiming#threshold", "0 ns",
          "jdk.MethodTiming#period", "100 ms",
          // Per-call traces
          "jdk.MethodTrace#enabled", "true",
          "jdk.MethodTrace#filter", "ca.bazlur.Sample",
          "jdk.MethodTrace#stackTrace", "true",
          "jdk.MethodTrace#threshold", "0 ns"
      ));

      r.setDestination(Path.of("sample2.jfr"));
      r.setDumpOnExit(true);
      r.start();

      new Sample().work();
      Thread.sleep(500);

      r.stop();
    }
  }
}
```

What this setup does:

* Uses the **`profile` configuration** for sensible defaults
* Enables **MethodTrace** for per-invocation timing + stacks
* Enables **MethodTiming** for periodic aggregates
* Filters instrumentation to `ca.bazlur.Sample`
* Keeps the recording short-lived and focused

*** ** * ** ***

3) Compile and run
------------------

```bash
javac -d out src/main/java/ca/bazlur/Sample.java \
            src/main/java/ca/bazlur/SampleRunner.java

java -cp out ca.bazlur.SampleRunner
```

This produces a recording named `sample2.jfr`.

*** ** * ** ***

4) Inspect aggregated timings
-----------------------------

Run:

```bash
jfr print --events jdk.MethodTiming sample2.jfr
```

You'll see multiple `jdk.MethodTiming` blocks for the same methods, each with a different `startTime`. That's expected.

### How MethodTiming works

**MethodTiming is periodic.**   

Because we configured:

    jdk.MethodTiming#period = 100 ms

JFR emits one aggregate snapshot per period. Each block answers:
> "What completed during this 100 ms window?"

*** ** * ** ***

### Reading the output

Example:

    jdk.MethodTiming {
      method = ca.bazlur.Sample.work()
      invocations = 1
      average = 170 ms
    }

This means:

* `work()` completed once in that period
* The total execution time was \~170 ms
* Min, avg, and max are identical because there was only one call

Now look at its children:

    method = ca.bazlur.Sample.stepA()  → ~49.6 ms
    method = ca.bazlur.Sample.stepB()  → ~120 ms

Together, they account for almost all of `work()`'s execution time.

*** ** * ** ***

### Why some methods show `invocations = 0`

You'll often see entries like:

    method = ca.bazlur.Sample.stepB()
    invocations = 0

This does **not** mean the method wasn't called.

It means:

* The method **did not finish** during that particular 100 ms window
* Its execution either hadn't started yet or was still in progress

Longer-running methods often appear as `0` in early periods and show up later once they complete.

*** ** * ** ***

### Understanding aggregation with `busy(long)`

    method = ca.bazlur.Sample.busy(long)
    invocations = 2
    average = 84.8 ms
    maximum = 120 ms

This reflects two completed calls in the same period:

* `busy(50)`
* `busy(120)`

The average is the mean of both calls, and the maximum highlights the slower one. This is exactly where MethodTiming is useful: it summarizes behavior without drowning you in per-call detail.

*** ** * ** ***

5) Inspect per-invocation traces and stacks
-------------------------------------------

To see individual calls and their call chains:

```bash
jfr print --events jdk.MethodTrace --stack-depth 20 sample2.jfr
```

Each event represents a **single method invocation**, including:

* Exact duration
* Full call stack
* Precise caller-callee relationships

This is where you go when you need to answer *why* something is slow, not just *what* is slow.

*** ** * ** ***

6) How to use MethodTiming and MethodTrace together
---------------------------------------------------

A practical workflow:

1. Start with **MethodTiming**
   * Identify slow or suspicious methods
   * Understand time distribution across a flow
2. Switch to **MethodTrace**
   * Inspect individual calls
   * Examine call stacks and execution paths

Together, they let you move from:
> "Something is slow"  
>
> to  
>
> "This exact call is slow, and here's the stack that caused it."

*** ** * ** ***

7) Running with JFR Method Trace and Method Timing from the CLI
---------------------------------------------------------------

If you don't want to touch the code at all, JDK 25 lets you enable **Method Trace** and **Method Timing** directly from the command line. This is the fastest way to profile a specific class or method in an existing application.

To trace and time methods in `Sample` and write a recording:  
`java -XX:StartFlightRecording=method-trace=Sample,method-timing=Sample,filename=sample.jfr Sample`  

*** ** * ** ***

Why this approach works
-----------------------

* No agents
* No logging noise
* Works on application and library code
* Precise scope and predictable overhead

Instead of profiling the entire JVM and filtering later, you zoom in from the start. Replace `ca.bazlur.Sample` with your own package, wrap the code path you care about, and inspect the recording with `jfr print` or Java Mission Control.

<br />

Happy tracing.  

*** ** * ** ***

Type your email... {#subscribe-email}
