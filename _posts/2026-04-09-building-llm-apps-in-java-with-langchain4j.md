---
layout: post
title: 'Building LLM Apps in Java with LangChain4j'
original_url: 'https://bazlur.ca/2026/04/09/building-llm-apps-in-java-with-langchain4j/'
date_published: '2026-04-09T00:00:00+00:00'
date_scraped: '2026-04-10T01:08:23.311229146'
featured_image: '/images/americas-bazlur-rahman-1-scaled.jpg'
---

![](/images/americas-bazlur-rahman-1-scaled.jpg)

Building LLM Apps in Java with LangChain4j
==========================================

Yesterday I gave a talk titled **"[Building LLM Apps in Java with LangChain4j](https://www.youtube.com/watch?v=cJ1odDNflEA&t=9775s)."** The core idea was simple: building LLM applications is not mainly about writing clever prompts. It is about applying the same engineering discipline we already use in Java systems.

The talk followed the staged evolution of a Spring Boot store assistant. It started with the version many teams build first: a fluent chatbot that sounds convincing but gets important facts wrong. Ask it about an order, a return policy, or shipping rules, and it may confidently invent answers. That is the first lesson of LLM systems: **fluency is not accuracy.**

From Guessing to Grounding
--------------------------

The first real fix is grounding. I showed how Retrieval-Augmented Generation (RAG) moves the assistant from guessing to answering from real business documents. Policies are indexed, relevant chunks are retrieved at request time, and that evidence is injected into the prompt.

Once you see retrieval as a search problem instead of a prompt problem, the architecture becomes much easier to reason about. The model is no longer expected to "know" the business. Instead, the system is responsible for bringing the right evidence into context.

Why Retrieval Quality Matters
-----------------------------

From there, the talk moved into retrieval quality. Dense vector search is useful for semantic similarity, but it is weak on exact identifiers like SKUs and product codes. That is why hybrid retrieval matters. Combining embeddings with lexical search gives better results in real systems, especially when you add metadata filters like region or tenant.

One of the most important ideas in the presentation was this:
> If retrieval is wrong, the LLM never had a chance.

That is also why evaluation matters. In the demo project, retrieval is measured with a golden dataset and an offline evaluation runner. Instead of asking whether the final answer sounds good, we ask whether the retriever brought back the right evidence. This creates a much cleaner and more reliable quality gate, and it fits naturally into CI.

Tools Make the Assistant Useful
-------------------------------

Documents can answer policy questions, but they cannot provide live order status, pricing, or inventory. For that, the assistant needs tools connected to real systems of record. LangChain4j makes this natural in Java: the model selects a tool, but Java code still owns execution, validation, and business logic.

That is the point where an assistant starts becoming operationally useful instead of just informative. It stops guessing and starts asking the actual application for live data.

Observability and Guardrails Are Not Optional
---------------------------------------------

Once retrieval and tools are in the loop, observability becomes mandatory. Token usage, latency, retrieval performance, tool calls, logs, metrics, and traces all need to be visible. An LLM application should be treated like any other production service. If it is slow, costly, or wrong, you need to know whether the problem came from retrieval, the model, or a downstream system.

The final part of the talk focused on guardrails and reliability. Prompt injection checks, write-intent gating, output validation, fallback models, and safe refusal paths are not optional extras. They are what make failure predictable and bounded. The goal is not perfection. The goal is to make the system safer, more explainable, and easier to operate.

The Main Takeaway
-----------------

My closing argument was the same one I wanted the audience to remember from the start: **your Java skills are your AI skills.** Dependency injection, layered design, testing, observability, validation, and resilience patterns still matter. The model is just one dependency. The real work is everything around it.

![](/images/screenshot-2026-04-09-at-4.07.38-pm.png)

If there is one takeaway from the talk, it is this: the hard part of LLM applications is not calling the model. The hard part is grounding it in the right data, measuring retrieval quality, connecting it safely to real systems, observing its behavior, and constraining how it fails.

Source code: <https://github.com/rokon12/jdconf2026>  

Slides: <https://speakerdeck.com/bazlur_rahman/building-llm-apps-in-java-with-langchain4j>  

*** ** * ** ***

