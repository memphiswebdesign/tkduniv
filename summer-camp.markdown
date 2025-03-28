---
layout: page
permalink: /summer-camp
title: Open Enrollment Now!
subtitle: Summer Sports Camp - Olive Branch
youlink: aOIBVR4DG5k
---

<section class="page-section" id="summer-camp">
	<div class="container">
		<div class="row">
			<div class="col-lg-12 text-center">
				<h2 class="section-heading text-uppercase">Starting 1st week of June.<br>June 2nd - July 25th</h2>
				<p class="pt-0 pb-4">Unique & Exclusive with a Max of 40 students.</p>
			</div>
		</div>
		<div class="row pb-3">
			<div class="col-md-5 py-4 px-4 mb-3" style="background: rgb(249 200 25 / 15%); border: 2px solid #F9C819; border-radius: 10px;">
				<h4>Fun Theme Each Week:</h4>
				<h6 class="pt-2 pb-3">8am - 5:30pm. Monday - Friday</h6>
				<ol>
					<li><strong>June 2-6:</strong> Kung Fu Panda</li>
					<li><strong>June 9-13:</strong> Karate Kid</li>
					<li><strong>June 16-20:</strong> Teenage Mutant Ninja Turtles</li>
					<li><strong>June 23-27:</strong> 3 Ninjas</li>
					<li><strong>June 30 - July 3rd:</strong> Kung Fu Panda</li>
					<li><strong>July 7-11:</strong> Karate kid</li>
					<li><strong>July 14-18:</strong> Teenage Mutant Ninja Turtles</li>
					<li><strong>July 21-25th:</strong> 3 Ninjas</li>
				</ol>
				<p class="mb-0"><strong>$179 per week.</strong></p>
				<p class="pt-0">If registered by April 30th receive a free uniform. ($65 value)</p>
			</div>
			<div id="summerCamp" class="col-md-6 offset-md-1 py-4 px-4 mb-3" style="border: 2px solid #ddd; box-shadow: 0 5px 15px -5px rgba(32,32,32,.1); border-radius: 10px;">
				<div id="summer-camp-wrap">
					<h4>Reach Out Today!</h4>
					<form name="contact" method="POST" netlify netlify-honeypot="bot-field" id="summer-camp-form">
					  <p>
					    <label for="name">First & Last Name:</label>
					    <input type="text" id="name" name="name" placeholder="Enter your full name" required />
					  </p>
					  <p>
					    <label for="email">Email Address:</label>
					    <input type="email" id="email" name="email" placeholder="you@mail.com" required />
					  </p>
					  <p>
					    <label for="phone">Phone Number:</label>
					    <input type="tel" id="phone" name="phone" placeholder="(901) 123-4678" required />
					  </p>
					  <p>
					    <button type="submit">Enquire Now &nbsp; →</button>
					  </p>
					</form>
					<!-- <p class="form-desc">After submitting the form, you’ll be able to schedule your First Free Class at a time that works for you.</p> -->
				</div>
				<div id="summer-camp-thanks" style="display: none;">
					<h2 id="hi">Hi, <span id="hi-name"></span> <span class="emoji-wave">👋</span></h2>
					<hr>
					<div class="row" style="margin: 0;">
						<h4 class="mt-3">✅ Thanks for your interest in Summer Camp!</h4>
						<p><strong>A Taekwondo University team member will reach out very soon to book your appointment and walk you through all the amazing stuff you'll experience during Summer Camp.</strong></p>
						<img style="width: 100%; height: auto;" class="lazyload" alt="Summer Camp Photo" data-src="/assets/img/banner/summer-camp.png" />
					</div>
				</div>
			</div>
		</div>
		<hr>
		<div class="row">
			<div class="col-md-10 offset-md-1 pt-4">
				<p><strong>The Taekwondo University Summer Camp program is a fun and exciting way for children to stay active and engaged during the summer months. The program is designed to provide a full day of activities, including traditional summer camp activities such as arts and crafts, outdoor games and sports, and more, as well as daily Taekwondo training.</strong></p>
				<p>Students in the Summer Camp program have the opportunity to learn the fundamental techniques of Taekwondo under the guidance of experienced instructors, as well as participate in physical conditioning activities to build strength and coordination. The camp also includes field trips and special guest instructors, providing a diverse and well-rounded experience for campers.</p>
				<p>In addition to the physical benefits of Taekwondo training, the Summer Camp program also focuses on character development and leadership skills, helping children grow and learn valuable life skills. The program is open to children <strong>grades K5-5th grade</strong> &mdash; and is a great way for children to stay active and have fun during the summer months.</p>
			</div>
		</div>
	</div>
</section>

{% include programs.html %}


<script>

  document.getElementById("summer-camp-form").addEventListener("submit", function(event) {
	    event.preventDefault(); // Prevent the default form submission

	    const formData = new FormData(this);
	    const userName = formData.get("name"); // Get the value of the "name" input

	    // Update #hi-name with the captured name
	    if (userName) {
	        document.getElementById("hi-name").textContent = userName;
	    }

	    // Simulate a successful Netlify form submission
	    fetch("/", {
	        method: "POST",
	        body: formData,
	    })
	    .then(() => {
	        // Hide the form
	        document.getElementById("summer-camp-wrap").style.display = "none";
	        // Show the thank you message
	        document.getElementById("summer-camp-thanks").style.display = "block";

	        // Scroll to #free with an 80px offset
	        scrollToAnchor("summerCamp", 80);
	    })
	    .catch((error) => console.error("Error:", error));
	});

	// Smooth scroll function with offset
	function scrollToAnchor(anchorId, offset) {
	    const pageFree = document.getElementById(anchorId);
	    if (pageFree) {
	        const targetPosition = pageFree.getBoundingClientRect().top + window.scrollY - offset;
	        window.scrollTo({
	            top: targetPosition,
	            behavior: "smooth"
	        });
	    }
	}

</script>