---
layout: post
title: 'Thread-Safe Counter in Java: A Comprehensive Guide'
original_url: 'https://bazlur.ca/2023/08/17/thread-safe-counter-in-java-a-comprehensive-guide/'
date_published: '2023-08-17T00:00:00+00:00'
date_scraped: '2025-08-05T14:21:18.027071'
featured_image: '/images/4738b5a0-8697-4b56-aa36-d13fcb47dd8a.jpeg'
---

<img src="/images/4738b5a0-8697-4b56-aa36-d13fcb47dd8a.jpeg" alt="" />

Thread-Safe Counter in Java: A Comprehensive Guide
==================================================

**In this tutorial, we will explore the concept of thread safety in Java, specifically focusing on a simple counter.**

We will start by understanding why a basic counter is not safe for multiple threads; then, we will progressively enhance its thread safety using different techniques such as synchronization, locks, Unsafe, VarHandle, and finally, AtomicInteger.

We will be referencing the code from this [repository](https://github.com/rokon12/counter) throughout the tutorial.  


Before we dive into the different implementations, let's define a Counter interface that all our counter classes will implement.

This interface will provide a standard way to interact with the counters, regardless of their underlying implementation.

```
public sealed interface Counter{

    void increment();

    int get();

}
```

**The Basic Counter and Its Thread-Safety Issue**
-------------------------------------------------

Consider a simple counter implemented in Java:

```
public class SimpleCounter implements Counter{

    private int count = 0;

    public void increment() {

        count++;

    }

    public int getCount() {

        return count;

    }

}
```

This counter works perfectly in a single-threaded environment. However, when multiple threads are involved, it may not behave as expected. This is because the increment() operation is not atomic.

It involves three separate operations: reading the current value of count, incrementing this value, and writing it back to count. If two threads call increment() at the same time, they might read the same value, increment it, and write it back, effectively causing one increment to be lost.

This is a classic example of a race condition.

**Making the Counter Thread-Safe with Synchronization**
-------------------------------------------------------

Java provides a built-in mechanism for thread-safety: synchronization.

By declaring a method synchronized, we ensure that only one thread can execute it at a time.

Here's how we can make our counter thread-safe using synchronization:

```
public class SynchronizedCounter implements Counter{

    private int count = 0;

    public synchronized void increment() {

        count++;

    }

    public synchronized int getCount() {

        return count;

    }

}
```

Now, even if multiple threads call increment() simultaneously, each call will be executed one after the other, ensuring the correct count.

**Enhancing Thread-Safety with ReentrantLock**
----------------------------------------------

While synchronization is simple and effective, it doesn't provide flexibility in handling lock acquisition and release. Java's ReentrantLock gives us more control and can lead to more efficient concurrent code. Here's our counter using a [ReentrantLock](https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/locks/ReentrantLock.html):

```
package ca.bazlur;

import java.util.concurrent.locks.*;

public final class ThreadSafeCounterUsingLock implements Counter {
    private final Lock lock = new ReentrantLock();
    private int value = 0;

    @Override
    public void increment() {
        lock.lock();
        try {
            ++value;
        } finally {
            lock.unlock();
        }
    }

    @Override
    public int get() {
        lock.lock();
        try {
            return value;
        } finally {
            lock.unlock();
        }
    }
}
```

**Advanced Techniques: Unsafe and VarHandle**

Java provides some advanced tools for handling concurrency. Unsafe and VarHandle are two such tools that provide low-level operations for concurrency control and memory management. However, they should be used with caution, as they can lead to complex and error-prone code.

Here's how we can use Unsafe to implement our counter:

```
import sun.misc.Unsafe;

public class UnsafeCounter implements Counter {

    private volatile int count = 0;

    private static final Unsafe unsafe = Unsafe.getUnsafe();

    private static final long valueOffset;

    static {

        try {

            valueOffset = unsafe.objectFieldOffset

                (UnsafeCounter.class.getDeclaredField("count"));

        } catch (Exception ex) { throw new Error(ex); }

    }

    public void increment() {

        int current;

        do {

            current = unsafe.getIntVolatile(this, valueOffset);

        } while (!unsafe.compareAndSwapInt(this, valueOffset, current, current + 1));

    }

    public int getCount() {

        return count;

    }

}


```

And here's the counter using VarHandle:

```
package ca.bazlur;

import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;

public final class ThreadSafeCounterUsingVarHandle implements Counter {
    private volatile int value = 0;

    @Override
    public void increment() {
        VALUE.getAndAdd(this, 1);
    }

    @Override
    public int get() {
        return value;
    }

    private final static VarHandle VALUE;

    static {
        try {
            VALUE = MethodHandles.lookup().findVarHandle(
                    ThreadSafeCounterUsingVarHandle.class, "value", int.class);
        } catch (ReflectiveOperationException e) {
            throw new Error(e);
        }
    }
}
```

**Simplifying with AtomicInteger**
----------------------------------

While the above methods are effective, they can be complex and hard to manage. Java provides a simpler way to handle thread-safe counters: AtomicInteger.

This class provides methods for atomically incrementing a value, which is safe to use even in a multi-threaded environment:

```
import java.util.concurrent.atomic.AtomicInteger;

public class AtomicCounter implements Counter{

    private AtomicInteger count = new AtomicInteger(0);

    public void increment() {

        count.incrementAndGet();

    }

    public int getCount() {

        return count.get();

    }

}
```

Another example uses LongAdder, which is considered much more performant than AtomicInteger.

```
package ca.bazlur;

import java.util.concurrent.atomic.*;

public final class LongAdderCounter implements Counter {

    private final LongAdder counter = new LongAdder();

    @Override
    public void increment() {

        counter.increment();

    }

    @Override
    public int get() {

        return counter.intValue();

    }

}
```

In conclusion, Java provides various methods to make a counter thread-safe, with the simplest and most efficient often being the use of high-level concurrency utilities like AtomicInteger.

However, for more complex concurrency scenarios, understanding the underlying mechanisms like synchronization, locks, Unsafe, and VarHandle is essential.

While AtomicInteger serves well in most use cases, LongAdder is highlighted as perhaps the most performant option, as indicated by basic benchmarking.

It's worth noting that achieving accurate results through benchmarking can be challenging, so this information should be approached with caution.  

*** ** * ** ***

Type your email... {#subscribe-email}
