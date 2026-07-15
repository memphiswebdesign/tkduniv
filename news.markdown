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
				<div class="news-card">
					<a class="news-card-image" href="{{ post.url }}" aria-label="{{ post.title | escape }}">
						<img src="{{ post.image }}" alt="{{ post.title | escape }}" />
					</a>
					<div class="news-card-body">
						<span class="news-card-date">{{ post.date | date: "%B %-d, %Y" }}</span>
						<h3 class="news-card-title">{{ post.title | escape }}</h3>
						<p class="news-card-excerpt">{{ post.description }}</p>
						<a class="news-card-cta" href="{{ post.url }}">Read more &#8594;</a>
					</div>
				</div>
			</div>
			{% endfor %}
		</div>
	</div>
</section>
