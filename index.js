class Base {
  core;
  classList = [];
  constructor(elementType) {
    const el = document.createElement(elementType);
    this.core = el;
  }
  getCore() {
    return this.core;
  }
  addChild(child) {
    if (child instanceof Base) {
      this.core.appendChild(child.getCore());
    } else if (typeof child == "string") {
      this.core.appendChild(document.createTextNode(child));
    }
    return this;
  }
  addStyle(style) {
    for (let s in style) {
      this.core.style[s] = style[s];
    }
    return this;
  }
  setType(type) {
    this.core.type = type;
    return this;
  }
  addClass(newClass) {
    this.core.classList.remove(...this.classList);
    this.classList = [newClass, ...this.classList];
    this.core.classList.add(...this.classList);
    return this;
  }
  removeClass(newClass) {
    this.core.classList.remove(newClass);
    return this;
  }
  on(eventType, callbackFn) {
    this.core.addEventListener(eventType, callbackFn);
    return this;
  }
}

class Div extends Base {
  constructor() {
    super("div");
  }
}

class Flex extends Div {
  constructor() {
    super();
    this.addClass("base-flex");
  }
}

class Center extends Div {
  constructor() {
    super();
    this.addClass("base-center");
  }
}

class Button extends Base {
  constructor() {
    super("button");
    this.addClass("base-button");
  }
}

class Input extends Base {
  constructor() {
    super("input");
    this.addClass("base-input");
  }
}

class Vars {
  value;
  revokeFunctions = [];
  constructor(initialValue) {
    if (initialValue) {
      this.value = initialValue;
    }
  }
  getVal() {
    return this.value;
  }
  set(newValue) {
    this.value = newValue;
    for (let fn in this.revokeFunctions) {
      this.revokeFunctions[fn](this.value);
    }
  }
  sub(fn) {
    this.revokeFunctions.push(fn);
  }
  innerHTMLSub(node) {
    if (node instanceof Base) {
      this.revokeFunctions.push((v) => (node.getCore().innerHTML = v));
      node.getCore().innerHTML = this.value || "";
      return;
    }

    node.innerHTML = this.value;
    this.revokeFunctions.push((v) => {
      node.innerHTML = v;
    });
  }
}

const pageVars = new Vars("main-menu");
const notifVars = new Vars("Put Your Bet and Play your move!");
const scoreVars = new Vars(0);
const balanceVars = new Vars(0);
const betVars = new Vars(0);
const botText = new Vars(0);
const playerText = new Vars(0);

const currentBalance = localStorage.getItem("balance");
currentBalance && balanceVars.set(currentBalance.parseInt());

const app = new Div();

const navbar = new Center().addClass("navbar");

const title = new Div().addClass("title").addChild("JANKEPON");
navbar.addChild(title);

const buttons = new Flex().addClass("buttons");

const resetButton = new Button()
  .addClass("btn-reset")
  .addChild("Reset")
  .on("click", () => {
    console.log("test");
  });

const renameButton = new Button()
  .addClass("btn-rename")
  .addChild("Rename")
  .on("click", () => {
    console.log("test");
  });

const lightDarkButton = new Button()
  .addClass("btn-lightdark")
  .addChild("Light");

buttons.addChild(resetButton).addChild(renameButton).addChild(lightDarkButton);

navbar.addChild(buttons);

app.addChild(navbar);

const mainMenu = new Flex();
pageVars.sub((v) =>
  mainMenu.addStyle({ display: v == "main-menu" ? "flex" : "none" })
);

const menu = new Flex().addClass("menu");

menu.addChild(
  new Div().addChild("MENU").addStyle({
    fontSize: "2em",
    color: "white",
    margin: "0.7em 0",
  })
);
menu.addChild(
  new Div().addChild("Hello, " + localStorage.getItem("username")).addStyle({
    fontSize: "1.6em",
    color: "white",
    margin: "0.2em 0",
  })
);

const startButton = new Button()
  .addClass("btn-start")
  .addChild("START GAME !")
  .on("click", () => pageVars.set("game"));

menu.addChild(startButton);

mainMenu.addChild(menu);

app.addChild(mainMenu);

const compare = (playerWeap, botWeap) => {
  if (playerWeap - botWeap <= -1) {
    return 1;
  } else if (playerWeap - botWeap <= 0) {
    return -1;
  } else if (playerWeap - botWeap <= 1) {
    return 0;
  } else if (playerWeap - botWeap <= 2) {
    return 1;
  } else {
    return -1;
  }
};

const play = (playerWeap) => {
  const botWeap = Math.random() * 3;
  const result = compare(playerWeap, botWeap);
  console.log(botWeap, result);
  botText.set(botWeap <= 1 ? "ROCK" : botWeap <= 2 ? "PAPER" : "SCRISSOR");
  playerText.set(
    playerWeap == 1 ? "ROCK" : playerWeap == 2 ? "PAPER" : "SCRISSOR"
  );
  if (result == -1) {
    notifVars.set("Unfortunately, you noob, rip");
  } else if (result == 0) {
    notifVars.set("You <3 Bot");
  } else {
    notifVars.set("Well done, you get");
  }
};

const game = new Flex().addClass("game").addStyle({ display: "none" });
pageVars.sub((v) => game.addStyle({ display: v == "game" ? "flex" : "none" }));

const notif = new Flex().addClass("notif");
notifVars.innerHTMLSub(notif);

game.addChild(notif);

const betUI = new Flex().addClass("bet-ui");

const betInput = new Input()
  .setType("number")
  .on("change", (event) => betVars.set(event.target.value));

const betButton = new Button().addChild("Set My Bet");

betUI.addChild(betInput);
betUI.addChild(betButton);

game.addChild(betUI);

const rpsUI = new Flex().addClass("rps-ui");

const p1 = new Flex();
playerText.innerHTMLSub(p1);
const p2 = new Flex();
botText.innerHTMLSub(p2);

rpsUI.addChild(p1).addChild("VS").addChild(p2);

game.addChild(rpsUI);

const rpsInfo = new Flex()
  .addChild(new Div().addChild("YOU").addStyle({ color: "blue" }))
  .addChild(new Div().addChild("BOT").addStyle({ color: "red" }))
  .addClass("rps-info");

const score = new Flex().addClass('score');
scoreVars.sub((v) => (score.innerHTML = `Your Score : ${v}`));

game.addChild(rpsInfo).addChild(score);

const rpsPlay = new Flex().addClass("rps-play");
const buttonRock = new Button()
  .addChild("PLAY ROCK")
  .addClass("btn-rock")
  .on("click", () => play(1));
const buttonPaper = new Button()
  .addChild("PLAY PAPER")
  .addClass("btn-paper")
  .on("click", () => play(2));
const buttonScrissor = new Button()
  .addChild("PLAY SCRISSOR")
  .addClass("btn-scrissor")
  .on("click", () => play(3));
rpsPlay.addChild(buttonRock).addChild(buttonPaper).addChild(buttonScrissor);

game.addChild(rpsPlay);

app.addChild(game);

const root = document.getElementById("root");
root.appendChild(app.getCore());
