---
layout: lander
permalink: /free
title: Olive Branch Taekwondo University
subtitle: Schedule a free class
---

<section class="page-section" id="free">
	<div class="container">
		<div class="row">
			<div class="col-md-10 offset-md-1 text-center">
				<h2 class="section-heading text-uppercase">Sign up, Suit Up - Train for Free!</h2>
				<!-- <ul class="free-steps"> 
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
				</ul> -->
			</div>
		</div>
		<div class="row">
			<div class="col-md-10 offset-md-1">
				<div id="free-class-form">
					<form name="contact" method="POST" netlify netlify-honeypot="bot-field" id="free-form">
					  <fieldset>
					    <label>Age Group (Select all that apply):</label> 
					    <!-- <input type="hidden" name="age-group" value="Age Group:"> -->
					    <div class="checkbox-group"> 
						    <label class="checkbox-box" for="age-4-6"> 
						      <input type="checkbox" id="age4-6" name="age-group" >
						      <label for="age4-6">4-6 year olds</label>
						    </label>
						    <label class="checkbox-box" for="age-7-12"> 
						      <input type="checkbox" id="age7-12" name="age-group" >
						      <label for="age7-12">7-12 year olds</label>
						    </label>
						    <label class="checkbox-box" for="age-13+">
						      <input type="checkbox" id="age13+" name="age-group" >
						      <label for="age13+">13+ years old</label>
						    </label>
						  </div>
					  </fieldset>
					  <div id="div1" class="optional-div text-center">
					  	<label style="margin: 0;">Little Warrior (4-6 years old)</label>
					  	<p>Select an upcoming date & time:</p>
					  	<!-- <input type="hidden" name="date-time" value="Date & time:"> -->
					  	<div class="radio-group">
						    <div class="radio-box">
						    	<label for="lw-mon-415" value="Appt: Date/Time" >
						        <input type="radio" id="lw-mon-415" name="lw-age-group">
						        <label for="lw-mon-415">Monday @ 4:15p.m.</label>
						      </label>
						    </div>
						    <div class="radio-box">
						    	<label value="Appt: Date/Time" >
						        <input type="radio" id="lw-tues-415" name="lw-age-group">
						        <label for="lw-tues-415" >Tuesday @ 4:15p.m.</label>
						      </label>
						    </div>
						    <div class="radio-box">
						    	<label for="lw-thurs-415" value="Appt: Date/Time" >
						        <input type="radio" id="lw-thurs-415" name="lw-age-group">
						        <label for="lw-thurs-415">Thursday @ 4:15p.m.</label>
						      </label>
						    </div>
							</div>
					  </div>
						<div id="div2" class="optional-div text-center">
							<label style="margin: 0;">Team Positive (7-12 years old)</label>
					  	<p>Select an upcoming date & time:</p>
					  	<!-- <input type="hidden" name="date-time" value="Date & time:"> -->
					  	<div class="radio-group">
						    <div class="radio-box">
						    	<label value="Appt: Date/Time">
						        <input type="radio" id="tp-mon-415" name="tp-age-group">
						        <label for="tp-mon-415">Monday @ 4:45p.m.</label>
						      </label>
						    </div>
						    <div class="radio-box">
						    	<label value="Appt: Date/Time">
						        <input type="radio" id="tp-tues-415" name="tp-age-group">
						        <label for="tp-tues-415">Tuesday @ 5:30p.m.</label>
						      </label>
						    </div>
						    <div class="radio-box">
						    	<label value="Appt: Date/Time">
						        <input type="radio" id="tp-thurs-415" name="tp-age-group">
						        <label for="tp-thurs-415">Thursday @ 4:45p.m.</label>
						      </label>
						    </div>
							</div>
						</div>
						<div id="div3" class="optional-div text-center">
							<label style="margin: 0;">Teen / Adult (13+ years old)</label>
					  	<p>Select an upcoming date & time:</p>
					  	<!-- <input type="hidden" name="date-time" value="Date & time:"> -->
					  	<div class="radio-group">
						    <div class="radio-box">
						    	<label value="Appt: Date/Time">
						        <input type="radio" id="ta-mon-415" name="ta-age-group">
						        <label for="ta-mon-415">Tuesday @ 6:15p.m.</label>
						      </label>
						    </div>
						    <div class="radio-box">
						    	<label value="Appt: Date/Time">
						        <input type="radio" id="ta-tues-415" name="ta-age-group">
						        <label for="ta-tues-415">Thursday @ 6:15p.m.</label>
						      </label>
						    </div>
							</div>
						</div>
						<style>.optional-div {display:none;}</style>
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
					    <button type="submit">Book Your Free Class Today &nbsp; →</button>
					  </p>
					</form>
					<!-- <p class="form-desc">After submitting the form, you’ll be able to schedule your First Free Class at a time that works for you.</p> -->
				</div>
				<div id="free-thanks" style="display: none;">
					<h2 class="top-brow yellow mt-3">✅ Thanks for requesting your 1st class.</h2>
					<p><strong>A Taekwondo University team member will reach out very soon to confirm your appointment and walk you through all the amazing stuff you'll experience on your first taekwondo class.</strong></p>
				</div>
			</div>
		</div>
		<!-- Below form free class included block -->
		<div class="row" id="free-includes">
			<div class="col-md-10 offset-md-1">
				<div class="free-includes-content">
					<h3 class="mb-3 text-center">What to expect with your first Taekwondo class?</h3>
					<h5 class="mb-2 text-center">No strings attached &mdash; Just a lot of fun.</h5>
					<div class="row" style="margin: 0;">
						<div class="col-md-6 pb-5 pb-sm-4 pr-lg-5">
							<p class="top-brow yellow"><strong>So, what's include?</strong></p>
							<ul class="pl-3">
								<li>Informative tour of our facility</li>
								<li>Complete an orientation to find out how our program can benefit you</li>
								<li>Taekwondo uniform & belt provided</li>
								<li>Free action-packed intro class</li>
								<li>Train with others your age & skill level</li>
							</ul>
							<p class="" style="font-size: 14px;">Wear comfortable athletic wear and we will provide a uniform to wear in your first class.</p>
							<p class="mt-4 mb-2"><strong>Got Questions?</strong></p>
							<a class="d-inline-flex align-items-center btn btn-primary btn-md btn-light text-uppercase w-icon" href="tel:9017491800">
            	<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 15.4c-1.2 0-2.4-.2-3.5-.6a1 1 0 0 0-1 .3l-1.6 2a15.2 15.2 0 0 1-6.9-7l2-1.7c.2-.2.3-.6.2-1-.4-1-.6-2.3-.6-3.5 0-.5-.4-1-1-1H4.3C3.6 3 3 3.2 3 4c0 9.3 7.7 17 17 17 .7 0 1-.6 1-1.2v-3.4c0-.6-.5-1-1-1z"></path></svg>901.794.1800</a>
						</div>
						<div class="col-md-6">
							<p class="top-brow yellow"><strong>Location:</strong></p>
							<div class="embed-container" style="border:1px solid #aaa;"><iframe class="lazyload" data-src='https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13080.254270641717!2d-89.830971!3d34.9550154!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x69f85f9c57f5d468!2sTaekwondo%20University!5e0!3m2!1sen!2sus!4v1673368861443!5m2!1sen!2sus' width='600' height='450' style='border:0;' allowfullscreen='' loading='lazy' referrerpolicy='no-referrer-when-downgrade'></iframe></div>
						</div>
					</div>
				</div>
			</div> 
		</div>
	</div>
</section>

<script src="https://player.vimeo.com/api/player.js"></script>
<script>
	document.addEventListener("DOMContentLoaded", () => {

			// hero vid load class
	    const iframe = document.querySelector("#landing-video iframe");
	    const landingHero = document.querySelector("#landing-hero");

	    if (iframe) {
	        const player = new Vimeo.Player(iframe);

	        // Listen for when the video starts playing
	        player.on("play", () => {
	            landingHero.classList.add("vid-load");
	        });
	    }

	    // class cat toggle
	    const checkboxes = document.querySelectorAll("input[name='age-group']");
	    const divMap = {
	        "age4-6": "div1",
	        "age7-12": "div2",
	        "age13+": "div3"
	    };

	    checkboxes.forEach(checkbox => {
	        checkbox.addEventListener("change", () => {
	            Object.entries(divMap).forEach(([checkboxId, divId]) => {
	                document.getElementById(divId).style.display = 
	                    document.getElementById(checkboxId).checked ? "block" : "none";
	            });
	        });
	    });

	    // Radio de-select option
	    // const radioButtons = document.querySelectorAll("input[type='radio']");
	    // radioButtons.forEach(radio => {
	    //     radio.addEventListener("click", function () {
	    //         if (this.checked) {
	    //             this.dataset.wasChecked = this.dataset.wasChecked === "true" ? "false" : "true";

	    //             if (this.dataset.wasChecked === "false") {
	    //                 this.checked = false;
	    //             }
	    //         }
	    //     });
	    // });

	});

  document.getElementById("free-form").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Simulate a successful Netlify form submission
    fetch("/", {
      method: "POST",
      body: new FormData(this),
    })
    .then(() => {
      // Remove "active" class from first LI
      // document.querySelector(".free-steps li.active").classList.remove("active");
      // Add "active" class to second LI
      // document.querySelector(".free-steps li:nth-child(2)").classList.add("active");
      // Hide the form
      document.getElementById("free-class-form").style.display = "none";
      // Show the thank you message
      document.getElementById("free-thanks").style.display = "block";
    })
    .catch((error) => console.error("Error:", error));
  });

</script>

{% include programs.html %}