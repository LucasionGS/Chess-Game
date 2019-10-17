var allCheckers;

window.onload = function () {
  Notif.addStyle();
  resetBoard();
  var checker = document.querySelectorAll(".checkerpiece");
  for (var i = 0; i < checker.length; i++) {
    allCheckers = checker;
    checker[i].setValid = function (force) {
      if (typeof force == "boolean") {
        if (force == true) {
          this.setAttribute("valid", "true");
        }
        else if (force == false) {
          this.removeAttribute("valid");
        }
      }
      else {
        if (this.getAttribute("valid") == true) {
          this.removeAttribute("valid");
        }
        else {
          this.setAttribute("valid", "true");
        }
      }
    }

    checker[i].setKill = function (force) {
      if (typeof force == "boolean") {
        if (force == true) {
          this.setAttribute("kill", "true");
        }
        else if (force == false) {
          this.removeAttribute("kill");
        }
      }
      else {
        if (this.getAttribute("kill") == true) {
          this.removeAttribute("kill");
        }
        else {
          this.setAttribute("kill", "true");
        }
      }
    }

    checker[i].addEventListener("click", function (e) {

      var selected = document.querySelector("img.boardPiece[selected]");
      if (!selected && this.firstChild && this.firstChild.getAttribute("selected") != "true") {
        this.firstChild.setAttribute("selected", "true");
        calculateValidPositions(this.firstChild);
      }
      else if (this.firstChild && this.firstChild.getAttribute("selected") == "true") {
        this.firstChild.removeAttribute("selected");
        clearValids();
      }
      if (selected && this.getAttribute("valid") == "true") {
        // KILL OPPOSITE COLOR IF A PIECE IS ALREADY THERE
        if (this.firstChild && this.firstChild.instance.color != selected.instance.color) {
          this.removeChild(this.firstChild);
          selected.instance.setPos(this);
        }
        else if (
          this.firstChild
          && this.firstChild.instance.color == selected.instance.color
          && this.firstChild.instance.type == "King"
          && !this.firstChild.instance.hasMoved
          && !selected.instance.hasMoved
          && selected.instance.type == "Rook"
        ) {
          var rookPosNumber = convertLetterToValue(selected.parentNode.id.substring(0,1));
          var kingPosNumber = convertLetterToValue(this.id.substring(0,1));
          console.log("SPECIAL MOVE");
          console.log(rookPosNumber);
          console.log(kingPosNumber);
          if (rookPosNumber > kingPosNumber) {
            selected.instance.setPos(getCheckerRelativeTo(this, 1, 0))
            this.firstChild.instance.setPos(getCheckerRelativeTo(this, 2, 0))
          }
          else if (rookPosNumber < kingPosNumber) {
            selected.instance.setPos(getCheckerRelativeTo(this, -1, 0))
            this.firstChild.instance.setPos(getCheckerRelativeTo(this, -2, 0))
          }
        }
        else {
          selected.instance.setPos(this);
        }
      }
    });
  }
}

class Piece {
  constructor(type, color, startChecker) {
    this.type = type.substring(0,1).toUpperCase()+type.substring(1).toLowerCase();
    if (color.substring(0,1).toLowerCase() == "b") {
      this.color = "b";
    }
    else {
      this.color = "w";
    }

    if (typeof startChecker == "string") {
      startChecker = document.querySelector("#"+startChecker.toUpperCase());
    }
    if (typeof startChecker == "object") {
      this.hasMoved = false;
      this.pos = startChecker;
    }

    this.sprite = "./spr/"+this.color+type+".png";

    const piece = document.createElement("img");
    piece.src = this.sprite;
    piece.instance = this;
    piece.className = "boardPiece";
    piece.draggable = false;

    startChecker.appendChild(piece);
    this.object = piece;
  }

  setPos(newPos)
  {
    setPiecePosition(this.object, newPos);
  }

  makeQueen() {
    new Piece("Queen", this.color, this.object.parentNode);
    this.object.parentNode.removeChild(this.object);
  }
}

function setPiecePosition(pieceObject, newPos) {
  if (typeof newPos == "string") {
    newPos = document.querySelector("#"+newPos.toUpperCase());
  }
  if (typeof newPos == "object") {
    newPos.appendChild(pieceObject);
    clearValids();
    clearSelection();
    pieceObject.instance.hasMoved = true;
    if (pieceObject.instance.type == "Pawn") {
      if (pieceObject.instance.color == "w" && newPos.id.includes("1")) {
        pieceObject.instance.makeQueen();
      }
      else if (pieceObject.instance.color == "b" && newPos.id.includes("8")) {
        pieceObject.instance.makeQueen();
      }
    }
  }
}

function calculateValidPositions(pieceObject) {
  var currentPos = pieceObject.parentNode; // Getting the current checkerboard position
  var posLetter = currentPos.getAttribute("id").substring(0,1);
  var posNumber = +currentPos.getAttribute("id").substring(1,2);

  // Pawn movement
  if (pieceObject.instance.type == "Pawn") {
    if (pieceObject.instance.color == "w") {
      var checkerForward = getChecker(posLetter+subFrom(posNumber));
      if (checkerForward && !checkerForward.firstChild) {
        checkerForward.setValid(true);
      }
      if (!pieceObject.instance.hasMoved && !checkerForward.firstChild) {
        checkerForward = getChecker(posLetter+subFrom(posNumber, 2));
        if (checkerForward && !checkerForward.firstChild) {
          checkerForward.setValid(true);
        }
      }

      var checkerForwardLeft = getCheckerAt.UpLeft(currentPos);
      var checkerForwardRight = getCheckerAt.UpRight(currentPos);
      if (checkerForwardLeft != null && checkerForwardLeft.firstChild && checkerForwardLeft.firstChild.instance.color != "w") {
        checkerForwardLeft.setValid(true);
        checkerForwardLeft.setKill(true);
      }
      if (checkerForwardRight != null && checkerForwardRight.firstChild && checkerForwardRight.firstChild.instance.color != "w") {
        checkerForwardRight.setValid(true);
        checkerForwardRight.setKill(true);
      }
    }
    else {
      var checkerForward = getChecker(posLetter+addTo(posNumber));
      if (checkerForward && !checkerForward.firstChild) {
        checkerForward.setValid(true);
      }
      if (!pieceObject.instance.hasMoved) {
        checkerForward = getChecker(posLetter+addTo(posNumber, 2));
        if (checkerForward && !checkerForward.firstChild) {
          checkerForward.setValid(true);
        }
      }

      var checkerForwardLeft = getCheckerAt.DownLeft(currentPos);
      var checkerForwardRight = getCheckerAt.DownRight(currentPos);
      if (checkerForwardLeft != null && checkerForwardLeft.firstChild && checkerForwardLeft.firstChild.instance.color != "b") {
        checkerForwardLeft.setValid(true);
        checkerForwardLeft.setKill(true);
      }
      if (checkerForwardRight != null && checkerForwardRight.firstChild && checkerForwardRight.firstChild.instance.color != "b") {
        checkerForwardRight.setValid(true);
        checkerForwardRight.setKill(true);
      }
    }
  }

  // Rook Movement
  if (pieceObject.instance.type == "Rook") {
    // Check up
    var checkChecker = getCheckerAt.Up(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color && (!(checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved))) {
        break;
      }
      else if ((checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) || (checkChecker.firstChild && checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved)) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Up(checkChecker);
    }

    checkChecker = getCheckerAt.Down(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color && (!(checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved))) {
        break;
      }
      else if ((checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) || (checkChecker.firstChild && checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved)) {
        checkChecker.setValid(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Down(checkChecker);
    }

    checkChecker = getCheckerAt.Left(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color && (!(checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved))) {
        break;
      }
      else if ((checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) || (checkChecker.firstChild && checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved)) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Left(checkChecker);
    }

    checkChecker = getCheckerAt.Right(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color && (!(checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved))) {
        break;
      }
      else if ((checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) || (checkChecker.firstChild && checkChecker.firstChild.instance.type == "King" && !checkChecker.firstChild.instance.hasMoved && !pieceObject.instance.hasMoved)) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Right(checkChecker);
    }
  }

  // Bishop Movement
  if (pieceObject.instance.type == "Bishop") {
    // Check upright
    var checkChecker = getCheckerAt.UpRight(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.UpRight(checkChecker);
    }

    checkChecker = getCheckerAt.UpLeft(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.UpLeft(checkChecker);
    }

    checkChecker = getCheckerAt.DownLeft(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.DownLeft(checkChecker);
    }

    checkChecker = getCheckerAt.DownRight(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.DownRight(checkChecker);
    }
  }

  // Knight Movement
  if (pieceObject.instance.type == "Knight") {
    const validKnightPos = [
      [1,2],
      [1,-2],
      [-1,2],
      [-1,-2],
      [2,1],
      [2,-1],
      [-2,1],
      [-2,-1],
    ];
    for (var i = 0; i < validKnightPos.length; i++) {
      checkChecker = getCheckerRelativeTo(currentPos, validKnightPos[i][0], validKnightPos[i][1]);
      if ((checkChecker != null && !checkChecker.firstChild) || checkChecker != null && checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        if (checkChecker.firstChild) {
          checkChecker.setKill(true);
        }
      }
    }
  }

  // Queen Movement
  if (pieceObject.instance.type == "Queen") {
    // Check upright
    var checkChecker = getCheckerAt.UpRight(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.UpRight(checkChecker);
    }

    checkChecker = getCheckerAt.UpLeft(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.UpLeft(checkChecker);
    }

    checkChecker = getCheckerAt.DownLeft(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.DownLeft(checkChecker);
    }

    checkChecker = getCheckerAt.DownRight(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.DownRight(checkChecker);
    }

    checkChecker = getCheckerAt.Up(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Up(checkChecker);
    }

    checkChecker = getCheckerAt.Down(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Down(checkChecker);
    }

    checkChecker = getCheckerAt.Left(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Left(checkChecker);
    }

    checkChecker = getCheckerAt.Right(currentPos);
    while (checkChecker != null) {
      if (checkChecker == null) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
        break;
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
        break;
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Right(checkChecker);
    }
  }

  // King Movement
  if (pieceObject.instance.type == "King") {
    // Check upright
    var checkChecker = getCheckerAt.UpRight(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.UpRight(checkChecker);
    }

    checkChecker = getCheckerAt.UpLeft(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.UpLeft(checkChecker);
    }

    checkChecker = getCheckerAt.DownLeft(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.DownLeft(checkChecker);
    }

    checkChecker = getCheckerAt.DownRight(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.DownRight(checkChecker);
    }

    checkChecker = getCheckerAt.Up(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Up(checkChecker);
    }

    checkChecker = getCheckerAt.Down(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Down(checkChecker);
    }

    checkChecker = getCheckerAt.Left(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Left(checkChecker);
    }

    checkChecker = getCheckerAt.Right(currentPos);
    {
      if (checkChecker == null) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color == pieceObject.instance.color) {
      }
      else if (checkChecker.firstChild && checkChecker.firstChild.instance.color != pieceObject.instance.color) {
        checkChecker.setValid(true);
        checkChecker.setKill(true);
      }
      else if (!checkChecker.firstChild) {
        checkChecker.setValid(true);
      }
      checkChecker = getCheckerAt.Right(checkChecker);
    }
  }
}

function clearValids() {
  for (var i = 0; i < allCheckers.length; i++) {
    allCheckers[i].removeAttribute("valid");
    allCheckers[i].removeAttribute("kill");
  }
}

function clearSelection() {
  try {
    document.querySelector("img.boardPiece[selected]").removeAttribute("selected");
  }
  catch (e) {}
}

function resetBoard() {
  // Remove any old pieces
  var oldPieces = document.querySelectorAll(".boardPiece");
  for (var i = 0; i < oldPieces.length; i++) {
    oldPieces[i].parentNode.removeChild(oldPieces[i]);
  }

  // Create Pieces
  // White Pieces
  new Piece("Rook", "w", "A8");
  new Piece("Bishop", "w", "B8");
  new Piece("Knight", "w", "C8");
  new Piece("Queen", "w", "D8");
  new Piece("King", "w", "E8");
  new Piece("Knight", "w", "F8");
  new Piece("Bishop", "w", "G8");
  new Piece("Rook", "w", "H8");

  new Piece("Pawn", "w", "A7");
  new Piece("Pawn", "w", "B7");
  new Piece("Pawn", "w", "C7");
  new Piece("Pawn", "w", "D7");
  new Piece("Pawn", "w", "E7");
  new Piece("Pawn", "w", "F7");
  new Piece("Pawn", "w", "G7");
  new Piece("Pawn", "w", "H7");

  // Black Pieces
  new Piece("Rook", "b", "A1");
  new Piece("Bishop", "b", "B1");
  new Piece("Knight", "b", "C1");
  new Piece("Queen", "b", "D1");
  new Piece("King", "b", "E1");
  new Piece("Knight", "b", "F1");
  new Piece("Bishop", "b", "G1");
  new Piece("Rook", "b", "H1");

  new Piece("Pawn", "b", "A2");
  new Piece("Pawn", "b", "B2");
  new Piece("Pawn", "b", "C2");
  new Piece("Pawn", "b", "D2");
  new Piece("Pawn", "b", "E2");
  new Piece("Pawn", "b", "F2");
  new Piece("Pawn", "b", "G2");
  new Piece("Pawn", "b", "H2");
}

function addTo(currentValue, toAdd = 1) {
  if (typeof currentValue == "string") {
    for (var i = 0; i < toAdd; i++) {
      switch (currentValue.substring(0,1).toLowerCase()) {
        case "a":
          currentValue = "b";
          break;

        case "b":
          currentValue = "c";
          break;

        case "c":
          currentValue = "d";
          break;

        case "d":
          currentValue = "e";
          break;

        case "e":
          currentValue = "f";
          break;

        case "f":
          currentValue = "g";
          break;

        case "g":
          currentValue = "h";
          break;

        default:
          return null;
          break;
      }
    }
    return currentValue.toUpperCase();
  }
  else if (typeof currentValue == "number") {
    currentValue += toAdd;
    if (currentValue > 8) {
      return null;
    }
    return currentValue;
  }
}

function subFrom(currentValue, toSub = 1) {
  if (typeof currentValue == "string") {
    for (var i = 0; i < toSub; i++) {
      switch (currentValue.substring(0,1).toLowerCase()) {
        case "h":
          currentValue = "g";
          break;

        case "g":
          currentValue = "f";
          break;

        case "f":
          currentValue = "e";
          break;

        case "e":
          currentValue = "d";
          break;

        case "d":
          currentValue = "c";
          break;

        case "c":
          currentValue = "b";
          break;

        case "b":
          currentValue = "a";
          break;

        default:
          return null;
          break;
      }
    }
    return currentValue.toUpperCase();
  }
  else if (typeof currentValue == "number") {
    currentValue -= toSub;
    if (currentValue < 1) {
      return null;
    }
    return currentValue;
  }
}

function getChecker(id) {
  try {
    return document.querySelector("#"+id.toUpperCase());
  } catch (e) {
      return null;
  }
}

const getCheckerAt = {
  UpRight: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(addTo(posLetter)+subFrom(posNumber));
    } catch (e) {
      return null;
    }
  },
  UpLeft: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(subFrom(posLetter)+subFrom(posNumber));
    } catch (e) {
      return null;
    }
  },
  DownRight: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(addTo(posLetter)+addTo(posNumber));
    } catch (e) {
      return null;
    }
  },
  DownLeft: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(subFrom(posLetter)+addTo(posNumber));
    } catch (e) {
      return null;
    }
  },
  Up: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(posLetter+subFrom(posNumber));
    } catch (e) {
      return null;
    }
  },
  Down: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(posLetter+addTo(posNumber));
    } catch (e) {
      return null;
    }
  },
  Right: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(addTo(posLetter)+posNumber);
    } catch (e) {
      return null;
    }
  },
  Left: function (checkerObject) {
    try {
      var posLetter = checkerObject.getAttribute("id").substring(0,1);
      var posNumber = +checkerObject.getAttribute("id").substring(1,2);

      return getChecker(subFrom(posLetter)+posNumber);
    } catch (e) {
      return null;
    }
  },
}

function getCheckerRelativeTo(checkerObject, relX = 0, relY = 0) {
  try {
    var posLetter = checkerObject.getAttribute("id").substring(0,1);
    var posNumber = +checkerObject.getAttribute("id").substring(1,2);


    if (relX > 0) {

      posLetter = addTo(posLetter, relX);
    }
    else {

      posLetter = subFrom(posLetter, Math.abs(relX));
    }

    if (relY > 0) {
      posNumber = addTo(posNumber, relY);
    }
    else {
      posNumber = subFrom(posNumber, Math.abs(relY));
    }

    return getChecker(posLetter+ posNumber);
  } catch (e) {
    return null;
  }
}

function convertLetterToValue(letter) {
  letter = letter.substring(0,1).toLowerCase();
  if (letter == "a") {
    return 1;
  }
  else if (letter == "b") {
    return 2;
  }
  else if (letter == "c") {
    return 3;
  }
  else if (letter == "d") {
    return 4;
  }
  else if (letter == "e") {
    return 5;
  }
  else if (letter == "f") {
    return 6;
  }
  else if (letter == "g") {
    return 7;
  }
  else if (letter == "h") {
    return 8;
  }
  else {
    return null;
  }
}
