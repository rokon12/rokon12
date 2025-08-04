---
title: 'Unsafe is Finally Going Away: Embracing Safer Memory Access with JEP 471'
original_url: 'https://bazlur.ca/2024/07/11/unsafe-is-finally-going-away-embracing-safer-memory-access-with-jep-471/'
date_published: '2024-07-11T00:00:00+00:00'
date_scraped: '2025-02-15T11:25:08.709715288'
tags: ['java', 'security']
featured_image: images/gemini-generated-image-9cppb89cppb89cpp.jpeg
---

![](images/gemini-generated-image-9cppb89cppb89cpp.jpeg)

Unsafe is Finally Going Away: Embracing Safer Memory Access with JEP 471
========================================================================

Java, being a safe language, doesn't usually allow direct low-level access. Memory is primarily managed on the heap, so developers don't typically deal with memory directly. However, library developers are occasionally required to manipulate memory outside the heap for performance or specific use cases. This is where the controversial [**sun.misc.Unsafe**](https://github.com/openjdk/jdk/blob/master/src/jdk.unsupported/share/classes/sun/misc/Unsafe.java) comes in.

While undeniably powerful, **sun.misc.Unsafe** is a double-edged sword. Its improper use can lead to severe consequences, including memory leaks, crashes due to invalid memory access, and even security vulnerabilities like buffer overflows. As the name suggests, it's inherently unsafe.

For over a decade, the Java community has grappled with the challenge of addressing the widespread use of **sun.misc.Unsafe** in numerous libraries while mitigating its risks. Finally, with [JEP 471](https://openjdk.org/jeps/471), **sun.misc.Unsafe**'s memory-access methods are set to be deprecated, marking a clear pathway to their eventual removal.

Safe and Efficient Alternatives
-------------------------------

Two standard APIs now provide safe and efficient alternatives to **sun.misc.Unsafe**.

[**VarHandle API**](https://docs.oracle.com/javase%2F9%2Fdocs%2Fapi%2F%2F/java/lang/invoke/VarHandle.html): Introduced in JDK 9, it offers a modern, type-safe way to handle variable access. It provides similar capabilities to **Unsafe** but with built-in safety.

[**Foreign Function \& Memory API**](https://docs.oracle.com/en/java/javase/22/docs/api/java.base/java/lang/foreign/package-summary.html): Available from JDK 22, this API allows safe interaction with native memory and functions, promoting better memory management practices.

Code Example: Atomic Counter
----------------------------

To illustrate the transition, let's consider the **AtomicCounter** class, a simple thread-safe counter often implemented using **sun.misc.Unsafe** :  

```
import sun.misc.Unsafe;

public class AtomicCounter {
   private static final Unsafe UNSAFE;
   private static final long COUNT_OFFSET;

   static {
       try {
           UNSAFE = Unsafe.getUnsafe(); // Obtain Unsafe instance
           COUNT_OFFSET = UNSAFE.objectFieldOffset(
                   AtomicCounter.class.getDeclaredField("count"));
       } catch (Exception e) {
           throw new Error(e);
       }
   }

   private volatile int count = 0;

   public int increment() {
       while (true) {
           int current = count;
           int next = current + 1;
           if (UNSAFE.compareAndSwapInt(this, COUNT_OFFSET, current, next)) {
               return next;
           }
           // Retry if CAS fails due to concurrent updates
       }
   }

   public int decrement() {
       while (true) {
           int current = count;
           int next = current - 1;
           if (UNSAFE.compareAndSwapInt(this, COUNT_OFFSET, current, next)) {
               return next;
           }
       }
   }

   public int get() {
       return count;
   }
}
```

<br />


While the above code is accessible in the earlier JDK version, from now on, the following version using VarHandle is advised.   

```
import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;

public class AtomicCounterUsingVarHandle {
   private static final VarHandle COUNT_HANDLE;

   static {
       try {
           COUNT_HANDLE = MethodHandles.lookup().findVarHandle(
                   AtomicCounterUsingVarHandle.class, "count", int.class);
       } catch (NoSuchFieldException | IllegalAccessException e) {
           throw new Error(e);
       }
   }

   private volatile int count = 0;

   public int increment() {
       int current;
       do {
           current = (int) COUNT_HANDLE.getVolatile(this);
       } while (!COUNT_HANDLE.compareAndSet(this, current, current + 1));
       return current + 1;
   }

   public int decrement() {
       int current;
       do {
           current = (int) COUNT_HANDLE.getVolatile(this);
       } while (!COUNT_HANDLE.compareAndSet(this, current, current - 1));
       return current - 1;
   }

   public int get() {
       return (int) COUNT_HANDLE.getVolatile(this);
   }
}
```

Phased Deprecation and Migration
--------------------------------

The migration will occur in several phases, each aligned with a separate JDK release:

1. **Phase 1 (JDK 23)**: All memory-access methods will be deprecated, and compile-time warnings will be issued.
2. **Phase 2 (JDK 25 or earlier)**: Runtime warnings will be introduced whenever the deprecated methods are used.
3. **Phase 3 (JDK 26 or later)**: When these methods are invoked, the response will escalate by default, throwing exceptions.
4. **Phases 4 and 5**: The deprecated methods will be removed, potentially occurring in the same release.

Conclusion
----------

Developers are encouraged to transition to the VarHandle API and the Foreign Function \& Memory API.

The phased deprecation provides ample time for adaptation, ensuring a smoother transition. For more about it, read my [infoQ news](https://www.infoq.com/news/2024/06/jep-456-removing-unsafe-methods/) item.  

*** ** * ** ***

---

📬 **Stay Updated**: Subscribe to my newsletter at [bazlur.substack.com](https://bazlur.substack.com/) for more articles on Java, Software Architecture, and Technology.
