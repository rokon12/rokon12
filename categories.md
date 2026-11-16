---
layout: default
title: Categories
---
<div class="listing-page">
    <header class="page-head">
        <h1>Categories</h1>
        <p>Explore the archive by topic.</p>
        <nav class="page-links" aria-label="Browse articles"><a href="{{ '/archive/' | relative_url }}">All articles</a><a href="{{ '/search/' | relative_url }}">Search</a></nav>
    </header>
    {% include topic-list.html %}
</div>
