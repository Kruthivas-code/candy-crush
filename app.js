document.addEventListener('DOMContentLoaded', () => {
const grid = document.querySelector('.grid')
const scoreDisplay = document.getElementById('score')
const width = 8
const squares = []
let score = 0
let gameStarted = false // Flag to control when match checking begins

// Initialize score display
scoreDisplay.innerHTML = score

const candyColors = [
    'url(images/red-candy.png)',
    'url(images/yellow-candy.png)',
    'url(images/orange-candy.png)',
    'url(images/purple-candy.png)',
    'url(images/green-candy.png)',
    'url(images/blue-candy.png)'
  ]

//create your board
function createBoard() {
  for (let i = 0; i < width*width; i++) {
    const square = document.createElement('div')
    square.setAttribute('draggable', true)
    square.setAttribute('id', i)
    
    // Generate candy that doesn't create initial matches
    let randomColor = getValidCandyColor(i)
    square.style.backgroundImage = candyColors[randomColor]
    grid.appendChild(square)
    squares.push(square)
  }
  
  // Start the stacking animation after board creation
  startStackingAnimation()
}

// Function to get a candy color that won't create initial matches
function getValidCandyColor(position) {
  const availableColors = [0, 1, 2, 3, 4, 5] // All candy colors
  
  // Check left neighbors (avoid horizontal matches)
  const leftColors = []
  if (position % width >= 2) { // If we have at least 2 left neighbors
    const left1 = getCandyColorIndex(position - 1)
    const left2 = getCandyColorIndex(position - 2)
    if (left1 === left2) {
      leftColors.push(left1)
    }
  }
  
  // Check top neighbors (avoid vertical matches)
  const topColors = []
  if (Math.floor(position / width) >= 2) { // If we have at least 2 top neighbors
    const top1 = getCandyColorIndex(position - width)
    const top2 = getCandyColorIndex(position - width * 2)
    if (top1 === top2) {
      topColors.push(top1)
    }
  }
  
  // Filter out colors that would create matches
  const invalidColors = [...leftColors, ...topColors]
  const validColors = availableColors.filter(color => !invalidColors.includes(color))
  
  // Return a random valid color, or fallback to any color if none valid
  return validColors.length > 0 
    ? validColors[Math.floor(Math.random() * validColors.length)]
    : Math.floor(Math.random() * candyColors.length)
}

// Helper function to get candy color index from position
function getCandyColorIndex(position) {
  if (position < 0 || position >= squares.length || !squares[position]) return -1
  const backgroundImage = squares[position].style.backgroundImage
  return candyColors.indexOf(backgroundImage)
}

// Stacking animation function
function startStackingAnimation() {
  const columns = 8
  
  for (let col = 0; col < columns; col++) {
    setTimeout(() => {
      // Animate all squares in this column
      for (let row = 0; row < width; row++) {
        const squareIndex = row * width + col
        const square = squares[squareIndex]
        
        if (square) {
          // Add staggered delay within column for extra effect
          setTimeout(() => {
            square.classList.add('stack-animate')
          }, row * 50) // 50ms delay between rows within the same column
        }
      }
    }, col * 200) // 200ms delay between columns as requested
  }
}
createBoard()

// Dragging the Candy
let colorBeingDragged
let colorBeingReplaced
let squareIdBeingDragged
let squareIdBeingReplaced

// Click-to-swap mechanism for better mobile support
let selectedSquare = null

squares.forEach(square => square.addEventListener('dragstart', dragStart))
squares.forEach(square => square.addEventListener('dragend', dragEnd))
squares.forEach(square => square.addEventListener('dragover', dragOver))
squares.forEach(square => square.addEventListener('dragenter', dragEnter))
squares.forEach(square => square.addEventListener('drageleave', dragLeave))
squares.forEach(square => square.addEventListener('drop', dragDrop))
// Add click support for mobile/easier interaction
squares.forEach(square => square.addEventListener('click', clickToSwap))

function dragStart(){
    colorBeingDragged = this.style.backgroundImage
    squareIdBeingDragged = parseInt(this.id)
    // this.style.backgroundImage = ''
}

function dragOver(e) {
    e.preventDefault()
}

function dragEnter(e) {
    e.preventDefault()
}

function dragLeave() {
    // Don't clear the image during drag leave - it causes visual issues
}

function dragDrop() {
    colorBeingReplaced = this.style.backgroundImage
    squareIdBeingReplaced = parseInt(this.id)
    this.style.backgroundImage = colorBeingDragged
    squares[squareIdBeingDragged].style.backgroundImage = colorBeingReplaced
}

function dragEnd() {
    //What is a valid move?
    let validMoves = [
        squareIdBeingDragged - 1, // left
        squareIdBeingDragged - width, // up  
        squareIdBeingDragged + 1, // right
        squareIdBeingDragged + width // down
    ]
    
    // Check row boundaries for left/right moves
    let currentRow = Math.floor(squareIdBeingDragged / width)
    let replacedRow = Math.floor(squareIdBeingReplaced / width)
    
    // Remove invalid horizontal moves that cross row boundaries
    if (squareIdBeingReplaced === squareIdBeingDragged - 1 && currentRow !== replacedRow) {
        validMoves = validMoves.filter(move => move !== squareIdBeingReplaced)
    }
    if (squareIdBeingReplaced === squareIdBeingDragged + 1 && currentRow !== replacedRow) {
        validMoves = validMoves.filter(move => move !== squareIdBeingReplaced)
    }
    
    let validMove = validMoves.includes(squareIdBeingReplaced)

    if (squareIdBeingReplaced && validMove) {
        // Valid move - keep the swap and reset variables
        colorBeingDragged = null
        colorBeingReplaced = null
        squareIdBeingDragged = null
        squareIdBeingReplaced = null
    }  else if (squareIdBeingReplaced && !validMove) {
        // Invalid move - revert the swap
        squares[squareIdBeingReplaced].style.backgroundImage = colorBeingReplaced
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged
    } else {
        // No target - revert dragged element
        squares[squareIdBeingDragged].style.backgroundImage = colorBeingDragged
    }
}

//drop candies once some have been cleared
function moveIntoSquareBelow() {
    for (i = 0; i < (width * width - width); i ++) { // Fixed: ensure we don't go beyond grid bounds
        if(squares[i + width] && squares[i + width].style.backgroundImage === '') {
            squares[i + width].style.backgroundImage = squares[i].style.backgroundImage
            squares[i].style.backgroundImage = ''
            const firstRow = [0, 1, 2, 3, 4, 5, 6, 7]
            const isFirstRow = firstRow.includes(i)
            if (isFirstRow && (squares[i].style.backgroundImage === '')) {
              let randomColor = Math.floor(Math.random() * candyColors.length)
              squares[i].style.backgroundImage = candyColors[randomColor]
              
              // Ensure new candy is visible and properly animated
              squares[i].style.opacity = '1'
              squares[i].style.transform = 'translateY(0) scale(1)'
              
              // Remove any previous animation classes and add current ones
              squares[i].classList.remove('stack-animate')
              squares[i].classList.add('animate-in')
              
              // Add a small drop animation for new candies
              squares[i].style.animation = 'none'
              setTimeout(() => {
                squares[i].style.animation = 'newCandyDrop 0.3s ease-out'
              }, 10)
            }
        }
    }
}


///Checking for Matches
//for row of Four
  function checkRowForFour() {
    for (i = 0; i < 60; i ++) {
      let rowOfFour = [i, i+1, i+2, i+3]
      let decidedColor = squares[i].style.backgroundImage
      const isBlank = squares[i].style.backgroundImage === ''

      const notValid = [5, 6, 7, 13, 14, 15, 21, 22, 23, 29, 30, 31, 37, 38, 39, 45, 46, 47, 53, 54, 55]
      if (notValid.includes(i)) continue

      if(rowOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
        score += 4
        scoreDisplay.innerHTML = score
        rowOfFour.forEach(index => {
        squares[index].style.backgroundImage = ''
        })
      }
    }
  }
  // Remove initial match checking - only check after user interaction
  // checkRowForFour()

//for column of Four
  function checkColumnForFour() {
    for (i = 0; i < 39; i ++) {
      let columnOfFour = [i, i+width, i+width*2, i+width*3]
      let decidedColor = squares[i].style.backgroundImage
      const isBlank = squares[i].style.backgroundImage === ''

      if(columnOfFour.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
        score += 4
        scoreDisplay.innerHTML = score
        columnOfFour.forEach(index => {
        squares[index].style.backgroundImage = ''
        })
      }
    }
checkColumnForFour()

  //for row of Three
  function checkRowForThree() {
    for (i = 0; i < 61; i ++) {
      let rowOfThree = [i, i+1, i+2]
      let decidedColor = squares[i].style.backgroundImage
      const isBlank = squares[i].style.backgroundImage === ''

      const notValid = [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55]
      if (notValid.includes(i)) continue

      if(rowOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
        score += 3
        scoreDisplay.innerHTML = score
        rowOfThree.forEach(index => {
        squares[index].style.backgroundImage = ''
        })
      }
    }
  }
  // Remove initial match checking - only check after user interaction
  // checkRowForThree()

//for column of Three
  function checkColumnForThree() {
    for (i = 0; i < 47; i ++) {
      let columnOfThree = [i, i+width, i+width*2]
      let decidedColor = squares[i].style.backgroundImage
      const isBlank = squares[i].style.backgroundImage === ''

      if(columnOfThree.every(index => squares[index].style.backgroundImage === decidedColor && !isBlank)) {
        score += 3
        scoreDisplay.innerHTML = score
        columnOfThree.forEach(index => {
        squares[index].style.backgroundImage = ''
        })
      }
    }
checkColumnForThree()

// Checks carried out indefintely - Add Button to clear interval for best practise, or clear on game over/game won. If you have this indefinite check you can get rid of calling the check functions above.
window.setInterval(function(){
    // Only check for matches after the game has started (user has made first move)
    if (gameStarted) {
        checkRowForFour()
        checkColumnForFour()
        checkRowForThree()
        checkColumnForThree()
        moveIntoSquareBelow()
    }
  }, 100)

// Click-to-swap functionality (easier than drag and drop)
function clickToSwap() {
    const clickedId = parseInt(this.id)
    
    if (selectedSquare === null) {
        // First click - select the square with box-shadow instead of border
        selectedSquare = clickedId
        this.style.boxShadow = 'inset 0 0 0 3px white'
        console.log('Selected square:', clickedId)
    } else if (selectedSquare === clickedId) {
        // Clicking the same square - deselect
        this.style.boxShadow = 'none'
        selectedSquare = null
        console.log('Deselected square')
    } else {
        // Second click - attempt swap
        const isValidMove = checkValidMove(selectedSquare, clickedId)
        
        if (isValidMove) {
            // Perform the swap
            const selectedSquareElement = squares[selectedSquare]
            const clickedSquareElement = squares[clickedId]
            
            const tempImage = selectedSquareElement.style.backgroundImage
            selectedSquareElement.style.backgroundImage = clickedSquareElement.style.backgroundImage
            clickedSquareElement.style.backgroundImage = tempImage
            
            // Enable match checking after first user move
            gameStarted = true
            
            console.log('Swapped squares:', selectedSquare, 'and', clickedId)
        } else {
            console.log('Invalid move from', selectedSquare, 'to', clickedId)
        }
        
        // Clear selection using box-shadow
        squares[selectedSquare].style.boxShadow = 'none'
        selectedSquare = null
    }
}

function checkValidMove(from, to) {
    const validMoves = [
        from - 1, // left
        from - width, // up  
        from + 1, // right
        from + width // down
    ]
    
    // Check row boundaries for left/right moves
    const fromRow = Math.floor(from / width)
    const toRow = Math.floor(to / width)
    
    // Remove invalid horizontal moves that cross row boundaries
    if (to === from - 1 && fromRow !== toRow) {
        return false
    }
    if (to === from + 1 && fromRow !== toRow) {
        return false
    }
    
    return validMoves.includes(to)
}

})
