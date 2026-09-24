---
layout: "post"
title: "One Database, Two Models: Building AI-Friendly Java Applications with MySQL JSON Duality Views"
title_emphasis: "Building AI-Friendly Java Applications with MySQL JSON Duality Views"
date: "2026-09-23"
last_modified_at: "2026-09-24"
categories: ["AI & LLMs"]
tags: ["java", "mysql", "json duality views", "ai", "langchain4j", "spring boot"]
description: "A hands-on look at MySQL JSON Duality Views: reading relational data as JSON in Java, writing documents back safely, and giving a local AI assistant read-only tools."
excerpt: "A hands-on look at MySQL JSON Duality Views: reading relational data as JSON in Java, writing documents back safely, and giving a local AI assistant read-only tools."
featured_image: "/images/mysql-json-duality-views-java-ai.jpeg"
image: "/images/mysql-json-duality-views-java-ai.jpeg"
seo_title: "MySQL JSON Duality Views in Java: Reads, Writes and AI"
---

<figure>
  <img src="/images/mysql-json-duality-views-java-ai.jpeg" alt="Relational database tables combine into a JSON document for an AI assistant." width="2752" height="1536" fetchpriority="high" decoding="async">
</figure>

MySQL JSON Duality Views can turn related rows into a JSON document and write changes back to the underlying tables. I built a Java application to try that with an order, its customer, and its line items, then gave a local AI assistant read-only tools over the same data.

The reads were straightforward. The writes needed more care. Leaving an item out of the document deleted that order line. Leaving out the etag allowed a stale update to overwrite a newer cancellation. My API had to require both the complete document and the etag.

I also compared plain JDBC, JPA, and Spring Data JDBC, inspected the query plans, and tested what happened when the model misread an order's status. Clean JSON simplified the data access, but business rules and customer access checks still belonged in Java.

[Read the full article on Foojay: One Database, Two Models](https://foojay.io/today/one-database-two-models-mysql-json-duality-views-java/).

I used an AI assistant to help build the example, run the tests and edit this article. The code, results and traces are all in the [companion repository](https://github.com/rokon12/order-duality).
{: .note}
