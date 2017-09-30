//setting focus in title input, retrieve local storage
$(document).ready(function() {
	$('.title-input').focus();
	getStoredCards();
});

//constructor function and prototypes
var IdeaCard = function(title, idea, id = Date.now(), quality = 0) {
	this.title = title;
	this.idea = idea;
	this.id = id; 
	this.quality = quality;
};

//connects the quailty index to the string in that index
IdeaCard.prototype.qualityString = function() {
	var qualityArray = ['swill', 'plausible', 'genius'];
	return qualityArray[this.quality]; //this = IdeaCard
};

//checks for matches in title, body and quality in the search input
IdeaCard.prototype.doYouMatch = function(searchTerm) {
	if (this.title.toUpperCase().includes(searchTerm) 
		|| this.idea.toUpperCase().includes(searchTerm) 
		|| this.qualityString().toUpperCase().includes(searchTerm)) {
		return true;
	} else {
		return false;
	}
};

//event listeners
$('.save-button').on('click', function(e) {
	e.preventDefault();
	formSubmit();
});

$('section').on('click', '.upvote-button, .downvote-button', changeQuality);

$('section').on('click', '.delete-button', deleteCard);

$('section').on('click', 'h2, p', editIdea);

$('section').on('focusout', '.edit-title, .edit-idea', editIdeaSave);

$('section').on('keyup', '.edit-title', function(e) {
	if (e.keyCode === 13) {
		$(this).blur();
	}
});

$('section').on('keyup', '.edit-idea', function(e) {
	if (e.keyCode === 13) {
		$(this).blur();
	}
});

$('.search').on('keyup', realtimeSearch)

//collects title and body, runs constructor
function formSubmit() {
	var title = $('.title-input').val();
	var idea = $('.idea-input').val();
	var ideaCard = new IdeaCard(title, idea);
	$('section').prepend(populateCard(ideaCard)); 
	resetHeader();
	sendToLocalStorage();
};

//extracts values from HTML, inputs those values to constructor function which creates an ideaCard
function extractCard(elementInsideArticle) {
	var article = $(elementInsideArticle).closest('article');
	var title = $('.idea-title', article).text();
	var idea = $('.idea-body', article).text();
	var id = article.data('id');
	var quality = $('.quality-span', article).data('quality');
	var ideaCard = new IdeaCard(title, idea, id, quality);
	return ideaCard;
};

//takes values from ideaCard and inserts those values to HTML
function populateCard(ideaCard) {
	var newTitle = ideaCard.title;
	var newIdea = ideaCard.idea;
	var newId = ideaCard.id;
	var newQuality = ideaCard.qualityString();
	return (`<article data-id="${newId}" class="idea-card">  
				<div class="h2-wrapper">
					<h2 class="idea-title">${newTitle}</h2>
					<button class="delete-button">
						<div class="delete-front">
							<img src="assets/delete.svg">
						</div>
					</button>
				</div>
				<p class="idea-body">${newIdea}</p>
				<div class="quality-wrapper">
					<button class="upvote-button">
						<div class="upvote-front">
							<img src="assets/upvote.svg">
						</div>
					</button>
					<button class="downvote-button">
						<div class="downvote-front">
							<img src="assets/downvote.svg">
						</div>
					</button>
					<h5 class="quality">quality: <span data-quality="${ideaCard.quality}" class="quality-span">${newQuality}</span></h5>
				</div>
				<hr>
			</article>`);
};

function changeQuality() {
 	var ideaCard = extractCard(this);
	var currentQuality = ideaCard.quality;
	var indexChange = $(this).hasClass('upvote-button') ? 1:-1;
	var qualityArray = ['swill', 'plausible', 'genius'];
	var nextQuality = currentQuality + indexChange;
	if (qualityArray[nextQuality] !== undefined) {
	ideaCard.quality = nextQuality;
	$(this).closest('article').replaceWith(populateCard(ideaCard));
	sendToLocalStorage();
	};
};

function deleteCard(e) {
	e.preventDefault();
	$(this).closest('article').remove();
	sendToLocalStorage();
};

//edits and saves title and idea
function editIdea() {
	var article = $(this).closest('article');
	$(this).hasClass('idea-title') ? 
	$('h2', article).replaceWith(`<textarea class="idea-title edit-title">${$(this).text()}</textarea>`)
	: $('p', article).replaceWith(`<textarea class="idea-body edit-idea">${$(this).text()}</textarea>`);
	$('textarea').focus();
};

function editIdeaSave() {
	$(this).hasClass('idea-title') ?
	$(this).replaceWith(`<h2 class="idea-title">${$(this).val()}</h2>`)
	: $(this).replaceWith(`<p class="idea-body">${$(this).val()}</p>`);
	var ideaCard = extractCard(this);
	$(this).closest('article').replaceWith(populateCard(ideaCard));
	sendToLocalStorage();
};

//local storage functions
function sendToLocalStorage() {
	var cardArray = [];
	$('article').each(function (index, element) {
		cardArray.push(extractCard(element));
	});
	localStorage.setItem("storedCards", JSON.stringify(cardArray));
};

function getStoredCards() {
	var retrievedCards = JSON.parse(localStorage.getItem("storedCards")) || [];
	retrievedCards.forEach(function (retrievedCard) {
		var ideaCard = new IdeaCard(retrievedCard.title, retrievedCard.idea, retrievedCard.id, retrievedCard.quality);
		$('section').append(populateCard(ideaCard)); 
	});
};

//resets inpus and focus after save
function resetHeader() {
	$('.title-input').focus();
	$('.title-input').val('');
	$('.idea-input').val('');
};

//runs .doYouMatch prototype and adds or removes class to display search matches
function realtimeSearch() {
	var searchTerm = $('.search').val().toUpperCase();
	$('article').each(function (index, element) {
		var ideaCard = extractCard(element);
		if (ideaCard.doYouMatch(searchTerm)) {
			$(element).removeClass('card-display-none');
		} else {
			$(element).addClass('card-display-none');
		};
	});
};
