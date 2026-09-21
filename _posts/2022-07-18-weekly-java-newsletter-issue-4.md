---
layout: post
title: 'Weekly Java Newsletter – Issue #4'
original_url: 'https://bazlur.ca/2022/07/18/weekly-java-newsletter-issue-4/'
date_published: '2022-07-18T13:42:49Z'
date_scraped: '2026-09-21T21:43:05.128328448'
featured_image: '/images/java-newsletters-1.png'
tags: [concurrency, java, newsletter, project loom, structured concurrency, virtual thread]
---

Weekly Java Newsletter -- Issue #4
==================================

![](images/java-newsletters-1.png)  
Hi there,

I hope you had a wonderful weekend. This week was quite hectic, as usual. I gave a presentation on Project Loom to the [Garden State Java User Group](https://gsjug.org/meetings/2022/jul2022.html) last week, and a similar talk is forthcoming for [PhillyJUG](https://www.meetup.com/PhillyJUG/events/285970065/). That's why this week, I concentrated on currency-related articles.

Have fun reading them.

1. [Concurrency](https://web.mit.edu/6.005/www/fa14/classes/17-concurrency/#:~:text=Concurrency%20means%20multiple%20computations%20are,cores%20on%20a%20single%20chip): Concurrency is an integral component of modern programming. Therefore, if we wish to be well-rounded engineers, an understanding of concurrency is crucial. Certainly, we wish to delve deeply into it, but if you are a beginner, you should take baby steps. This article provides a fundamental yet essential introduction to Java concurrency.
2. [Java Thread Programming (Part 1) \| Foojay.io Today](https://foojay.io/today/java-thread-programming-part-1/): Well, this is comparable to the above beginner threading series that I started on Fooja.io. If you are interested, please have a look and provide feedback while I continue to work on it.
3. [Concurrency in modern programming languages: Java \| Technorage](https://foojay.io/today/concurrency-in-java-and-how-it-compares-with-other-modern-programming-languages/) : This article is a part of a series where the author tries to compare the concurrency model with other programming models through benchmarking. A good read.
4. [Avoid multithreading bugs by using immutable Java](https://foojay.io/today/immutable-records/)records: Java concurrency works on top of the shared-memory model. Although this simplifies programming, it has side effects. It creates data races, race conditions, etc. One of the ways to deal with such a problem is to use an immutable data structure. This article explains how Java Records can help with immutability. By the way, Java Records are an essential and relatively recent addition to the Java programming language.
5. [Jakarta Concurrency: Present and Future](https://foojay.io/today/jakarta-concurrency-present-and-future-2/): Jakarta EE is one of the areas of my interest. In this article, the author discusses the Concurrency Specification, it's present and future under the umbrella of Jakarta EE. Give a read if that interests you.
6. [5 Things You Probably Didn't Know About Java Concurrency](https://bazlur.ca/2022/03/25/5-things-you-probably-didnt-know-about-java-concurrency/): If you are just beginning to learn about concurrency, or if you are a beginner or intermediate Java developer, you may find this article intriguing, as some of the concepts I present in it may be unfamiliar to you. Please let me know if this is the case.
7. [JEP 425: Using Java Virtual Threads to Deliver Improved Throughput](https://www.infoq.com/news/2022/05/virtual-threads-for-jdk19/?itm_source=infoq&itm_campaign=user_page&itm_medium=link): The virtual thread is, in fact, the next big thing in Java concurrency. It intends to revolutionize how we write concurrency code in the future. This aims to drastically reduce the effort required to write, manage, and observe high-throughput concurrent Java applications. I'm rather certain you already know about this, but in case you don't, perhaps you should read on.
8. [JEP 428: Structured Concurrency to Simplify Java Multithreaded Programming](https://www.infoq.com/news/2022/06/java-structured-concurrency/#:~:text=The%20benefits%20structured%20concurrency%20brings,and%20fetchOrder()%20%2C%20are%20children): This is the second-best thing, in my opinion, on the Java platform to come. This aims to simplify multithreaded programming by introducing a library to treat multiple tasks running on different threads as an atomic operation. As a result, it will streamline error handling and cancellation, improve reliability, and enhance observability.
9. [Launching 10 million virtual threads with loom -- Jep café #12 -- Inside.java](https://inside.java/2022/07/07/jepcafe12/): Who doesn't love demo? I certainly do. This brief YouTube video provides a live demonstration of the Java virtual threads included in JDK 19, and a peek at Project Loom. Have a look at it. I hope you'll enjoy it.
10. Project [Loom and Thread Fairness](https://www.morling.dev/blog/loom-and-thread-fairness/?utm_content=210495390&utm_medium=social&utm_source=twitter&hss_channel=tw-2599580401): There is a lot of excitement about Project Loom. Having virtual threads, we will now be able to write blocking code confidently, aiming for higher throughput easily. However, although virtual threads are champions at blocking code, they are a terrible idea when we execute CPU-intensive work on them. This article discusses this issue, and I find it worth reading if you are interested in virtual threads.

**Bonus**:

[Why should you read Staff Engineer: leadership beyond the management track](https://www.linkedin.com/pulse/why-should-you-read-staff-engineer-leadership-beyond-track-santana/): There is a track you could consider called the StuffPlus engineering path if you are a senior software engineer who is not yet prepared to enter management. I'm personally exploring this option.

That's all for today!

Did you find the content valuable? Feel free to contribute by reaching out to me if you want to add or share your thoughts at @[bazlur_rahman](https://twitter.com/bazlur_rahman?utm_campaign=Weekly%20Java%20Newsletter&utm_medium=email&utm_source=Revue%20newsletter)
