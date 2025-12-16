---
layout: post
title: 'When Does Java’s Foreign Function & Memory API Actually Make Sense?'
original_url: 'https://bazlur.ca/2025/12/14/when-does-javas-foreign-function-memory-api-actually-make-sense/'
date_published: '2025-12-14T00:00:00+00:00'
date_scraped: '2025-12-16T00:44:18.812480691'
featured_image: '/images/gemini-generated-image-rhmn5srhmn5srhmn-scaled.png'
---

![](/images/gemini-generated-image-rhmn5srhmn5srhmn-scaled.png)

When Does Java's Foreign Function \& Memory API Actually Make Sense?
====================================================================

Every new Java release introduces a shiny feature. The Foreign Function \& Memory (FFM) API, finalized in Java 22, is one of those headline acts: it promises safe native calls without JNI and off-heap memory you can manage. But the real question is not "can I use it?" but "should I reach for it?" The answer depends on what you aim to achieve and how much work you delegate to native code.

This post discusses some experiments I did over the weekend. We'll start with a brief FFM primer, then examine two benchmarks (though, ideally, we should try JMH, but for simplicity, we won't do that here) that reveal when FFM performs strongly and when it slows down.

A Quick Primer
--------------

FFM gives you three building blocks:

* Call native functions from Java without writing JNI glue.
* Manage off-heap memory with bounds checks and automatic cleanup.
* Describe native data layouts so C structs look like Java-accessible memory.

Here is an example of working with off-heap memory. Unlike unsafe pointers, FFM provides safety rails. You get automatic deallocation (if desired) and crucial bounds checking, though you still have to manage offsets manually.  

```
import java.lang.foreign.*;

import static java.lang.foreign.ValueLayout.*;

void main() {
  // 1. Allocate off-heap memory for two 64-bit longs (16 bytes total).
  // Using Arena.ofAuto() means the GC handles deallocation implicitly when the segment becomes unreachable.
  MemorySegment segment = Arena.ofAuto().allocate(JAVA_LONG.byteSize() * 2);

  // 2. Manual offset computation is required to access data.
  segment.set(JAVA_LONG, 0, 12345L); // First long at offset 0
  segment.set(JAVA_LONG, 8, 67890L); // Second long at offset 8

  IO.println("Value 1: " + segment.get(JAVA_LONG, 0));

  // 3. FFM enforces bounds safety.
  // The following line throws IndexOutOfBoundsException because offset 16 is outside the 16-byte segment.
  // long whoops = segment.get(JAVA_LONG, 16);
}
```

Arena owns the lifetime; MemorySegment owns the bounds; you avoid raw pointers and manual free.

### How Calls Happen

Behind the scenes, you describe a native signature with FunctionDescriptor, turn it into a MethodHandle, then invoke it. Think of it as a type-safe bridge:

```
SymbolLookup stdlib = Linker.nativeLinker().defaultLookup();
MemorySegment strlen = stdlib.find("strlen").orElseThrow();

FunctionDescriptor desc = FunctionDescriptor.of(JAVA_LONG, ADDRESS);

MethodHandle handle = Linker.nativeLinker().downcallHandle(strlen, desc);

try (Arena arena = Arena.ofConfined()) {
    MemorySegment str = arena.allocateFrom("Hello");
    long length = (long) handle.invokeExact(str);
    IO.println(length); // 5
}
```

What FFM replaces: brittle JNI
------------------------------

JNI demanded a pile of moving parts:

* C headers generated from your Java class (javah, now removed) and a C implementation that must match the mangled names and signatures exactly.
* Manual malloc/free and unchecked pointer arithmetic---one mistake is a JVM crash.
* Build scripts to compile native code per platform, produce .so/.dylib/.dll, ship them, and wrestle with java.library.path.
* No bounds checks, weak type safety, and opaque error messages when signatures drift.

By contrast, FFM keeps everything in Java source, enforces layouts and signatures at compile time, and manages lifetimes through arenas. Hence, you get bounds checks and deterministic cleanup without the need for native builds per platform.

[jextract](https://github.com/openjdk/jextract): skip the boilerplate
---------------------------------------------------------------------

Writing these descriptors by hand gets old fast. jextract reads C headers and spits out Java classes you can call like normal methods.

Example: generating bindings for qsort from stdlib.h:

```
SDK="$(xcrun --sdk macosx --show-sdk-path)"

jextract \
  --output src/generated \
  --target-package org.stdlib \
  -l :/usr/lib/libSystem.B.dylib \
  -I "$SDK/usr/include" \
  "$SDK/usr/include/stdlib.h"
```

That produces src/generated/org/stdlib/stdlib_h.java with a qsort method you can invoke directly, no manual FunctionDescriptor necessary.

```
import static org.stdlib.stdlib_h.*;
import java.lang.foreign.*;
import java.lang.invoke.*;

static int compare(MemorySegment a, MemorySegment b) {
    int x = a.reinterpret(C_INT.byteSize()).get(C_INT, 0);
    int y = b.reinterpret(C_INT.byteSize()).get(C_INT, 0);
    return Integer.compare(x, y);
}

void main() throws Throwable {

    MethodHandle comparator = MethodHandles.lookup().findStatic(
        this.getClass(), "compare",
        MethodType.methodType(int.class, MemorySegment.class, MemorySegment.class)
    );

    try (Arena arena = Arena.ofConfined()) {
        MemorySegment array = arena.allocateFrom(C_INT, 5, 2, 8, 1, 9);

        FunctionDescriptor comparDesc = FunctionDescriptor.of(
            ValueLayout.JAVA_INT, ValueLayout.ADDRESS, ValueLayout.ADDRESS);

        MemorySegment comparFunc = Linker.nativeLinker()
            .upcallStub(comparator, comparDesc, arena);

        qsort(array, 5, C_INT.byteSize(), comparFunc);

        IO.println(Arrays.toString(array.toArray(ValueLayout.JAVA_INT)));
    }
}
```

With the plumbing out of the way, let's see where performance lands.

**NOTE:** If you want to know more about jextract, there are plenty of example codes here: <https://github.com/openjdk/jextract/tree/master/samples>

Benchmark 1: Sorting (FFM loses badly)
--------------------------------------

Experiment: sort 10 million integers with Java's Arrays.sort() vs C's qsort() through FFM (using the generated binding above).

|     **Method**     | **Time**  |
|--------------------|-----------|
| Java Arrays.sort() | 686 ms    |
| Native qsort (FFM) | 16,965 ms |

qsort needs a comparator. Every comparison hops Java → native → Java. At \~10-50 ns per hop, multiplied by hundreds of millions of comparisons, the boundary crossings drown the benefit of native code. Java's in-VM dual-pivot quicksort never leaves the JVM and wins by 25x.

**Takeaway:** FFM plus frequent callbacks is a performance anti-pattern.

### But what if we keep the comparator native?

The slow path was: **Java → qsort → Java comparator → qsort → Java comparator → ... (millions of times)**

We can eliminate the callbacks by writing the comparator in C and keeping the entire sort native:

```
// int_compare.c
#include <stdlib.h>

int int_compare(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}
```

Compile it as a shared library:

```
# macOS
clang -shared -o libintcmp.dylib int_compare.c
```

For Linux:

```
# Linux
gcc -shared -fPIC -o libintcmp.so int_compare.c
```

Now use FFM to get the native function pointer and pass it directly to qsort:

```
void main() throws Throwable {

    // Load our native comparator library
    SymbolLookup myLib = SymbolLookup.libraryLookup("libintcmp.dylib", Arena.global());

    MemorySegment nativeComparator = myLib.find("int_compare").orElseThrow();

    // Load qsort from stdlib

    SymbolLookup stdlib = Linker.nativeLinker().defaultLookup();

    MethodHandle qsort = Linker.nativeLinker().downcallHandle(
        stdlib.find("qsort").orElseThrow(),
        FunctionDescriptor.ofVoid(ADDRESS, JAVA_LONG, JAVA_LONG, ADDRESS)
    );

    try (Arena arena = Arena.ofConfined()) {
        int[] data = generateRandomArray(10_000_000);
        MemorySegment nativeArray = arena.allocateFrom(JAVA_INT, data);

        // Sort entirely in native code - no Java callbacks!
        qsort.invokeExact(nativeArray, (long) data.length, (long) JAVA_INT.byteSize(), nativeComparator);
        int[] sorted = nativeArray.toArray(JAVA_INT);
    }
}
```

The flow becomes: **Java → qsort (uses native comparator, all comparisons stay native) → Java**

**Expected result:** Native qsort with a native comparator would be competitive with Java's Arrays.sort(). The overhead disappears because comparisons never cross the boundary.

**The lesson:** It's not that qsort is slow---it's that *upcalls* are slow. Keep the hot path on one side of the fence.

Benchmark 2: Matrix Multiplication (FFM runs away with it)
----------------------------------------------------------

Experiment: multiply two 1024×1024 matrices---over 2 billion floating-point operations.

|      **Method**       | **Time** | **Speedup** |
|-----------------------|----------|-------------|
| Pure Java (naive)     | 1,978 ms | 1x          |
| EJML (optimized Java) | 353 ms   | 5.6x        |
| Native BLAS via FFM   | 9 ms     | 220x        |

<br />

This time, the native call does all the work in one shot: Java → native (SIMD, cache-aware blocking, multi-threaded) → Java. One crossing, massive payoff.

Apple's Accelerate BLAS on Apple Silicon vectorizes aggressively, tiles for cache, and fans out across performance cores; the JVM does not ship a comparable, hardware-tuned BLAS in the standard library.

The more work you pack into that single trip, billions of floating-point operations, the more the boundary cost dissolves into noise.

**Takeaway:** FFM shines when a single native call does a mountain of work.

### The benchmark code

The benchmark below compares:

* A naive pure-Java triple loop.
* EJML (a pure-Java linear algebra library we depend on via org.ejml:ejml-all).
* Native BLAS (cblas_dgemm from Apple's Accelerate framework) through FFM.

```
package ca.bazlur.ffm;

import org.ejml.dense.row.CommonOps_DDRM;
import org.ejml.data.DMatrixRMaj;
import java.lang.foreign.*;
import java.lang.invoke.MethodHandle;
import java.time.Duration;
import java.time.Instant;
import java.util.Random;
import static java.lang.foreign.ValueLayout.*;

public final class MatrixBenchmark {
    static final int CblasRowMajor = 101;
    static final int CblasNoTrans = 111;
    static final int MATRIX_SIZE = 1024;
    static final int WARMUP_RUNS = 2;
    static final int BENCHMARK_RUNS = 5;
    static final MethodHandle cblas_dgemm;

    static {
        try {
            SymbolLookup accelerate = SymbolLookup.libraryLookup(
              "/System/Library/Frameworks/Accelerate.framework/Versions/A/Accelerate",
                Arena.global()
            );

            FunctionDescriptor descriptor = FunctionDescriptor.ofVoid(
                JAVA_INT, JAVA_INT, JAVA_INT, JAVA_INT, JAVA_INT, JAVA_INT,
                JAVA_DOUBLE, ADDRESS, JAVA_INT, ADDRESS, JAVA_INT,
                JAVA_DOUBLE, ADDRESS, JAVA_INT
            );

            cblas_dgemm = Linker.nativeLinker().downcallHandle(
                accelerate.find("cblas_dgemm").orElseThrow(),
                descriptor
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to load BLAS", e);
        }
    }

    void main() throws Throwable {

        double[] A = generateMatrix(MATRIX_SIZE);
        double[] B = generateMatrix(MATRIX_SIZE);
        DMatrixRMaj ejmlA = new DMatrixRMaj(MATRIX_SIZE, MATRIX_SIZE, true, A);
        DMatrixRMaj ejmlB = new DMatrixRMaj(MATRIX_SIZE, MATRIX_SIZE, true, B);
        warmup(A, B, ejmlA, ejmlB);

        benchmarkJava(A, B);
        benchmarkEJML(ejmlA, ejmlB);
        benchmarkBLAS(A, B);
    }

    // Pure Java

    double[] multiplyJava(double[] A, double[] B, int n) {
        double[] C = new double[n * n];

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                double sum = 0.0;
                for (int k = 0; k < n; k++) {
                    sum += A[i * n + k] * B[k * n + j];
                }

                C[i * n + j] = sum;
            }
        }

        return C;
    }

    // EJML

    DMatrixRMaj multiplyEJML(DMatrixRMaj A, DMatrixRMaj B) {
        DMatrixRMaj C = new DMatrixRMaj(A.numRows, B.numCols);
        CommonOps_DDRM.mult(A, B, C);
        return C;
    }

    // Native BLAS via FFM

    double[] multiplyBLAS(double[] A, double[] B, int n) throws Throwable {
        try (Arena arena = Arena.ofConfined()) {
            MemorySegment nativeA = arena.allocateFrom(JAVA_DOUBLE, A);
            MemorySegment nativeB = arena.allocateFrom(JAVA_DOUBLE, B);
            MemorySegment nativeC = arena.allocate(JAVA_DOUBLE, n * n);

            cblas_dgemm.invokeExact(
                CblasRowMajor, CblasNoTrans, CblasNoTrans,
                n, n, n, 1.0,
                nativeA, n,
                nativeB, n,
                0.0,
                nativeC, n
            );

            return nativeC.toArray(JAVA_DOUBLE);
        }
    }

    // Helper methods (warmup, benchmarking harness, checksum, etc.) are in the source.

}
```

Notes on the setup:

* **EJML** (ejml-all): provides a tuned pure-Java baseline that closes much of the gap without leaving the JVM.
* **Apple Accelerate BLAS** : we load cblas_dgemm directly from the system framework on macOS; on other platforms, point the lookup to your BLAS library (e.g., OpenBLAS, Intel MKL).
  * Linux hint: install OpenBLAS (libopenblas-dev on Debian/Ubuntu) and lookup cblas_dgemm from /usr/lib/x86_64-linux-gnu/libopenblas.so (path may vary by distro).
  * Windows hint: use a prebuilt OpenBLAS/MKL DLL, ensure it is on PATH, and lookup cblas_dgemm by passing the DLL name (e.g., "libopenblas.dll" or "mkl_rt.dll") to libraryLookup.

When to reach for FFM
---------------------

* You need existing native libraries: OpenSSL/libsodium (crypto), zlib/lz4/zstd (compression), libpng/libjpeg/ImageMagick (images), TensorFlow/ONNX Runtime (ML), BLAS/LAPACK/MKL (linear algebra), SQLite/RocksDB (storage).
* One call does massive work: matrix math, bulk encryption/decryption, image encode/decode, and compression of big buffers.
* Off-heap memory matters: large caches to spare the GC, memory-mapped files, shared memory, low-latency systems.
* System-level hooks: hardware access, OS features absent in Java, and integrating with C/C++ systems.

When to stay in pure Java
-------------------------

* Anything with frequent callbacks into Java: custom comparators, filters, event-driven native APIs.
* Domains where the JVM already excels: strings, collections, JSON/XML parsing, general-purpose computation.
* Tiny, chatty operations: lots of small allocations or single-value lookups.
* A solid Java library already exists: EJML/ojAlgo for most linear algebra needs, Bouncy Castle for most crypto.

A simple decision sketch
------------------------

```
Need a native library?  
├── No → Stay in Java.
  └── Yes → Will one call do bulk work or manage big off-heap data?
        ├── Yes → Use FFM.
        └── No  → Reconsider; overhead may hurt more than it helps.
```

Wrapping up
-----------

FFM is not a magic speed pill. It is a bridge:

1. **Access** to native libraries that Java does not offer.
2. **Bulk work** in a single call to amortize boundary cost.
3. **Memory control** when the GC would otherwise interfere.

**The rule of thumb is simple:** minimize boundary crossings, maximize work per crossing. If you can keep the heavy lifting on one side of the bridge, FFM earns its keep; if the work ping-pongs back and forth, pure Java likely wins on both speed and simplicity.  

*** ** * ** ***

Type your email... {#subscribe-email}
