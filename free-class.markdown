---
layout: lander
permalink: /free
title: Olive Branch Taekwondo
subtitle: Schedule a free class
---

<section class="page-section" id="free">
	<div class="container">
		<div class="row">
			<div class="col-md-10 offset-md-1 text-center">
				<h2 class="section-heading text-uppercase">Sign up &amp; Schedule Today!</h2>
				<ul class="free-steps"> 
					<li class="active">
						<span class="step-count">1</span>
						<svg width="25" height="21" fill="none" xmlns="http://www.w3.org/2000/svg">
						  <path d="M8.8 10.5a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm3.4 1.3c1.6 0 3 .7 4 1.7L12.7 17v.4l-.3 2.4v.8H2c-1 0-1.9-.8-1.9-1.9V17c0-2.9 2.3-5.3 5.2-5.3H6c.9.5 1.8.7 2.8.7 1 0 2-.2 2.9-.7h.6Zm1.8 5.7 5.4-5.4 2.8 2.8-5.4 5.4-2.4.2c-.4 0-.7-.3-.7-.7l.3-2.3ZM24.7 11c.4.4.4 1 0 1.3L23.1 14l-2.8-2.8 1.6-1.7a1 1 0 0 1 1.3 0l1.5 1.5Z" fill="#222"/>
						</svg>
						<span class="step-label">Sign up</span>
					</li>
					<li>
						<span class="step-count">2</span>
						<svg width="18" height="21" fill="none" xmlns="http://www.w3.org/2000/svg">
						  <path d="M0 18.6V8h17.5v10.6c0 1-.9 1.9-1.9 1.9H2c-1 0-1.9-.8-1.9-1.9Zm2.5-7.5V15c0 .3.3.6.6.6H7c.3 0 .6-.3.6-.6V11c0-.3-.3-.6-.6-.6H3c-.3 0-.6.3-.6.6ZM15.6 3c1 0 1.9.9 1.9 1.9v1.8H0V5C0 3.9.8 3 1.9 3h1.9V1.1c0-.3.2-.6.6-.6h1.2c.3 0 .7.3.7.6V3h5V1.1c0-.3.2-.6.6-.6H13c.3 0 .7.3.7.6V3h1.8Z" fill="#222"/>
						</svg>
						<span class="step-label">Schedule class</span>
					</li>
				</ul>
			</div>
		</div>
		<div class="row">
			<div class="col-md-10 offset-md-1">
				<div id="free-class-form">
					<form name="contact" method="POST" netlify netlify-honeypot="bot-field" id="free-form">
					  <fieldset>
					    <legend>Age Group (Select all that apply):</legend> 
					    <div class="checkbox-group">
						    <label class="checkbox-box" for="age-4-6">
						      <input type="checkbox" id="age-4-6" name="age-group" value="4-6 year olds">
						      <label for="age-4-6">4-6 year olds</label>
						    </label>
						    <label class="checkbox-box" for="age-7-12">
						      <input type="checkbox" id="age-7-12" name="age-group" value="7-12 year olds">
						      <label for="age-7-12">7-12 year olds</label>
						    </label>
						    <label class="checkbox-box" for="age-13+">
						      <input type="checkbox" id="age-13+" name="age-group" value="13+ years old">
						      <label for="age-13+">13+ years old</label>
						    </label>
						  </div>
					  </fieldset>
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
					    <button type="submit">Submit & Schedule Class &nbsp; →</button>
					  </p>
					</form>
					<p class="form-desc">After submitting the form, you’ll be able to schedule your First Free Class at a time that works for you.</p>
				</div>
				<div id="free-thanks" style="display: none;">
					<h2 class="text-center mt-3">🥋&nbsp;Yay!&nbsp;👊<br>Let's schedule your 1st Taekwondo Class:</h2>
				</div>
			</div>
		</div>
	</div>
</section>

<script>
  document.getElementById("free-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Simulate a successful Netlify form submission
    fetch("/", {
      method: "POST",
      body: new FormData(this),
    })
    .then(() => {
      // Remove "active" class from first LI
      document.querySelector(".free-steps li.active").classList.remove("active");

      // Add "active" class to second LI
      document.querySelector(".free-steps li:nth-child(2)").classList.add("active");

      // Hide the form
      document.getElementById("free-class-form").style.display = "none";
 
      // Show the thank you message
      document.getElementById("free-thanks").style.display = "block";
    })
    .catch((error) => console.error("Error:", error));
  });
</script>

{% include programs.html %}