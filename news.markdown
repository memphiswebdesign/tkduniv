---
layout: page
permalink: /news
title: News
subtitle: Tips, updates, and announcements
description: News, articles, and announcements from Taekwondo University in Olive Branch, MS.
---

<section class="page-section pt-5 pb-5" id="news-grid">
	<div class="container">
		<div class="row">
			{% for post in site.posts %}
			<div class="col-12 col-sm-6 col-md-4 col-xl-3">
				<a class="news-card" href="{{ post.url }}" aria-label="{{ post.title | escape }}">
					<span class="news-card-image">
						<img src="{{ post.image }}" alt="{{ post.title | escape }}" />
					</span>
					<span class="news-card-body">
						<span class="news-card-date">{{ post.date | date: "%B %-d, %Y" }}</span>
						<h3 class="news-card-title">{{ post.title | escape }}</h3>
						<span class="news-card-excerpt">{{ post.description | truncatewords: 15 }}</span>
						<span class="news-card-cta">Read more &#8594;</span>
					</span>
				</a>
			</div>
			{% endfor %}
		</div>
	</div>
</section>
