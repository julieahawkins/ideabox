$(document).ready(function() {
	$('.title-input').focus();
	getStoredCards();
});


$('.save-button').on('click', formSubmit);
$('section').on('click', '.upvote-button, .downvote-button', changeQuality);
$('section').on('click', '.delete-button', deleteCard);
$('section').on('click', 'h2, p', editIdea);
$('section').on('focusout', '.edit-title, .edit-idea', editIdeaSave);
$('section').on('keyup', '.edit-title, .edit-idea', function(e) {
	if (e.keyCode === 13) {
		$(this).blur();
	}
});
$('.search').on('keyup', realtimeSearch)


function getStoredCards() {
	var retrievedCards = JSON.parse(localStorage.getItem("storedCards")) || [];
	retrievedCards.forEach(function(retrievedCard) {
		var ideaCard = new IdeaCard(retrievedCard.title, retrievedCard.idea, retrievedCard.id, retrievedCard.quality);
		$('section').append(populateCard(ideaCard)); 
	});
};

function sendToLocalStorage() {
	var cardArray = [];
	$('article').each(function (index, element) {
		cardArray.push(extractCard(element));
	});
	localStorage.setItem("storedCards", JSON.stringify(cardArray));
};

function formSubmit(e) {
	e.preventDefault();
	var title = $('.title-input').val();
	var idea = $('.idea-input').val();
	var ideaCard = new IdeaCard(title, idea);
	$('section').prepend(populateCard(ideaCard)); 
	resetHeader();
	sendToLocalStorage();
};

function resetHeader() {
	$('.title-input').focus();
	$('.title-input').val('');
	$('.idea-input').val('');
};

function extractCard(elementInsideArticle) {
	var article = $(elementInsideArticle).closest('article');
	var title = $('.idea-title', article).text();
	var idea = $('.idea-body', article).text();
	var id = article.data('id');
	var quality = $('.quality-span', article).data('quality');
	var ideaCard = new IdeaCard(title, idea, id, quality);
	return ideaCard;
};

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

var IdeaCard = function(title, idea, id = Date.now(), quality = 0) {
	this.title = title;
	this.idea = idea;
	this.id = id; 
	this.quality = quality;
};

IdeaCard.prototype.qualityString = function() {
	var qualityArray = ['swill', 'plausible', 'genius'];
	return qualityArray[this.quality]; 
};

IdeaCard.prototype.doYouMatch = function(searchTerm) {
	if (this.title.toUpperCase().includes(searchTerm) 
		|| this.idea.toUpperCase().includes(searchTerm) 
		|| this.qualityString().toUpperCase().includes(searchTerm)) {
		return true;
	} else {
		return false;
	}
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

function realtimeSearch() {
	var searchTerm = $('.search').val().toUpperCase();
	$('article').each(function (index, element) {
		var ideaCard = extractCard(element);
		ideaCard.doYouMatch(searchTerm) ? $(element).removeClass('card-display-none') 
		: $(element).addClass('card-display-none');
	});
};
