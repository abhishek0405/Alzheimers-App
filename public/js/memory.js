const cards = document.querySelectorAll('.memory-card');

let hasFlippedCard = false;
let firstCard, secondCard;
let lockBoard = false;
let count = 0;



function flipCard(){
	if(lockBoard) return;
	if(this == firstCard) return;

	console.log('1 card clicked');
	console.log(this);
	this.classList.toggle('flip');

	if(!hasFlippedCard) {
		hasFlippedCard = true;
		firstCard = this;

		console.log(hasFlippedCard, firstCard);
	} else {
		hasFlippedCard = false;
		secondCard = this;

		//console.log({firstCard, secondCard});
		console.log(firstCard.dataset.framework);
		console.log(secondCard.dataset.framework);

		if(firstCard.dataset.framework === secondCard.dataset.framework){
			count++;
			firstCard.removeEventListener('click', flipCard);
			secondCard.removeEventListener('click', flipCard);
		}else{
			lockBoard = true;
			 setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');

    lockBoard = false;

    resetBoard();
  }, 1000);

		}


	}
	if(count==6)
	{
		document.getElementById("win").innerHTML = "You win";
		document.getElementById("play-again").innerHTML = "Play again";
		count = 0;
	}
}


function resetBoard(){
	hasFlippedCard = false;
	lockBoard = false;
	firstCard = null;
	secondCard = null;
}


(function shuffle(){
	cards.forEach(card => {
		 let randomPos = Math.floor(Math.random() * 12);
    	card.style.order = randomPos;
	});

})();


cards.forEach(card => card.addEventListener('click', flipCard));
